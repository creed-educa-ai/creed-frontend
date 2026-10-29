import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import authenticationReducer from '@/features/authentication/authenticationSlice';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { responsesApi } from './responsesApi';
import responsesReducer from './responsesSlice';
import { RevisaoRespostasRoute } from './RevisaoRespostasRoute';
import { SubmissionConfirmationView } from './SubmissionConfirmationView';

beforeEach(async () => {
  await i18n.changeLanguage(IDIOMA_PADRAO);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// O Voltar leva ao dashboard do papel de quem está na sessão.
function renderizar(role: string | null = null) {
  const store = configureStore({
    reducer: { authentication: authenticationReducer },
    preloadedState: {
      authentication: {
        user: role
          ? {
              id: 'usuario-1',
              email: 'dev@creed.example.com',
              role,
              link_id: null,
              organization_id: null,
              organization_name: null,
            }
          : null,
        status: role ? ('authenticated' as const) : ('idle' as const),
        error: null,
        passwordReset: { status: 'idle' as const, error: null },
      },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <SubmissionConfirmationView />
      </MemoryRouter>
    </Provider>,
  );
}

describe('SubmissionConfirmationView', () => {
  it('mostra o agradecimento e a confirmação do envio', () => {
    renderizar();

    expect(
      screen.getByRole('heading', { name: 'Obrigado por responder' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Suas respostas foram enviadas.'),
    ).toBeInTheDocument();
    expect(screen.getByAltText('CREED.ai')).toBeInTheDocument();
  });

  it('o botão Voltar leva o respondente ao dashboard individual', () => {
    renderizar('respondente');

    expect(screen.getByRole('link', { name: 'Voltar' })).toHaveAttribute(
      'href',
      '/dashboard',
    );
  });

  it('o botão Voltar leva o admin ao dashboard da organização', () => {
    renderizar('admin');

    expect(screen.getByRole('link', { name: 'Voltar' })).toHaveAttribute(
      'href',
      '/dashboard/company',
    );
  });

  it('aparece depois de confirmar o envio na revisão', async () => {
    // O envio passa pelo back (CREED-48): simula os três passos.
    const formResponse = {
      id: 'fr-1',
      form_id: 'form-1',
      vinculo_id: 'link-1',
      status: 'in_progress' as const,
      started_at: '2026-09-30T18:39:04Z',
      submitted_at: null,
    };
    vi.spyOn(responsesApi, 'createFormResponse').mockResolvedValue(
      formResponse,
    );
    vi.spyOn(responsesApi, 'recordAnswer').mockResolvedValue({
      id: 'a-1',
      form_response_id: 'fr-1',
      question_id: '1-1',
      option_id: null,
      value: '4',
      created_at: '2026-09-30T18:39:04Z',
    });
    vi.spyOn(responsesApi, 'submitFormResponse').mockResolvedValue({
      ...formResponse,
      status: 'submitted',
    });
    const store = configureStore({
      reducer: {
        authentication: authenticationReducer,
        responses: responsesReducer,
      },
    });
    const user = userEvent.setup();
    render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/questionnaire/review',
              state: {
                questions: [
                  {
                    id: '1-1',
                    section: 1,
                    text: 'Pergunta de teste',
                    type: 'quantitativa',
                    options: ['1', '2', '3', '4', '5'],
                    required: true,
                    answer: '4',
                  },
                ],
              },
            },
          ]}
        >
          <Routes>
            <Route
              path="/questionnaire/review"
              element={<RevisaoRespostasRoute />}
            />
            <Route
              path="/questionnaire/submitted"
              element={<SubmissionConfirmationView />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    await user.click(screen.getByRole('button', { name: 'Enviar respostas' }));
    await user.click(
      await screen.findByRole('button', { name: 'Confirmar envio' }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Obrigado por responder' }),
    ).toBeInTheDocument();
  });
});
