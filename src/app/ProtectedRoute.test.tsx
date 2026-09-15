import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { ProtectedRoute } from '@/app/ProtectedRoute';
import authenticationReducer from '@/features/authentication/authenticationSlice';
import type { UserSessionResponse } from '@/types/api';

const usuario: UserSessionResponse = {
  id: 'usuario-1',
  email: 'dev@creed.example.com',
  role: 'admin',
  vinculo_id: null,
  organization_id: null,
  organization_name: null,
};

// Store isolada, já com o usuário logado — ver
// creed-ai-context/conventions/camadas-do-front.md § "Testando View
// conectada ao Redux".
function renderizarLogado() {
  const store = configureStore({
    reducer: { authentication: authenticationReducer },
    preloadedState: {
      authentication: {
        user: usuario,
        status: 'authenticated' as const,
        error: null,
      },
    },
  });
  // As telas filhas viram marcadores: o que se testa aqui é a guarda.
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/respondentes']}>
        <Routes>
          <Route path="/login" element={<p>tela de login</p>} />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/demograficos-1"
              element={<Link to="/respondentes">etapa 1</Link>}
            />
            <Route path="/respondentes" element={<p>área logada</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe('ProtectedRoute — termo de consentimento', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('mostra o termo, e não a área logada, ao entrar', () => {
    renderizarLogado();

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.queryByText('área logada')).toBeNull();
  });

  it('leva aos dados demográficos ao aceitar', async () => {
    renderizarLogado();

    await userEvent.click(screen.getByRole('button', { name: 'Aceitar' }));

    expect(await screen.findByText('etapa 1')).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('não pergunta de novo ao navegar entre as telas logadas', async () => {
    renderizarLogado();

    await userEvent.click(screen.getByRole('button', { name: 'Aceitar' }));
    await userEvent.click(await screen.findByText('etapa 1'));

    expect(await screen.findByText('área logada')).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  // Decisão para a apresentação: o aceite não é lembrado entre acessos.
  it('mostra o termo de novo a cada acesso, mesmo depois de aceitar', async () => {
    const { unmount } = renderizarLogado();
    await userEvent.click(screen.getByRole('button', { name: 'Aceitar' }));
    expect(await screen.findByText('etapa 1')).toBeInTheDocument();

    unmount();
    renderizarLogado();

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('desloga e volta ao login ao recusar', async () => {
    renderizarLogado();

    await userEvent.click(screen.getByRole('button', { name: 'Recusar' }));

    expect(await screen.findByText('tela de login')).toBeInTheDocument();
    expect(screen.queryByText('área logada')).toBeNull();
  });
});
