import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Onboard_QuestView } from './onboard-questionarioView';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

describe('Onboard_QuestView', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  function renderizar() {
    return render(
      <MemoryRouter>
        <Onboard_QuestView />
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
      screen.getByText('você tem um questionário disponível'),
    ).toBeInTheDocument();
    expect(screen.getByText(/Suas respostas ajudam/)).toBeInTheDocument();
  });

  it('should render advance button', () => {
    renderizar();

    expect(screen.getByRole('button', { name: 'Avançar' })).toBeInTheDocument();
  });

  it('should render time and sections information', () => {
    renderizar();

    expect(screen.getByText('15 minutos')).toBeInTheDocument();
    expect(screen.getByText('4 seções')).toBeInTheDocument();
  });

  it('should render icon buttons in header', () => {
    renderizar();

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(1);
  });

  it('should open modal when advance button is clicked', async () => {
    renderizar();

    const advanceButton = screen.getByRole('button', { name: 'Avançar' });
    await userEvent.click(advanceButton);

    expect(screen.getByText('Atualizar Informações')).toBeInTheDocument();
  });

  it('should translate all texts when changing language', async () => {
    await i18n.changeLanguage('en');
    renderizar();

    expect(screen.getByText('FORM')).toBeInTheDocument();
    expect(screen.getByText('Shall we get started?')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Continue' }),
    ).toBeInTheDocument();
  });

  it('should render CREED.ai wordmark', () => {
    renderizar();

    const wordmark = screen.getByAltText('CREED.ai');
    expect(wordmark).toBeInTheDocument();
  });
});
