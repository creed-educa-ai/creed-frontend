import { afterEach, describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authenticationReducer from '@/features/authentication/authenticationSlice';
import responsesReducer from './responsesSlice';
import { responsesApi } from './responsesApi';
import { questionsApi } from '@/features/questions/questionsApi';
import { ApiError } from '@/lib/apiClient';
import type { CurrentFormRead, FormResponseResponse } from '@/types/api';
import { QuestionnaireOnboardingView } from './QuestionnaireOnboardingView';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

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

  // O menu do topo lê o papel na sessão; vazia, ele mostra o de respondente.
  function renderizar(
    getCurrentForm: () => Promise<CurrentFormRead> = () =>
      Promise.resolve(currentForm),
  ) {
    vi.spyOn(responsesApi, 'getCurrentForm').mockImplementation(getCurrentForm);
    vi.spyOn(questionsApi, 'listQuestions').mockResolvedValue([]);
    const store = configureStore({
      reducer: {
        authentication: authenticationReducer,
        responses: responsesReducer,
      },
    });
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <QuestionnaireOnboardingView />
        </MemoryRouter>
      </Provider>,
    );
  }

  it('should render header with user name and title', () => {
    renderizar();

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Formulário' }),
    ).toBeInTheDocument();
    return screen.findByText('Você tem um questionário disponível');
  });

  it('shows loading while checking the current questionnaire', () => {
    const { promise } = createDeferredCurrentForm();
    renderizar(() => promise);

    expect(screen.getByText('Vamos começar?')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
  });

  it('keeps start disabled while checking the current questionnaire', () => {
    const { promise } = createDeferredCurrentForm();
    renderizar(() => promise);

    expect(screen.getByRole('button', { name: 'Iniciar' })).toBeDisabled();
  });

  it('enables starting when a questionnaire is open', async () => {
    renderizar();

    expect(
      await screen.findByText('Você tem um questionário disponível'),
    ).toBeInTheDocument();
    expect(screen.getByText(/Suas respostas ajudam/)).toBeInTheDocument();
    expect(screen.getByText('~15 minutos')).toBeInTheDocument();
    expect(screen.getByText('4 seções')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar' })).toBeEnabled();
  });

  it('shows no-open-questionnaire message and disables starting', async () => {
    renderizar(() => Promise.reject(new ApiError('not found', 404)));

    expect(
      await screen.findByText(
        'Nenhum questionário aberto para você no momento.',
      ),
    ).toBeInTheDocument();
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
      await screen.findByText('Você já respondeu este questionário.'),
    ).toBeInTheDocument();
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
