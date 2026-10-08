import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
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

describe('SubmissionConfirmationView', () => {
  it('mostra o agradecimento e a confirmação do envio', () => {
    render(
      <MemoryRouter>
        <SubmissionConfirmationView />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'Obrigado por responder' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Suas respostas foram enviadas.'),
    ).toBeInTheDocument();
    expect(screen.getByAltText('CREED.ai')).toBeInTheDocument();
  });

  it('o botão Voltar leva ao onboarding do questionário', () => {
    render(
      <MemoryRouter>
        <SubmissionConfirmationView />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Voltar' })).toHaveAttribute(
      'href',
      '/onboard-quest',
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
    const store = configureStore({ reducer: { responses: responsesReducer } });
    const user = userEvent.setup();
    render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/questionario/revisao',
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
              path="/questionario/revisao"
              element={<RevisaoRespostasRoute />}
            />
            <Route
              path="/questionario/enviado"
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
