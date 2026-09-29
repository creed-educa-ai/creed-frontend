import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { FormView } from './FormView';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

function ReviewRouteProbe() {
  const location = useLocation();
  const state = location.state as {
    questions?: { text: string; answer: string | null }[];
  } | null;
  const questions = state?.questions ?? [];

  return (
    <div>
      <h1>Revisão</h1>
      <p>{`Quantidade: ${String(questions.length)}`}</p>
      <p>{questions[0]?.text}</p>
      <p>{questions[0]?.answer}</p>
    </div>
  );
}

describe('FormView', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  function renderizar() {
    return render(
      <MemoryRouter initialEntries={['/form']}>
        <Routes>
          <Route path="/form" element={<FormView />} />
          <Route path="/questionario/revisao" element={<ReviewRouteProbe />} />
        </Routes>
      </MemoryRouter>,
    );
  }

  // Responde a pergunta que está na tela (qualquer tipo) e clica em Avançar.
  async function responderEAvancar(quantidade = 1) {
    for (let i = 0; i < quantidade; i++) {
      const escala = screen.queryByRole('radio', { name: '3' });
      const campo = screen.queryByRole('textbox');
      if (escala) {
        await userEvent.click(escala);
      } else if (campo) {
        await userEvent.type(campo, 'Minha resposta');
      } else {
        const [primeiraAlternativa] = screen.getAllByRole('radio');
        if (!primeiraAlternativa) throw new Error('alternativa não encontrada');
        await userEvent.click(primeiraAlternativa);
      }
      await userEvent.click(screen.getByRole('button', { name: /Avançar/i }));
    }
  }

  it('should render header with title and user name', () => {
    renderizar();

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Formulário')).toBeInTheDocument();
  });

  it('should render first question of section 1', () => {
    renderizar();

    expect(screen.getByText(/Pergunta 1 de 3/)).toBeInTheDocument();
  });

  it('should render the 1 to 5 scale legend under the options', () => {
    renderizar();

    expect(screen.getByText('Discordo totalmente')).toBeInTheDocument();
    expect(screen.getByText('Concordo totalmente')).toBeInTheDocument();
  });

  it('should move the progress only when advancing an answered question', async () => {
    renderizar();

    function valorDaBarra() {
      return Number(
        screen.getByRole('progressbar').getAttribute('aria-valuenow'),
      );
    }

    expect(valorDaBarra()).toBe(0);

    // Marcar uma opção ainda não conta.
    await userEvent.click(screen.getByRole('radio', { name: '4' }));
    expect(valorDaBarra()).toBe(0);

    // Avançar com a resposta marcada conta: 1 de 3 da seção.
    await userEvent.click(screen.getByRole('button', { name: /Avançar/i }));
    expect(valorDaBarra()).toBeCloseTo(100 / 3);

    // Avançar sem responder não conta.
    await userEvent.click(screen.getByRole('button', { name: /Avançar/i }));
    expect(valorDaBarra()).toBeCloseTo(100 / 3);

    // Voltar à pergunta pulada e responder também só conta ao avançar.
    await userEvent.click(screen.getByRole('button', { name: /Voltar/i }));
    await userEvent.click(screen.getByRole('radio', { name: '2' }));
    expect(valorDaBarra()).toBeCloseTo(100 / 3);
    await userEvent.click(screen.getByRole('button', { name: /Avançar/i }));
    expect(valorDaBarra()).toBeCloseTo(200 / 3);
  });

  it('should slide the question in from the side of the button clicked', async () => {
    renderizar();

    function blocoDaPergunta() {
      return screen
        .getByRole('heading', { level: 2 })
        .closest('[data-direcao]');
    }

    await userEvent.click(screen.getByRole('button', { name: /Avançar/i }));
    expect(blocoDaPergunta()).toHaveAttribute('data-direcao', 'avancar');
    expect(blocoDaPergunta()).toHaveClass('slide-in-from-right-4');

    await userEvent.click(screen.getByRole('button', { name: /Voltar/i }));
    expect(blocoDaPergunta()).toHaveAttribute('data-direcao', 'voltar');
    expect(blocoDaPergunta()).toHaveClass('slide-in-from-left-4');
  });

  it('should keep the 1 to 5 buttons in place between scale questions', async () => {
    renderizar();

    // Perguntas 1 e 2 são de escala: o botão "1" tem que ser o mesmo
    // elemento (não recriado, então não anima), só sem a seleção.
    const botaoAntes = screen.getByRole('radio', { name: '1' });
    await userEvent.click(botaoAntes);
    await userEvent.click(screen.getByRole('button', { name: /Avançar/i }));

    const botaoDepois = screen.getByRole('radio', { name: '1' });
    expect(botaoDepois).toBe(botaoAntes);
    expect(botaoDepois).not.toBeChecked();
  });

  it('should go to the first question of a section by clicking its tab', async () => {
    renderizar();

    // Seção 2 ainda não foi vista: a aba fica bloqueada.
    expect(screen.getByRole('button', { name: 'Seção 2' })).toBeDisabled();

    await responderEAvancar(4);
    expect(screen.getByText('Seção 2', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText(/Pergunta 2 de 3/)).toBeInTheDocument();

    // Volta pela aba: cai na primeira pergunta da seção 1.
    await userEvent.click(screen.getByRole('button', { name: 'Seção 1' }));
    expect(screen.getByText('Seção 1', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText(/Pergunta 1 de 3/)).toBeInTheDocument();

    // A seção 2 continua liberada: dá para ir e vir.
    const abaSecao2 = screen.getByRole('button', { name: 'Seção 2' });
    expect(abaSecao2).toBeEnabled();
    await userEvent.click(abaSecao2);
    expect(screen.getByText('Seção 2', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText(/Pergunta 1 de 3/)).toBeInTheDocument();
  });

  it('should go back to a section from the completion screen', async () => {
    renderizar();

    await responderEAvancar(6);
    await userEvent.click(screen.getByRole('button', { name: 'Seção 1' }));

    expect(screen.getByText('Seção 1', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText(/Pergunta 1 de 3/)).toBeInTheDocument();
  });

  it('should render progress bar', () => {
    renderizar();

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  it('should disable voltar button on first question', () => {
    renderizar();

    const voltarButton = screen.getByRole('button', { name: /Voltar/i });
    expect(voltarButton).toBeDisabled();
  });

  it('should advance to next question when clicking avançar', async () => {
    renderizar();

    const avancarButton = screen.getByRole('button', { name: /Avançar/i });
    await userEvent.click(avancarButton);

    expect(screen.getByText(/Pergunta 2 de 3/)).toBeInTheDocument();
  });

  it('should go back to previous question when clicking voltar', async () => {
    renderizar();

    // Avança 2 vezes, buscando o botão a cada clique: a pergunta é
    // recriada a cada troca, e o botão antigo sai da tela
    for (let i = 0; i < 2; i++) {
      const avancarButton = screen.getByRole('button', { name: /Avançar/i });
      await userEvent.click(avancarButton);
    }

    const voltarButton = screen.getByRole('button', { name: /Voltar/i });
    await userEvent.click(voltarButton);

    expect(screen.getByText(/Pergunta 2 de 3/)).toBeInTheDocument();
  });

  it('should change section when finishing all questions in section 1', async () => {
    renderizar();

    await responderEAvancar(3);

    // O seletor de seções mostra "Seção 2" desde o início; o título do
    // cartão (<p>) é o que diz em qual seção a pessoa está
    expect(screen.getByText('Seção 2', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText(/Pergunta 1 de 3/i)).toBeInTheDocument();
    // A aba marcada como atual acompanha a troca de seção.
    expect(screen.getByRole('button', { name: 'Seção 2' })).toHaveAttribute(
      'aria-current',
      'step',
    );
    expect(screen.getByRole('button', { name: 'Seção 1' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('should render quantitative question with scale 1-5', () => {
    renderizar();

    expect(screen.getByRole('radio', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '5' })).toBeInTheDocument();
  });

  it('should translate texts when changing language', async () => {
    await i18n.changeLanguage('en');
    renderizar();

    expect(screen.getByText('Form')).toBeInTheDocument();
    expect(screen.getByText(/Question 1 of 3/)).toBeInTheDocument();
  });

  it('should render icon buttons in header with accessible names', () => {
    renderizar();

    expect(screen.getByRole('button', { name: 'Painel' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Formulário' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Informações' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument();
  });

  it('should render CREED.ai wordmark', () => {
    renderizar();

    const wordmark = screen.getByAltText('CREED.ai');
    expect(wordmark).toBeInTheDocument();
  });

  it('should show completion message when all questions are answered', async () => {
    renderizar();

    await responderEAvancar(6);

    expect(
      screen.getByRole('heading', { name: 'Todas as perguntas respondidas' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Revise suas respostas antes de enviar.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Revisar e enviar' }),
    ).toBeInTheDocument();
    // Tudo concluído: barra cheia e nenhuma aba marcada como a atual.
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100',
    );
    expect(screen.getByText('6 de 6 respondidas')).toBeInTheDocument();
    for (const aba of screen.getAllByRole('button', { name: /^Seção/ })) {
      expect(aba).not.toHaveAttribute('aria-current');
    }
  });

  it('should not leave the section with unanswered questions', async () => {
    renderizar();

    // Responde a 1, pula a 2, responde a 3 e tenta sair da seção.
    await responderEAvancar();
    await userEvent.click(screen.getByRole('button', { name: /Avançar/i }));
    await responderEAvancar();

    // Continua na seção 1, na pergunta que faltou, com o aviso.
    expect(screen.getByText('Seção 1', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText(/Pergunta 2 de 3/)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Responda todas as perguntas da seção para avançar.',
    );

    // Respondeu a que faltava: o aviso some.
    await userEvent.click(screen.getByRole('radio', { name: '3' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    // Agora dá para sair.
    await userEvent.click(screen.getByRole('button', { name: /Avançar/i }));
    await userEvent.click(screen.getByRole('button', { name: /Avançar/i }));
    expect(screen.getByText('Seção 2', { selector: 'p' })).toBeInTheDocument();
  });

  it('should only mark a tab as done when its section is complete', async () => {
    renderizar();

    await responderEAvancar(3);
    // Seção 1 completa: a aba ganha o check (um svg dentro do botão).
    const abaSecao1 = screen.getByRole('button', { name: 'Seção 1' });
    expect(abaSecao1.querySelector('svg')).not.toBeNull();
    // Seção 2 é a atual e está incompleta: sem check.
    const abaSecao2 = screen.getByRole('button', { name: 'Seção 2' });
    expect(abaSecao2.querySelector('svg')).toBeNull();

    // Voltar para a seção 1 pela aba não tira o check dela.
    await userEvent.click(abaSecao1);
    expect(
      screen.getByRole('button', { name: 'Seção 1' }).querySelector('svg'),
    ).not.toBeNull();
  });

  it('should not mark the section as done before advancing the last question', async () => {
    renderizar();

    await responderEAvancar(2);
    // Na última pergunta: responde, mas ainda não avança.
    await userEvent.click(screen.getByRole('radio', { name: '3' }));
    expect(
      screen.getByRole('button', { name: 'Seção 1' }).querySelector('svg'),
    ).toBeNull();

    // Avançou: agora sim a seção está concluída.
    await userEvent.click(screen.getByRole('button', { name: /Avançar/i }));
    expect(
      screen.getByRole('button', { name: 'Seção 1' }).querySelector('svg'),
    ).not.toBeNull();
  });

  it('should show the section percentage next to the section name', async () => {
    renderizar();

    expect(screen.getByText('0%')).toBeInTheDocument();
    await responderEAvancar();
    expect(screen.getByText('33%')).toBeInTheDocument();
  });

  it('should pass collected answers to the review route', async () => {
    renderizar();
    await userEvent.click(screen.getByRole('radio', { name: '4' }));
    await userEvent.click(screen.getByRole('button', { name: /Avançar/i }));
    await responderEAvancar(5);

    await userEvent.click(
      screen.getByRole('button', { name: 'Revisar e enviar' }),
    );

    expect(
      screen.getByRole('heading', { name: 'Revisão' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Quantidade: 6')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('should not keep selected value when advancing to next question', async () => {
    renderizar();

    const radio3 = screen
      .getAllByRole('radio')
      .find((r) => r.getAttribute('value') === '3');
    if (radio3) {
      await userEvent.click(radio3);
      expect(radio3).toBeChecked();

      const avancarButton = screen.getByRole('button', { name: /Avançar/i });
      await userEvent.click(avancarButton);

      const newRadio3 = screen
        .getAllByRole('radio')
        .find((r) => r.getAttribute('value') === '3');
      expect(newRadio3).not.toBeChecked();
    }
  });
});
