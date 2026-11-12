import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Link,
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { ProtectedRoute } from '@/app/ProtectedRoute';
import authenticationReducer from '@/features/authentication/authenticationSlice';
import { recordTermsAcceptance } from '@/features/authentication/termsAcceptance';
import type { UserSessionResponse } from '@/types/api';

const usuario: UserSessionResponse = {
  id: 'usuario-1',
  email: 'dev@creed.example.com',
  role: 'admin',
  link_id: null,
  organization_id: null,
  organization_name: null,
};

// Marcador da primeira etapa do onboarding. Mostra a origem que a guarda
// manda no `state`: é com ela que o fluxo devolve à rota certa quem já tem
// perfil no back.
function PrimeiraEtapa() {
  const { from } = useLocation().state as { from: string };
  return (
    <>
      <Link to="/respondentes">primeira etapa</Link>
      <p>veio de {from}</p>
    </>
  );
}

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
        passwordReset: { status: 'idle' as const, error: null },
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
            <Route path="/demographics/step-2" element={<PrimeiraEtapa />} />
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

  it('leva aos dados demográficos ao aceitar', async () => {
    renderizarLogado();

    await userEvent.click(screen.getByRole('button', { name: 'Aceitar' }));

    expect(await screen.findByText('primeira etapa')).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('avisa ao onboarding de onde a pessoa veio', async () => {
    renderizarLogado();

    await userEvent.click(screen.getByRole('button', { name: 'Aceitar' }));

    expect(
      await screen.findByText('veio de /respondentes'),
    ).toBeInTheDocument();
  });

  it('não pergunta de novo ao navegar entre as telas logadas', async () => {
    renderizarLogado();

    await userEvent.click(screen.getByRole('button', { name: 'Aceitar' }));
    await userEvent.click(await screen.findByText('primeira etapa'));

    expect(await screen.findByText('área logada')).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('lembra o aceite no próximo acesso, sem repetir o onboarding', async () => {
    const { unmount } = renderizarLogado();

    await userEvent.click(screen.getByRole('button', { name: 'Aceitar' }));
    expect(await screen.findByText('primeira etapa')).toBeInTheDocument();

    // Próximo acesso do mesmo usuário: vai direto para a área logada, sem
    // termo e sem passar pelos demográficos de novo.
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
    recordTermsAcceptance(usuario.id);

    renderizarLogado();

    expect(screen.getByText('área logada')).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });
});
