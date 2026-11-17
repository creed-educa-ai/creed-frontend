import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
import { demographicsApi } from '@/features/demographics/demographicsApi';
import { DemographicsStep2Route } from '@/features/demographics/demographicsFlow';
import demographicsReducer from '@/features/demographics/demographicsSlice';
import { ApiError } from '@/lib/apiClient';
import type { DemographicResponse, UserSessionResponse } from '@/types/api';

const usuario: UserSessionResponse = {
  id: 'usuario-1',
  email: 'dev@creed.example.com',
  role: 'admin',
  link_id: null,
  organization_id: null,
  organization_name: null,
};

const skippedProfile: DemographicResponse = {
  id: 'perfil-1',
  participant_id: 'participante-1',
  gender: null,
  age_range: null,
  ethnicities: [],
  religions: [],
  nationality: null,
  brazil_state: null,
  portugal_region: null,
  other_nationality: null,
  perspective: null,
  created_at: '2026-11-12T14:30:00Z',
  updated_at: null,
};

function Dashboard() {
  const { search, hash } = useLocation();
  return (
    <>
      <p>
        área logada{search}
        {hash}
      </p>
      <Link to="/questionnaire">Questionário</Link>
    </>
  );
}

// Store isolada, já com o usuário logado — ver
// creed-ai-context/conventions/camadas-do-front.md § "Testando View
// conectada ao Redux".
function renderSignedIn({ enabled = true } = {}) {
  const store = configureStore({
    reducer: {
      authentication: authenticationReducer,
      demographics: demographicsReducer,
    },
    preloadedState: {
      authentication: {
        user: usuario,
        status: 'authenticated' as const,
        error: null,
        passwordReset: { status: 'idle' as const, error: null },
      },
    },
  });
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/dashboard?periodo=atual#resumo']}>
        <Routes>
          <Route path="/login" element={<p>tela de login</p>} />
          <Route element={<ProtectedRoute enabled={enabled} />}>
            <Route
              path="/demographics/step-2"
              element={<DemographicsStep2Route />}
            />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/questionnaire"
              element={<p>entrada do questionário</p>}
            />
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
    vi.spyOn(demographicsApi, 'getMyDemographics').mockRejectedValue(
      new ApiError('Perfil demográfico não encontrado', 404),
    );
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('waits for consent before fetching the profile or opening the dashboard', () => {
    renderSignedIn();

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.queryByText(/área logada/)).toBeNull();
    expect(demographicsApi.getMyDemographics).not.toHaveBeenCalled();
  });

  it('opens the onboarding after consent when the profile is missing', async () => {
    renderSignedIn();

    await userEvent.click(screen.getByRole('button', { name: 'Aceitar' }));

    expect(
      await screen.findByRole('combobox', { name: /Gênero/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('resumes onboarding on the next access when consent was saved but the profile was not', async () => {
    const { unmount } = renderSignedIn();

    await userEvent.click(screen.getByRole('button', { name: 'Aceitar' }));
    await screen.findByRole('combobox', { name: /Gênero/ });

    unmount();
    renderSignedIn();

    expect(
      await screen.findByRole('combobox', { name: /Gênero/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(screen.queryByText(/área logada/)).toBeNull();
    expect(demographicsApi.getMyDemographics).toHaveBeenCalledTimes(2);
  });

  it.each([true, false])(
    'keeps the requested URL for an empty saved profile (existing consent: %s)',
    async (hasConsent) => {
      vi.mocked(demographicsApi.getMyDemographics).mockResolvedValue(
        skippedProfile,
      );
      if (hasConsent) recordTermsAcceptance(usuario.id);
      renderSignedIn();
      if (!hasConsent) {
        await userEvent.click(screen.getByRole('button', { name: 'Aceitar' }));
      }

      expect(
        await screen.findByText('área logada?periodo=atual#resumo'),
      ).toBeInTheDocument();
      expect(screen.queryByRole('alertdialog')).toBeNull();
      expect(screen.queryByRole('combobox', { name: /Gênero/ })).toBeNull();
      await userEvent.click(screen.getByRole('link', { name: 'Questionário' }));
      expect(screen.getByText('entrada do questionário')).toBeInTheDocument();
      expect(demographicsApi.getMyDemographics).toHaveBeenCalledTimes(1);
    },
  );

  it('returns to login without fetching the profile when consent is declined', async () => {
    renderSignedIn();

    await userEvent.click(screen.getByRole('button', { name: 'Recusar' }));

    expect(await screen.findByText('tela de login')).toBeInTheDocument();
    expect(screen.queryByText(/área logada/)).toBeNull();
    expect(demographicsApi.getMyDemographics).not.toHaveBeenCalled();
  });

  it('retries a failed profile check before opening the requested page', async () => {
    recordTermsAcceptance(usuario.id);
    vi.mocked(demographicsApi.getMyDemographics)
      .mockRejectedValueOnce(new ApiError('Erro interno', 500))
      .mockResolvedValueOnce(skippedProfile);
    renderSignedIn();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar seus dados.',
    );
    expect(screen.queryByText(/área logada/)).toBeNull();
    await userEvent.click(
      screen.getByRole('button', { name: 'Tentar novamente' }),
    );
    expect(
      await screen.findByText('área logada?periodo=atual#resumo'),
    ).toBeInTheDocument();
  });

  it('opens the protected page directly when login is disabled', () => {
    renderSignedIn({ enabled: false });

    expect(screen.getByText(/área logada/)).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(demographicsApi.getMyDemographics).not.toHaveBeenCalled();
  });
});
