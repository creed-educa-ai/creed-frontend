import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { ProtectedRoute } from '@/app/ProtectedRoute';
import authenticationReducer from '@/features/authentication/authenticationSlice';
import { registrarAceiteDoTermo } from '@/features/authentication/termoAceito';
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
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/respondentes']}>
        <Routes>
          <Route path="/login" element={<p>tela de login</p>} />
          <Route element={<ProtectedRoute />}>
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

  it('mostra o termo, e não a área logada, no primeiro acesso', () => {
    renderizarLogado();

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.queryByText('área logada')).toBeNull();
  });

  it('libera a área logada ao aceitar e não pergunta de novo', async () => {
    const { unmount } = renderizarLogado();

    await userEvent.click(screen.getByRole('button', { name: 'Aceitar' }));

    expect(await screen.findByText('área logada')).toBeInTheDocument();

    // Próximo acesso do mesmo usuário: vai direto para a área logada.
    unmount();
    renderizarLogado();
    expect(screen.getByText('área logada')).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('desloga e volta ao login ao recusar', async () => {
    renderizarLogado();

    await userEvent.click(screen.getByRole('button', { name: 'Recusar' }));

    expect(await screen.findByText('tela de login')).toBeInTheDocument();
    expect(screen.queryByText('área logada')).toBeNull();
  });

  it('não mostra o termo para quem já aceitou', () => {
    registrarAceiteDoTermo(usuario.id);

    renderizarLogado();

    expect(screen.getByText('área logada')).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });
});
