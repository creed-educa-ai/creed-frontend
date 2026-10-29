import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { LoginView } from '@/features/authentication/LoginView';
import authenticationReducer from '@/features/authentication/authenticationSlice';
import { authenticationApi } from '@/features/authentication/authenticationApi';
import type { SessionResponse } from '@/types/api';

// Store isolada por teste, só com o reducer que esta tela usa. Ver
// creed-ai-context/conventions/camadas-do-front.md § "Testando View
// conectada ao Redux".
function renderizar() {
  const store = configureStore({
    reducer: { authentication: authenticationReducer },
  });
  return render(
    <MemoryRouter>
      <Provider store={store}>
        <LoginView />
      </Provider>
    </MemoryRouter>,
  );
}

describe('LoginView', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('renderiza os campos e as ações do login', () => {
    renderizar();

    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByText('Lembrar de mim')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Ir para a tela de boas-vindas' }),
    ).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Criar conta' })).toHaveAttribute(
      'href',
      '/sign-up',
    );
    expect(
      screen.getByRole('link', { name: 'Esqueci minha senha' }),
    ).toHaveAttribute('href', '/reset-password');
  });

  it('mostra erro nos campos obrigatórios ao submeter vazio', async () => {
    renderizar();

    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    // E-mail vazio não passa em z.email() e cai na mensagem de formato
    // inválido, não na de campo obrigatório — só a senha usa min(1).
    expect(screen.getByText('Digite um e-mail válido.')).toBeInTheDocument();
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
  });
  describe('depois de entrar', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    function sessaoCom(role: string): SessionResponse {
      return {
        access_token: 'token',
        refresh_token: 'refresh',
        expires_in: 300,
        user: {
          id: 'usuario-1',
          email: 'dev@creed.example.com',
          role,
          link_id: null,
          organization_id: null,
          organization_name: null,
        },
      };
    }

    // As telas de destino viram marcadores: o que se testa é para onde vai.
    function renderizarComDestinos(entrada: string | object = '/login') {
      const store = configureStore({
        reducer: { authentication: authenticationReducer },
      });
      return render(
        <Provider store={store}>
          <MemoryRouter initialEntries={[entrada]}>
            <Routes>
              <Route path="/login" element={<LoginView />} />
              <Route path="/dashboard" element={<p>dashboard individual</p>} />
              <Route
                path="/dashboard/company"
                element={<p>dashboard da organização</p>}
              />
              <Route
                path="/control-panel"
                element={<p>painel de controle</p>}
              />
            </Routes>
          </MemoryRouter>
        </Provider>,
      );
    }

    async function entrar() {
      await userEvent.type(
        screen.getByLabelText('E-mail'),
        'dev@creed.example.com',
      );
      await userEvent.type(screen.getByLabelText('Senha'), 'dev');
      await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    }

    it('leva o admin ao dashboard da organização', async () => {
      vi.spyOn(authenticationApi, 'login').mockResolvedValue(
        sessaoCom('admin'),
      );
      renderizarComDestinos();

      await entrar();

      expect(
        await screen.findByText('dashboard da organização'),
      ).toBeInTheDocument();
    });

    it('leva o respondente ao dashboard individual', async () => {
      vi.spyOn(authenticationApi, 'login').mockResolvedValue(
        sessaoCom('respondente'),
      );
      renderizarComDestinos();

      await entrar();

      expect(
        await screen.findByText('dashboard individual'),
      ).toBeInTheDocument();
    });

    it('volta para a rota que pediu o login, quando houver', async () => {
      vi.spyOn(authenticationApi, 'login').mockResolvedValue(
        sessaoCom('admin'),
      );
      renderizarComDestinos({
        pathname: '/login',
        state: { from: { pathname: '/control-panel' } },
      });

      await entrar();

      expect(await screen.findByText('painel de controle')).toBeInTheDocument();
    });
  });
});
