import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { FormView } from './FormView';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

describe('FormView', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  function renderizar() {
    return render(
      <MemoryRouter>
        <FormView />
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

    const avancarButton = screen.getByRole('button', { name: /Avançar/i });
    await userEvent.click(avancarButton);
    await userEvent.click(avancarButton);

    const voltarButton = screen.getByRole('button', { name: /Voltar/i });
    await userEvent.click(voltarButton);

    expect(screen.getByText(/Pergunta 2 de 3/)).toBeInTheDocument();
  });

  it('should change section when finishing all questions in section 1', async () => {
    renderizar();

    const avancarButton = screen.getByRole('button', { name: /Avançar/i });

    // Avança 3 vezes para terminar seção 1
    await userEvent.click(avancarButton);
    await userEvent.click(avancarButton);
    await userEvent.click(avancarButton);

    expect(screen.getAllByText('Seção 2')[0]).toBeInTheDocument();
    expect(screen.getByText(/Pergunta 1 de 3/)).toBeInTheDocument();
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

  it('should render icon buttons in header', () => {
    renderizar();

    const buttons = screen.getAllByRole('button');
    // Header tem 4 botões de ícone + 2 de navegação
    expect(buttons.length).toBeGreaterThanOrEqual(4);
  });

  it('should render CREED.ai wordmark', () => {
    renderizar();

    const wordmark = screen.getByAltText('CREED.ai');
    expect(wordmark).toBeInTheDocument();
  });
});
