import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ErrorView } from '@/features/error/ErrorView';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

describe('ErrorView', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  // O primeiro item de `entradas` é a entrada inicial do histórico; o
  // `initialIndex` escolhe em qual delas a pessoa está.
  function renderizar(entradas: string[], indiceInicial: number) {
    return render(
      <MemoryRouter initialEntries={entradas} initialIndex={indiceInicial}>
        <Routes>
          <Route path="/" element={<p>tela inicial</p>} />
          <Route path="/anterior" element={<p>tela anterior</p>} />
          <Route path="/error" element={<ErrorView />} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it('mostra só a mensagem de erro e o botão Voltar', () => {
    renderizar(['/error'], 0);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Algo deu errado. Tente de novo.',
    );
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('traduz a mensagem e o botão ao trocar de idioma', async () => {
    await i18n.changeLanguage('en');
    renderizar(['/error'], 0);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Something went wrong. Please try again.',
    );
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
  });

  it('traduz a mensagem e o botão para o espanhol', async () => {
    await i18n.changeLanguage('es');
    renderizar(['/error'], 0);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Algo salió mal. Inténtalo de nuevo.',
    );
    expect(screen.getByRole('button', { name: 'Volver' })).toBeInTheDocument();
  });

  it('volta para a tela anterior quando há histórico', async () => {
    const user = userEvent.setup();
    renderizar(['/anterior', '/error'], 1);

    await user.click(screen.getByRole('button', { name: 'Voltar' }));

    expect(screen.getByText('tela anterior')).toBeInTheDocument();
  });

  it('vai para a tela inicial quando a pessoa abriu /error direto', async () => {
    const user = userEvent.setup();
    renderizar(['/error'], 0);

    await user.click(screen.getByRole('button', { name: 'Voltar' }));

    expect(screen.getByText('tela inicial')).toBeInTheDocument();
  });
});
