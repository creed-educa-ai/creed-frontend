import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SobreView } from '@/features/sobre/SobreView';
import authenticationReducer from '@/features/authentication/authenticationSlice';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import type { UserSessionResponse } from '@/types/api';

const usuario: UserSessionResponse = {
  id: 'usuario-1',
  email: 'dev@creed.example.com',
  role: 'respondente',
  link_id: null,
  organization_id: null,
  organization_name: null,
};

describe('SobreView', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  // O Sobre é público: sem usuário é quem chega pelas boas-vindas.
  function renderizar(user: UserSessionResponse | null = null) {
    const store = configureStore({
      reducer: { authentication: authenticationReducer },
      preloadedState: {
        authentication: {
          user,
          status: user ? ('authenticated' as const) : ('idle' as const),
          error: null,
          passwordReset: { status: 'idle' as const, error: null },
        },
      },
    });

    return render(
      <Provider store={store}>
        <MemoryRouter>
          <SobreView />
        </MemoryRouter>
      </Provider>,
    );
  }

  it('renderiza o título e o texto da tela', () => {
    renderizar();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Sobre' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('Lorem ipsum')),
    ).toBeInTheDocument();
  });

  it('não mostra o menu de navegação para quem não entrou', () => {
    renderizar();

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('mostra o menu de navegação e tira o Voltar para quem tem sessão', () => {
    renderizar(usuario);

    expect(
      screen.getByRole('navigation', {
        name: i18n.t('formulario:menuNavegacao'),
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Voltar' }),
    ).not.toBeInTheDocument();
  });

  it('mantém o Voltar para quem não entrou, que não tem menu', () => {
    renderizar();

    expect(screen.getByRole('button', { name: 'Voltar' })).toBeInTheDocument();
  });

  it('traduz os textos da tela ao trocar de idioma', async () => {
    await i18n.changeLanguage('en');
    renderizar();

    expect(
      screen.getByRole('heading', { level: 1, name: 'About' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
  });
});
