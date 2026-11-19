import { afterEach, describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authenticationReducer from '@/features/authentication/authenticationSlice';
import { demographicsApi } from '@/features/demographics/demographicsApi';
import demographicsReducer from '@/features/demographics/demographicsSlice';
import responsesReducer, { loadQuestionnaire } from './responsesSlice';
import { responsesApi } from './responsesApi';
import { questionsApi } from '@/features/questions/questionsApi';
import { ApiError } from '@/lib/apiClient';
import type {
  CurrentFormRead,
  FormResponseResponse,
  UserSessionResponse,
} from '@/types/api';
import { QuestionnaireOnboardingView } from './QuestionnaireOnboardingView';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

function DemographicsReview() {
  const state = useLocation().state as { review?: boolean } | null;
  return <p>{state?.review ? 'perfil em revisão' : 'perfil'}</p>;
}

describe('QuestionnaireOnboardingView', () => {
  const currentForm: CurrentFormRead = {
    form: {
      id: 'form-1',
      name: 'Formulário',
      organization_id: 'organization-1',
      status: 'published',
      opens_at: null,
      closes_at: null,
      link_id: null,
      created_at: '2026-01-01T00:00:00Z',
    },
    form_response: null,
  };
  const submittedResponse: FormResponseResponse = {
    id: 'response-1',
    form_id: 'form-1',
    vinculo_id: 'link-1',
    status: 'submitted',
    started_at: '2026-01-01T00:00:00Z',
    submitted_at: '2026-01-02T00:00:00Z',
  };

  function createDeferredCurrentForm() {
    let resolve!: (value: CurrentFormRead) => void;
    const promise = new Promise<CurrentFormRead>((resolvePromise) => {
      resolve = resolvePromise;
    });
    return { promise, resolve };
  }

  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const GESTORA: UserSessionResponse = {
    id: 'usuario-1',
    email: 'gestora@example.com',
    name: 'Ana Gestora',
    role: 'gestor',
    link_id: 'vinculo-1',
    organization_id: 'org-1',
    organization_name: null,
  };

  // O menu do topo lê o papel na sessão; vazia, ele mostra o de respondente.
  // Com `user`, a sessão de quem entrou (o cabeçalho mostra o nome).
  function criarStore(user?: UserSessionResponse) {
    return configureStore({
      reducer: {
        authentication: authenticationReducer,
        responses: responsesReducer,
      },
      ...(user && {
        preloadedState: {
          authentication: {
            user,
            status: 'authenticated' as const,
            error: null,
            passwordReset: { status: 'idle' as const, error: null },
          },
        },
      }),
    });
  }

  function renderizar(
    getCurrentForm: () => Promise<CurrentFormRead> = () =>
      Promise.resolve(currentForm),
    store: ReturnType<typeof criarStore> = criarStore(),
  ) {
    vi.spyOn(responsesApi, 'getCurrentForm').mockImplementation(getCurrentForm);
    vi.spyOn(questionsApi, 'listQuestions').mockResolvedValue([]);
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <QuestionnaireOnboardingView />
        </MemoryRouter>
      </Provider>,
    );
  }

  it('should render header with user name and title', () => {
    renderizar(undefined, criarStore(GESTORA));

    // O nome vem da sessão, de gestora ou de quem responde.
    expect(screen.getByText('Ana Gestora')).toBeInTheDocument();
    expect(screen.queryByText('João Silva')).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Formulário' }),
    ).toBeInTheDocument();
    return screen.findByText('Você tem um questionário disponível');
  });

  // Os testes de "carregando" terminam a carga no fim: um thunk pendurado
  // seguiria rodando depois que o teste seguinte trocou os spies da API.
  it('shows loading while checking the current questionnaire', async () => {
    const { promise, resolve } = createDeferredCurrentForm();
    renderizar(() => promise);

    expect(screen.getByText('Vamos começar?')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Carregando');

    resolve(currentForm);
    await screen.findByText('Você tem um questionário disponível');
  });

  it('keeps start disabled while checking the current questionnaire', async () => {
    const { promise, resolve } = createDeferredCurrentForm();
    renderizar(() => promise);

    expect(screen.getByRole('button', { name: 'Iniciar' })).toBeDisabled();

    resolve(currentForm);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Iniciar' })).toBeEnabled();
    });
  });

  it('does not show the available card from a previous visit while checking', async () => {
    // Visita anterior: o slice ficou "disponível". A pessoa enviou e voltou.
    const store = criarStore();
    vi.spyOn(responsesApi, 'getCurrentForm').mockResolvedValue(currentForm);
    vi.spyOn(questionsApi, 'listQuestions').mockResolvedValue([]);
    await store.dispatch(loadQuestionnaire('pt-BR'));
    const { promise, resolve } = createDeferredCurrentForm();
    renderizar(() => promise, store);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
    expect(screen.queryByText(/Suas respostas ajudam/)).not.toBeInTheDocument();

    resolve({ ...currentForm, form_response: submittedResponse });
    expect(
      await screen.findByText('Você já respondeu este questionário.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Suas respostas ajudam/)).not.toBeInTheDocument();
  });

  it('shows a server error as an alert and retries on request', async () => {
    const getCurrentForm = vi
      .fn<() => Promise<CurrentFormRead>>()
      .mockRejectedValueOnce(new ApiError('erro', 500))
      .mockResolvedValueOnce(currentForm);
    renderizar(getCurrentForm);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      i18n.t('formulario:erros.servicoIndisponivel'),
    );
    expect(screen.getByRole('button', { name: 'Iniciar' })).toBeDisabled();

    await userEvent.click(
      screen.getByRole('button', { name: 'Tentar novamente' }),
    );

    expect(
      await screen.findByText('Você tem um questionário disponível'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(getCurrentForm).toHaveBeenCalledTimes(2);
  });

  it('does not offer retrying when access is denied', async () => {
    renderizar(() => Promise.reject(new ApiError('forbidden', 403)));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      i18n.t('formulario:erros.semAcesso'),
    );
    expect(
      screen.queryByRole('button', { name: 'Tentar novamente' }),
    ).not.toBeInTheDocument();
  });

  it('keeps "Vamos começar?" as the title when a questionnaire is open', async () => {
    renderizar();

    expect(
      await screen.findByRole('heading', { level: 2, name: 'Vamos começar?' }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Iniciar' })).toBeEnabled();
    });
  });

  it('enables starting when a questionnaire is open', async () => {
    renderizar();

    expect(
      await screen.findByText('Você tem um questionário disponível'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Suas respostas ajudam a mapear não apenas o panorama da sua organização, mas também o seu.',
      ),
    ).toBeInTheDocument();
    // Saíram a promessa de pausar com o progresso salvo, a duração e as seções.
    expect(screen.queryByText(/pausar/)).not.toBeInTheDocument();
    expect(screen.queryByText(/minutos/)).not.toBeInTheDocument();
    expect(screen.queryByText(/seções/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar' })).toBeEnabled();
  });

  it('shows no-open-questionnaire message and disables starting', async () => {
    renderizar(() => Promise.reject(new ApiError('not found', 404)));

    // O aviso vira o título do card, no lugar do "Vamos começar?".
    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: 'Nenhum questionário aberto para você no momento.',
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Vamos começar?')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar' })).toBeDisabled();
  });

  it('shows already-answered message and disables starting', async () => {
    renderizar(() =>
      Promise.resolve({
        ...currentForm,
        form_response: submittedResponse,
      }),
    );

    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: 'Você já respondeu este questionário.',
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Vamos começar?')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar' })).toBeDisabled();
  });

  it.each([
    ['pt-BR', 'Nenhum questionário aberto para você no momento.'],
    ['en', 'There is no questionnaire open for you right now.'],
    ['es', 'No hay ningún cuestionario abierto para ti en este momento.'],
  ])(
    'translates the no-questionnaire state in %s',
    async (language, message) => {
      await i18n.changeLanguage(language);
      renderizar(() => Promise.reject(new ApiError('not found', 404)));

      expect(await screen.findByText(message)).toBeInTheDocument();
    },
  );

  it.each([
    ['pt-BR', 'Você já respondeu este questionário.'],
    ['en', 'You have already answered this questionnaire.'],
    ['es', 'Ya has respondido este cuestionario.'],
  ])('translates the submitted state in %s', async (language, message) => {
    await i18n.changeLanguage(language);
    renderizar(() =>
      Promise.resolve({
        ...currentForm,
        form_response: submittedResponse,
      }),
    );

    expect(await screen.findByText(message)).toBeInTheDocument();
  });

  it('should render the header menu items with accessible names', () => {
    renderizar();

    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Questionário' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sobre' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument();
    return screen.findByText('Você tem um questionário disponível');
  });

  it('should open modal when start button is clicked', async () => {
    renderizar();

    await screen.findByText('Você tem um questionário disponível');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Iniciar' })).toBeEnabled();
    });
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar' }));

    expect(screen.getByText('Atualizar Informações')).toBeInTheDocument();
  });

  it('should go to the questionnaire when "Iniciar questionário" is clicked', async () => {
    vi.spyOn(responsesApi, 'getCurrentForm').mockResolvedValue(currentForm);
    vi.spyOn(questionsApi, 'listQuestions').mockResolvedValue([]);
    const store = configureStore({
      reducer: {
        authentication: authenticationReducer,
        responses: responsesReducer,
      },
    });
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/questionnaire']}>
          <Routes>
            <Route
              path="/questionnaire"
              element={<QuestionnaireOnboardingView />}
            />
            <Route
              path="/questionnaire/questions"
              element={<p>questionário</p>}
            />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    await screen.findByText('Você tem um questionário disponível');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Iniciar' })).toBeEnabled();
    });
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar' }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Iniciar questionário' }),
    );

    expect(await screen.findByText('questionário')).toBeInTheDocument();
  });

  it('requests the saved demographics and opens review for an available questionnaire', async () => {
    vi.spyOn(responsesApi, 'getCurrentForm').mockResolvedValue(currentForm);
    vi.spyOn(questionsApi, 'listQuestions').mockResolvedValue([]);
    const loadProfile = vi
      .spyOn(demographicsApi, 'getMyDemographics')
      .mockRejectedValue(
        new ApiError('Perfil demográfico não encontrado', 404),
      );
    const store = configureStore({
      reducer: {
        authentication: authenticationReducer,
        demographics: demographicsReducer,
        responses: responsesReducer,
      },
    });
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/questionnaire']}>
          <Routes>
            <Route
              path="/questionnaire"
              element={<QuestionnaireOnboardingView />}
            />
            <Route
              path="/demographics/step-2"
              element={<DemographicsReview />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Iniciar' })).toBeEnabled();
    });
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar' }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Revisar dados' }),
    );

    expect(await screen.findByText('perfil em revisão')).toBeInTheDocument();
    expect(loadProfile).toHaveBeenCalledTimes(1);
  });

  it('should translate all texts when changing language', async () => {
    await i18n.changeLanguage('en');
    renderizar();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Form' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Shall we get started?')).toBeInTheDocument();
    await screen.findByText('you have a questionnaire available');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Start' })).toBeEnabled();
    });
  });

  it('should render CREED.ai wordmark', () => {
    renderizar();

    const wordmark = screen.getByAltText('CREED.ai');
    expect(wordmark).toBeInTheDocument();
    return screen.findByText('Você tem um questionário disponível');
  });
});
