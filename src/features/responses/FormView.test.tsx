import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { FormView } from './FormView';
import { responsesApi } from '@/features/responses/responsesApi';
import responsesReducer, {
  DEMO_FORM_ID,
} from '@/features/responses/responsesSlice';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { ApiError } from '@/lib/apiClient';
import type { FormRead, QuestionResponse } from '@/types/api';

const form: FormRead = {
  id: DEMO_FORM_ID,
  name: '[Demonstração] Formulário de teste',
  organization_id: '00000000-0000-0000-0000-000000000001',
  status: 'draft',
  created_at: '2026-09-30T18:38:18Z',
};

function question(
  id: string,
  section: QuestionResponse['section'],
  order_index: number,
  required = true,
): QuestionResponse {
  return {
    id,
    form_id: DEMO_FORM_ID,
    text: `Texto da ${id}`,
    order_index,
    type: 'descriptive',
    section,
    required,
    prisma: null,
    created_at: '2026-09-30T18:38:18Z',
  };
}

// Duas seções de três perguntas. A última da seção 2 é opcional (P-038).
const perguntas: QuestionResponse[] = [
  question('p1', 'profile', 0),
  question('p2', 'profile', 1),
  question('p3', 'profile', 2),
  question('a1', 'assessment', 3),
  question('a2', 'assessment', 4),
  question('a3', 'assessment', 5, false),
];

function ReviewRouteProbe() {
  const location = useLocation();
  const state = location.state as {
    questions?: {
      text: string;
      answer: string | null;
      required: boolean;
    }[];
  } | null;
  const questions = state?.questions ?? [];
  const demonstracao = questions.filter(({ text }) =>
    text.startsWith('[Demonstração'),
  ).length;

  return (
    <div>
      <h1>Revisão</h1>
      <p>{`Quantidade: ${String(questions.length)}`}</p>
      <p>{questions[0]?.text}</p>
      <p>{questions[0]?.answer}</p>
      <p>{`Opcional: ${questions[5]?.required === false ? 'sim' : 'não'}`}</p>
      <p>{`Demonstração: ${String(demonstracao)}`}</p>
    </div>
  );
}

