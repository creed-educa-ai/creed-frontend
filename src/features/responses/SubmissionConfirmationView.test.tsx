import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { RevisaoRespostasRoute } from './RevisaoRespostasRoute';
import { SubmissionConfirmationView } from './SubmissionConfirmationView';

beforeEach(async () => {
  await i18n.changeLanguage(IDIOMA_PADRAO);
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
    const user = userEvent.setup();
    render(
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
      </MemoryRouter>,
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
