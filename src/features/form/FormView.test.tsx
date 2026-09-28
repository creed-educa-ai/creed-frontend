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

  it('should render header with title and user name', () => {
    renderizar();

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Formulário')).toBeInTheDocument();
  });

  it('should render first question of section 1', () => {
    renderizar();

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

    // Avança 3 vezes, buscando o botão a cada clique
    for (let i = 0; i < 3; i++) {
      const avancarButton = screen.getByRole('button', { name: /Avançar/i });
      await userEvent.click(avancarButton);
    }

    // O seletor de seções mostra "Seção 2" desde o início; o título do
    // cartão (<p>) é o que diz em qual seção a pessoa está
    expect(screen.getByText('Seção 2', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText(/Pergunta 1 de 3/i)).toBeInTheDocument();
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

    // Avança 6 vezes (3 perguntas x 2 seções), buscando o botão a cada clique
    for (let i = 0; i < 6; i++) {
      const avancarButton = screen.getByRole('button', { name: /Avançar/i });
      await userEvent.click(avancarButton);
    }

    expect(screen.getByText(/Formulário finalizado/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Obrigado pela sua participação/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Revisar respostas' }),
    ).toBeInTheDocument();
  });

  it('should pass collected answers to the review route', async () => {
    renderizar();
    await userEvent.click(screen.getByRole('radio', { name: '4' }));

    for (let i = 0; i < 6; i++) {
      await userEvent.click(screen.getByRole('button', { name: /Avançar/i }));
    }

    await userEvent.click(
      screen.getByRole('button', { name: 'Revisar respostas' }),
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