describe('FormView', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function comPerguntas(lista: QuestionResponse[] = perguntas) {
    vi.spyOn(responsesApi, 'getForm').mockResolvedValue(form);
    return vi.spyOn(responsesApi, 'listQuestions').mockResolvedValue(lista);
  }

  function renderizar() {
    const store = configureStore({ reducer: { responses: responsesReducer } });
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/form']}>
          <Routes>
            <Route path="/form" element={<FormView />} />
            <Route
              path="/questionario/revisao"
              element={<ReviewRouteProbe />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );
  }

  // Renderiza e espera a primeira pergunta vinda do "back".
  async function renderizarCarregado(lista?: QuestionResponse[]) {
    comPerguntas(lista);
    renderizar();
    await screen.findByText(/Pergunta 1 de/);
  }

  async function avancar() {
    await userEvent.click(screen.getByRole('button', { name: /Avançar/i }));
  }

  // Responde a pergunta que está na tela (texto, escala ou alternativa) e
  // clica em Avançar.
  async function responderEAvancar(quantidade = 1) {
    for (let i = 0; i < quantidade; i++) {
      const campo = screen.queryByRole('textbox');
      if (campo) {
        await userEvent.type(campo, 'Minha resposta');
      } else {
        const [primeiraOpcao] = screen.getAllByRole('radio');
        if (!primeiraOpcao) throw new Error('alternativa não encontrada');
        await userEvent.click(primeiraOpcao);
      }
      await avancar();
    }
  }

  function valorDaBarra() {
    return Number(
      screen.getByRole('progressbar').getAttribute('aria-valuenow'),
    );
  }

  describe('carregamento', () => {
    it('busca o formulário de demonstração no back', async () => {
      const listQuestions = comPerguntas();
      renderizar();

      expect(screen.getByRole('status')).toHaveTextContent('Carregando');
      await screen.findByText('Texto da p1');
      expect(listQuestions).toHaveBeenCalledWith(DEMO_FORM_ID);
    });

    it('mostra o erro e tenta de novo', async () => {
      vi.spyOn(responsesApi, 'getForm')
        .mockRejectedValueOnce(new ApiError('não achou', 404))
        .mockResolvedValue(form);
      vi.spyOn(responsesApi, 'listQuestions').mockResolvedValue(perguntas);
      renderizar();

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Questionário não encontrado.',
      );

      await userEvent.click(
        screen.getByRole('button', { name: 'Tentar novamente' }),
      );
      expect(await screen.findByText('Texto da p1')).toBeInTheDocument();
    });

    it('avisa quando o formulário não tem pergunta', async () => {
      comPerguntas([]);
      renderizar();

      expect(
        await screen.findByText('Este questionário ainda não tem perguntas.'),
      ).toBeInTheDocument();
    });

    it('não mostra pergunta objetiva', async () => {
      await renderizarCarregado([
        question('p1', 'profile', 0),
        { ...question('obj', 'profile', 1), type: 'objective' },
      ]);

      expect(screen.getByText(/Pergunta 1 de 1/)).toBeInTheDocument();
      expect(screen.queryByText('Texto da obj')).not.toBeInTheDocument();
    });
  });

  it('should render header with title and user name', async () => {
    await renderizarCarregado();

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Formulário')).toBeInTheDocument();
  });

  it('should render first question of section 1 with the text from the back', async () => {
    await renderizarCarregado();

    expect(screen.getByText(/Pergunta 1 de 3/)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Texto da p1' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should move the progress only when advancing an answered question', async () => {
    await renderizarCarregado();

    expect(valorDaBarra()).toBe(0);

    // Escrever ainda não conta.
    await userEvent.type(screen.getByRole('textbox'), 'Resposta');
    expect(valorDaBarra()).toBe(0);

    // Avançar com a resposta escrita conta: 1 de 3 da seção.
    await avancar();
    expect(valorDaBarra()).toBeCloseTo(100 / 3);

    // Avançar sem responder não conta.
    await avancar();
    expect(valorDaBarra()).toBeCloseTo(100 / 3);

    // Voltar à pergunta pulada e responder também só conta ao avançar.
    await userEvent.click(screen.getByRole('button', { name: /Voltar/i }));
    await userEvent.type(screen.getByRole('textbox'), 'Outra');
    expect(valorDaBarra()).toBeCloseTo(100 / 3);
    await avancar();
    expect(valorDaBarra()).toBeCloseTo(200 / 3);
  });

  it('should keep the answer when going back to a question', async () => {
    await renderizarCarregado();

    await userEvent.type(screen.getByRole('textbox'), 'Guardada');
    await avancar();
    await userEvent.click(screen.getByRole('button', { name: /Voltar/i }));

    expect(screen.getByRole('textbox')).toHaveValue('Guardada');
  });

  it('should slide the question in from the side of the button clicked', async () => {
    await renderizarCarregado();

    function blocoDaPergunta() {
      return screen
        .getByRole('heading', { level: 2 })
        .closest('[data-direcao]');
    }

    await avancar();
    expect(blocoDaPergunta()).toHaveAttribute('data-direcao', 'avancar');
    expect(blocoDaPergunta()).toHaveClass('slide-in-from-right-4');

    await userEvent.click(screen.getByRole('button', { name: /Voltar/i }));
    expect(blocoDaPergunta()).toHaveAttribute('data-direcao', 'voltar');
    expect(blocoDaPergunta()).toHaveClass('slide-in-from-left-4');
  });

  it('should go to the first question of a section by clicking its tab', async () => {
    await renderizarCarregado();

    // Seção 2 ainda não foi vista: a aba fica bloqueada.
    expect(screen.getByRole('button', { name: 'Seção 2' })).toBeDisabled();

    await responderEAvancar(4);
    expect(screen.getByText('Seção 2', { selector: 'p' })).toBeInTheDocument();
    // Seção 2: as 3 do back e as 2 de demonstração.
    expect(screen.getByText(/Pergunta 2 de 5/)).toBeInTheDocument();

    // Volta pela aba: cai na primeira pergunta da seção 1.
    await userEvent.click(screen.getByRole('button', { name: 'Seção 1' }));
    expect(screen.getByText('Seção 1', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText(/Pergunta 1 de 3/)).toBeInTheDocument();

    // A seção 2 continua liberada: dá para ir e vir.
    const abaSecao2 = screen.getByRole('button', { name: 'Seção 2' });
    expect(abaSecao2).toBeEnabled();
    await userEvent.click(abaSecao2);
    expect(screen.getByText('Seção 2', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText(/Pergunta 1 de 5/)).toBeInTheDocument();
  });

  it('should go back to a section from the completion screen', async () => {
    await renderizarCarregado();

    await responderEAvancar(6);
    await userEvent.click(screen.getByRole('button', { name: 'Seção 1' }));

    expect(screen.getByText('Seção 1', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText(/Pergunta 1 de 3/)).toBeInTheDocument();
  });

  it('should disable voltar button on first question', async () => {
    await renderizarCarregado();

    expect(screen.getByRole('button', { name: /Voltar/i })).toBeDisabled();
  });

  it('should go back to the last question of the previous section', async () => {
    await renderizarCarregado();

    await responderEAvancar(3);
    await userEvent.click(screen.getByRole('button', { name: /Voltar/i }));

    expect(screen.getByText('Seção 1', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText(/Pergunta 3 de 3/)).toBeInTheDocument();
  });

  it('should change section when finishing all questions in section 1', async () => {
    await renderizarCarregado();

    await responderEAvancar(3);

    expect(screen.getByText('Seção 2', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText(/Pergunta 1 de 5/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Seção 2' })).toHaveAttribute(
      'aria-current',
      'step',
    );
    expect(screen.getByRole('button', { name: 'Seção 1' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('should translate texts when changing language', async () => {
    await i18n.changeLanguage('en');
    comPerguntas();
    renderizar();

    expect(await screen.findByText(/Question 1 of 3/)).toBeInTheDocument();
    expect(screen.getByText('Form')).toBeInTheDocument();
  });

  it('should render icon buttons in header with accessible names', async () => {
    await renderizarCarregado();

    expect(screen.getByRole('button', { name: 'Painel' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Formulário' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Informações' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument();
    expect(screen.getByAltText('CREED.ai')).toBeInTheDocument();
  });

  it('should show completion message when all questions are answered', async () => {
    await renderizarCarregado();

    // As 6 do back e as 2 de demonstração.
    await responderEAvancar(8);

    expect(
      screen.getByRole('heading', { name: 'Todas as perguntas respondidas' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Revisar e enviar' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100',
    );
    expect(screen.getByText('8 de 8 respondidas')).toBeInTheDocument();
    for (const aba of screen.getAllByRole('button', { name: /^Seção/ })) {
      expect(aba).not.toHaveAttribute('aria-current');
    }
  });

  it('should not leave the section with unanswered required questions', async () => {
    await renderizarCarregado();

    // Responde a 1, pula a 2, responde a 3 e tenta sair da seção.
    await responderEAvancar();
    await avancar();
    await responderEAvancar();

    // Continua na seção 1, na pergunta que faltou, com o aviso.
    expect(screen.getByText('Seção 1', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText(/Pergunta 2 de 3/)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Responda as perguntas obrigatórias da seção para avançar.',
    );

    // Respondeu a que faltava: o aviso some.
    await userEvent.type(screen.getByRole('textbox'), 'Agora sim');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    // Agora dá para sair.
    await avancar();
    await avancar();
    expect(screen.getByText('Seção 2', { selector: 'p' })).toBeInTheDocument();
  });

  it('should let an optional question stay blank (P-038)', async () => {
    await renderizarCarregado();

    // Seção 1 inteira, e na seção 2 as duas obrigatórias; a opcional fica vazia.
    await responderEAvancar(5);
    await avancar();
    // A seção de demonstração também é opcional: passa em branco.
    await avancar();
    await avancar();

    expect(
      screen.getByRole('heading', { name: 'Você chegou ao fim das perguntas' }),
    ).toBeInTheDocument();
    expect(screen.getByText('5 de 8 respondidas')).toBeInTheDocument();
    // A seção 2 conta como concluída: a opcional em branco não tira o check.
    expect(
      screen.getByRole('button', { name: 'Seção 2' }).querySelector('svg'),
    ).not.toBeNull();
  });

  it('should not mark an optional-only section as done before passing through it', async () => {
    // O formato do formulário de demonstração: a seção 3 só tem opcional.
    await renderizarCarregado([
      question('p1', 'profile', 0),
      question('a1', 'assessment', 1),
      question('c1', 'closing', 2, false),
    ]);

    function temCheck(nome: string) {
      return (
        screen.getByRole('button', { name: nome }).querySelector('svg') !== null
      );
    }

    expect(temCheck('Seção 3')).toBe(false);

    // Chega na seção 3 (passando em branco pelas 2 de demonstração da
    // seção 2): ainda sem check, a pessoa está nela.
    await responderEAvancar(2);
    await avancar();
    await avancar();
    expect(screen.getByText('Seção 3', { selector: 'p' })).toBeInTheDocument();
    expect(temCheck('Seção 3')).toBe(false);

    // Passa por ela em branco: agora conta como concluída (P-038).
    await avancar();
    expect(temCheck('Seção 3')).toBe(true);
  });

  it('should only mark a tab as done when its section is complete', async () => {
    await renderizarCarregado();

    await responderEAvancar(3);
    const abaSecao1 = screen.getByRole('button', { name: 'Seção 1' });
    expect(abaSecao1.querySelector('svg')).not.toBeNull();
    const abaSecao2 = screen.getByRole('button', { name: 'Seção 2' });
    expect(abaSecao2.querySelector('svg')).toBeNull();

    // Voltar para a seção 1 pela aba não tira o check dela.
    await userEvent.click(abaSecao1);
    expect(
      screen.getByRole('button', { name: 'Seção 1' }).querySelector('svg'),
    ).not.toBeNull();
  });

  it('should not mark the section as done before advancing the last question', async () => {
    await renderizarCarregado();

    await responderEAvancar(2);
    // Na última pergunta: escreve, mas ainda não avança.
    await userEvent.type(screen.getByRole('textbox'), 'Quase');
    expect(
      screen.getByRole('button', { name: 'Seção 1' }).querySelector('svg'),
    ).toBeNull();

    await avancar();
    expect(
      screen.getByRole('button', { name: 'Seção 1' }).querySelector('svg'),
    ).not.toBeNull();
  });

  it('should show the section percentage next to the section name', async () => {
    await renderizarCarregado();

    expect(screen.getByText('0%')).toBeInTheDocument();
    await responderEAvancar();
    expect(screen.getByText('33%')).toBeInTheDocument();
  });

  it('should pass collected answers to the review route', async () => {
    await renderizarCarregado();
    await userEvent.type(screen.getByRole('textbox'), 'Primeira resposta');
    await avancar();
    // As outras 5 do back e as 2 de demonstração.
    await responderEAvancar(7);

    await userEvent.click(
      screen.getByRole('button', { name: 'Revisar e enviar' }),
    );

    expect(
      screen.getByRole('heading', { name: 'Revisão' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Quantidade: 8')).toBeInTheDocument();
    expect(screen.getByText('Texto da p1')).toBeInTheDocument();
    expect(screen.getByText('Primeira resposta')).toBeInTheDocument();
    expect(screen.getByText('Opcional: sim')).toBeInTheDocument();
    expect(screen.getByText('Demonstração: 2')).toBeInTheDocument();
  });

  describe('seção de demonstração', () => {
    it('entram no fim da seção Avaliação, com a escala de 1 a 5 e a objetiva', async () => {
      await renderizarCarregado();

      // Depois das 3 do perfil e das 3 reais da avaliação.
      await responderEAvancar(6);
      expect(
        screen.getByText('Seção 2', { selector: 'p' }),
      ).toBeInTheDocument();
      expect(screen.getByText(/Pergunta 4 de 5/)).toBeInTheDocument();

      // Escala de 1 a 5, com a legenda e o aviso de que não é enviada.
      expect(screen.getByRole('radio', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: '5' })).toBeInTheDocument();
      expect(screen.getByText('Discordo totalmente')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: /^\[Demonstração, não é enviada\]/,
        }),
      ).toBeInTheDocument();

      // Objetiva: as cinco alternativas.
      await responderEAvancar();
      expect(screen.getAllByRole('radio')).toHaveLength(5);
      expect(
        screen.getByText(/multiculturalismo na educação/),
      ).toBeInTheDocument();
    });

    it('não segura a pessoa: dá para passar em branco', async () => {
      await renderizarCarregado();

      await responderEAvancar(6);
      await avancar();
      await avancar();

      expect(
        screen.getByRole('button', { name: 'Revisar e enviar' }),
      ).toBeInTheDocument();
    });
  });
});
