import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { OnboardQuestionarioView } from './OnboardQuestionarioView';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

describe('OnboardQuestionarioView', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  function renderizar() {
    return render(
      <MemoryRouter>
        <OnboardQuestionarioView />
      </MemoryRouter>,
    );
  }

  it('should render header with user name and title', () => {
    renderizar();

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('FORMULÁRIO')).toBeInTheDocument();
  });

  it('should render questionnaire card with all information', () => {
    renderizar();

    expect(screen.getByText('Vamos começar?')).toBeInTheDocument();
    expect(
      screen.getByText('Você tem um questionário disponível'),
    ).toBeInTheDocument();
    expect(screen.getByText(/Suas respostas ajudam/)).toBeInTheDocument();
  });

  it('should render start button', () => {
    renderizar();

    expect(screen.getByRole('button', { name: 'Iniciar' })).toBeInTheDocument();
  });

  it('should render time and sections information', () => {
    renderizar();

    expect(screen.getByText('~15 minutos')).toBeInTheDocument();
    expect(screen.getByText('4 seções')).toBeInTheDocument();
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

  it('should open modal when start button is clicked', async () => {
    renderizar();

    const startButton = screen.getByRole('button', { name: 'Iniciar' });
    await userEvent.click(startButton);

    expect(screen.getByText('Atualizar Informações')).toBeInTheDocument();
  });

  it('should go to the questionnaire when "Iniciar questionário" is clicked', async () => {
    render(
      <MemoryRouter initialEntries={['/onboard-quest']}>
        <Routes>
          <Route path="/onboard-quest" element={<OnboardQuestionarioView />} />
          <Route path="/form" element={<p>questionário</p>} />
        </Routes>
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Iniciar' }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Iniciar questionário' }),
    );

    expect(await screen.findByText('questionário')).toBeInTheDocument();
  });

  it('should translate all texts when changing language', async () => {
    await i18n.changeLanguage('en');
    renderizar();

    expect(screen.getByText('FORM')).toBeInTheDocument();
    expect(screen.getByText('Shall we get started?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
  });

  it('should render CREED.ai wordmark', () => {
    renderizar();

    const wordmark = screen.getByAltText('CREED.ai');
    expect(wordmark).toBeInTheDocument();
  });
});
