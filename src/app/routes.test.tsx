import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { routes } from '@/app/routes';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

const MENSAGEM_TECNICA = 'falha-tecnica-que-ninguem-deve-ver';

// Faz uma tela real das rotas quebrar ao ser desenhada.
vi.mock('@/features/about/AboutView', () => ({
  AboutView: () => {
    throw new Error(MENSAGEM_TECNICA);
  },
}));

describe('routes', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
    // O react-router e o React também escrevem o erro no console; o teste
    // observa a chamada sem poluir a saída.
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderizar(caminho: string) {
    const router = createMemoryRouter(routes, { initialEntries: [caminho] });
    return render(<RouterProvider router={router} />);
  }

  it('mostra a tela de erro quando uma tela quebra ao ser desenhada', () => {
    renderizar('/about');

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Algo deu errado. Tente de novo.',
    );
  });

  it('não mostra o texto da exceção na tela, só no console', () => {
    renderizar('/about');

    expect(screen.queryByText(MENSAGEM_TECNICA)).not.toBeInTheDocument();
    expect(console.error).toHaveBeenCalledWith(
      expect.objectContaining({ message: MENSAGEM_TECNICA }),
    );
  });

  it('mostra a tela de erro também para uma rota inexistente (P-096)', () => {
    renderizar('/essa-rota-nao-existe');

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Algo deu errado. Tente de novo.',
    );
  });
});
