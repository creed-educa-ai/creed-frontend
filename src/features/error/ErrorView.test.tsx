import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ErrorView } from '@/features/error/ErrorView';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

describe('ErrorView', () => {
  let router: ReturnType<typeof createBrowserRouter>;

  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  afterEach(() => {
    router.dispose();
    window.history.replaceState(null, '', '/');
  });

  function renderAt(path: string) {
    window.history.replaceState(null, '', path);
    router = createBrowserRouter([
      { path: '/', element: <p>tela inicial</p> },
      { path: '/anterior', element: <p>tela anterior</p> },
      { path: '/error', element: <ErrorView /> },
    ]);
    return render(<RouterProvider router={router} />);
  }

  it('mostra só a mensagem de erro e o botão Voltar', () => {
    renderAt('/error');

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Algo deu errado. Tente de novo.',
    );
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('traduz a mensagem e o botão ao trocar de idioma', async () => {
    await i18n.changeLanguage('en');
    renderAt('/error');

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Something went wrong. Please try again.',
    );
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
  });

  it('traduz a mensagem e o botão para o espanhol', async () => {
    await i18n.changeLanguage('es');
    renderAt('/error');

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Algo salió mal. Inténtalo de nuevo.',
    );
    expect(screen.getByRole('button', { name: 'Volver' })).toBeInTheDocument();
  });

  it('volta para a tela anterior quando há histórico', async () => {
    const user = userEvent.setup();
    renderAt('/anterior');
    await act(() => router.navigate('/error'));

    await user.click(screen.getByRole('button', { name: 'Voltar' }));

    expect(await screen.findByText('tela anterior')).toBeInTheDocument();
  });

  it('vai para a tela inicial quando a pessoa abriu /error direto', async () => {
    const user = userEvent.setup();
    renderAt('/error');

    await user.click(screen.getByRole('button', { name: 'Voltar' }));

    expect(screen.getByText('tela inicial')).toBeInTheDocument();
    expect(router.state.historyAction).toBe('REPLACE');
  });

  it('goes to the home page when a redirect replaced the first history entry', async () => {
    const user = userEvent.setup();
    renderAt('/anterior');
    await act(() => router.navigate('/error', { replace: true }));

    await user.click(screen.getByRole('button', { name: 'Voltar' }));

    expect(await screen.findByText('tela inicial')).toBeInTheDocument();
  });
});
