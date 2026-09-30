import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RevisaoRespostasRoute } from '@/features/responses/RevisaoRespostasRoute';
import type { ReviewQuestion } from '@/features/responses/RevisaoRespostasView';
import { responsesApi } from '@/features/responses/responsesApi';
import responsesReducer, {
  DEMO_FORM_ID,
} from '@/features/responses/responsesSlice';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { ApiError } from '@/lib/apiClient';
import type { FormResponseResponse } from '@/types/api';

const FORM_RESPONSE_ID = '3b1bb89a-471f-48b0-9025-cfda3b20d240';

const formResponse: FormResponseResponse = {
  id: FORM_RESPONSE_ID,
  form_id: DEMO_FORM_ID,
  vinculo_id: 'e541e500-8b88-45e7-9195-b6079023922b',
  status: 'in_progress',
  started_at: '2026-09-30T18:39:04Z',
  submitted_at: null,
};

// O que o FormView manda pela rota: o id é o da pergunta no back.
const questions: ReviewQuestion[] = [
  {
    id: 'q-perfil',
    section: 1,
    text: 'Pergunta de perfil',
    type: 'dissertativa',
    options: [],
    required: true,
    answer: 'Resposta de perfil',
  },
  {
    id: 'q-fechamento',
    section: 2,
    text: 'Pergunta de fechamento',
    type: 'dissertativa',
    options: [],
    required: false,
    answer: null,
  },
];

function renderizar() {
  const store = configureStore({ reducer: { responses: responsesReducer } });
  render(
    <Provider store={store}>
      <MemoryRouter
        initialEntries={[
          { pathname: '/questionario/revisao', state: { questions } },
        ]}
      >
        <Routes>
          <Route
            path="/questionario/revisao"
            element={<RevisaoRespostasRoute />}
          />
          <Route path="/questionario/enviado" element={<h1>Enviado</h1>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

async function confirmarEnvio() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Enviar respostas' }));
  await user.click(
    within(screen.getByRole('alertdialog')).getByRole('button', {
      name: 'Confirmar envio',
    }),
  );
}

describe('RevisaoRespostasRoute', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('grava as respostas e só depois vai para a tela de enviado', async () => {
    vi.spyOn(responsesApi, 'createFormResponse').mockResolvedValue(
      formResponse,
    );
    const record = vi.spyOn(responsesApi, 'recordAnswer').mockResolvedValue({
      id: 'a1',
      form_response_id: FORM_RESPONSE_ID,
      question_id: 'q-perfil',
      option_id: null,
      value: 'Resposta de perfil',
      created_at: '2026-09-30T18:39:04Z',
    });
    const submit = vi
      .spyOn(responsesApi, 'submitFormResponse')
      .mockResolvedValue({ ...formResponse, status: 'submitted' });
    renderizar();

    await confirmarEnvio();

    expect(
      await screen.findByRole('heading', { name: 'Enviado' }),
    ).toBeInTheDocument();
    // Só a preenchida foi gravada; a opcional em branco ficou de fora.
    expect(record).toHaveBeenCalledOnce();
    expect(record).toHaveBeenCalledWith(FORM_RESPONSE_ID, {
      question_id: 'q-perfil',
      value: 'Resposta de perfil',
    });
    expect(submit).toHaveBeenCalledWith(FORM_RESPONSE_ID);
  });

  it('fica na revisão e avisa quando a pessoa já respondeu', async () => {
    vi.spyOn(responsesApi, 'createFormResponse').mockRejectedValue(
      new ApiError('já existe', 409),
    );
    renderizar();

    await confirmarEnvio();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Você já respondeu este questionário.',
    );
    expect(
      screen.queryByRole('heading', { name: 'Enviado' }),
    ).not.toBeInTheDocument();
  });
});
