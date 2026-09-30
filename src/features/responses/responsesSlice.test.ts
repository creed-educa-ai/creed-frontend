import { configureStore } from '@reduxjs/toolkit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { responsesApi } from '@/features/responses/responsesApi';
import reducer, {
  clearSubmissionError,
  DEMO_FORM_ID,
  loadQuestionnaire,
  selectQuestionnaireSections,
  submitResponses,
} from '@/features/responses/responsesSlice';
import { ApiError } from '@/lib/apiClient';
import type {
  AnswerResponse,
  FormRead,
  FormResponseResponse,
  QuestionResponse,
} from '@/types/api';

const FORM_RESPONSE_ID = '3b1bb89a-471f-48b0-9025-cfda3b20d240';

const formResponse: FormResponseResponse = {
  id: FORM_RESPONSE_ID,
  form_id: DEMO_FORM_ID,
  vinculo_id: 'e541e500-8b88-45e7-9195-b6079023922b',
  status: 'in_progress',
  started_at: '2026-09-30T18:39:04Z',
  submitted_at: null,
};

function answerResponse(questionId: string): AnswerResponse {
  return {
    id: `answer-${questionId}`,
    form_response_id: FORM_RESPONSE_ID,
    question_id: questionId,
    option_id: null,
    value: 'texto',
    created_at: '2026-09-30T18:39:04Z',
  };
}

const form: FormRead = {
  id: DEMO_FORM_ID,
  name: '[Demonstração] Formulário de teste',
  organization_id: '00000000-0000-0000-0000-000000000001',
  status: 'draft',
  created_at: '2026-09-30T18:38:18Z',
};

function question(
  overrides: Partial<QuestionResponse> & Pick<QuestionResponse, 'id'>,
): QuestionResponse {
  return {
    form_id: DEMO_FORM_ID,
    text: `Pergunta ${overrides.id}`,
    order_index: 0,
    type: 'descriptive',
    section: 'profile',
    required: true,
    prisma: null,
    created_at: '2026-09-30T18:38:18Z',
    ...overrides,
  };
}

// Um store de verdade só com este slice: o thunk roda inteiro, e o teste lê o
// estado como a tela vai ler.
function criarStore() {
  return configureStore({ reducer: { responses: reducer } });
}

// O seletor espera o RootState da aplicação; aqui só o pedaço que ele lê.
function secoes(store: ReturnType<typeof criarStore>) {
  return selectQuestionnaireSections(
    store.getState() as Parameters<typeof selectQuestionnaireSections>[0],
  );
}

describe('responsesSlice', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('começa sem nada carregado', () => {
    const state = reducer(undefined, { type: '@@INIT' });

    expect(state).toEqual({
      form: null,
      questions: [],
      status: 'idle',
      error: null,
      submission: {
        status: 'idle',
        error: null,
        formResponseId: null,
        savedQuestionIds: [],
      },
    });
  });

  it('fica em loading enquanto carrega', () => {
    const state = reducer(undefined, {
      type: loadQuestionnaire.pending.type,
    });

    expect(state.status).toBe('loading');
  });

  it('carrega o formulário e as perguntas pelo id pedido', async () => {
    const getForm = vi.spyOn(responsesApi, 'getForm').mockResolvedValue(form);
    const listQuestions = vi
      .spyOn(responsesApi, 'listQuestions')
      .mockResolvedValue([question({ id: 'q1' })]);
    const store = criarStore();

    await store.dispatch(loadQuestionnaire(DEMO_FORM_ID));

    expect(getForm).toHaveBeenCalledWith(DEMO_FORM_ID);
    expect(listQuestions).toHaveBeenCalledWith(DEMO_FORM_ID);
    const state = store.getState().responses;
    expect(state.status).toBe('ready');
    expect(state.form).toEqual(form);
    expect(state.questions).toHaveLength(1);
  });

  it('formulário sem pergunta fica ready, com lista vazia', async () => {
    vi.spyOn(responsesApi, 'getForm').mockResolvedValue(form);
    vi.spyOn(responsesApi, 'listQuestions').mockResolvedValue([]);
    const store = criarStore();

    await store.dispatch(loadQuestionnaire(DEMO_FORM_ID));

    expect(store.getState().responses.status).toBe('ready');
    expect(secoes(store)).toEqual([]);
  });

  it.each([
    [404, 'formulario:erros.naoEncontrado'],
    [403, 'formulario:erros.semAcesso'],
    [500, 'formulario:erros.servicoIndisponivel'],
  ])('erro %i vira a chave %s', async (status, chave) => {
    vi.spyOn(responsesApi, 'getForm').mockRejectedValue(
      new ApiError('erro do back', status),
    );
    const store = criarStore();

    await store.dispatch(loadQuestionnaire(DEMO_FORM_ID));

    const state = store.getState().responses;
    expect(state.status).toBe('error');
    expect(state.error).toBe(chave);
  });

  it('erro de rede, sem ApiError, vira servicoIndisponivel', async () => {
    vi.spyOn(responsesApi, 'getForm').mockRejectedValue(
      new TypeError('Failed to fetch'),
    );
    const store = criarStore();

    await store.dispatch(loadQuestionnaire(DEMO_FORM_ID));

    expect(store.getState().responses.error).toBe(
      'formulario:erros.servicoIndisponivel',
    );
  });

  describe('selectQuestionnaireSections', () => {
    async function storeCom(questions: QuestionResponse[]) {
      vi.spyOn(responsesApi, 'getForm').mockResolvedValue(form);
      vi.spyOn(responsesApi, 'listQuestions').mockResolvedValue(questions);
      const store = criarStore();
      await store.dispatch(loadQuestionnaire(DEMO_FORM_ID));
      return store;
    }

    it('ordena as seções por profile, assessment e closing, numeradas de 1', async () => {
      const store = await storeCom([
        question({ id: 'c', section: 'closing', order_index: 2 }),
        question({ id: 'p', section: 'profile', order_index: 0 }),
        question({ id: 'a', section: 'assessment', order_index: 1 }),
      ]);

      expect(
        secoes(store).map(({ numero, section }) => [numero, section]),
      ).toEqual([
        [1, 'profile'],
        [2, 'assessment'],
        [3, 'closing'],
      ]);
    });

    it('pula seção sem pergunta, sem deixar buraco na numeração', async () => {
      const store = await storeCom([
        question({ id: 'p', section: 'profile' }),
        question({ id: 'c', section: 'closing', order_index: 1 }),
      ]);

      expect(
        secoes(store).map(({ numero, section }) => [numero, section]),
      ).toEqual([
        [1, 'profile'],
        [2, 'closing'],
      ]);
    });

    it('ordena as perguntas da seção por order_index', async () => {
      const store = await storeCom([
        question({ id: 'segunda', order_index: 5 }),
        question({ id: 'primeira', order_index: 1 }),
      ]);

      expect(secoes(store)[0]?.questions.map(({ id }) => id)).toEqual([
        'primeira',
        'segunda',
      ]);
    });

    it('esconde as perguntas objetivas', async () => {
      const store = await storeCom([
        question({ id: 'descritiva', order_index: 0 }),
        question({ id: 'objetiva', order_index: 1, type: 'objective' }),
        question({
          id: 'so-objetiva',
          section: 'closing',
          order_index: 2,
          type: 'objective',
        }),
      ]);

      const resultado = secoes(store);
      expect(resultado).toHaveLength(1);
      expect(resultado[0]?.questions.map(({ id }) => id)).toEqual([
        'descritiva',
      ]);
    });

    it('devolve a mesma lista enquanto as perguntas não mudam', async () => {
      const store = await storeCom([question({ id: 'q1' })]);

      expect(secoes(store)).toBe(secoes(store));
    });
  });

  describe('submitResponses', () => {
    const respostas = [
      { question_id: 'q1', value: 'Primeira' },
      { question_id: 'q2', value: 'Segunda' },
      // Opcional em branco e sem resposta: não vão para o back (P-038).
      { question_id: 'q3', value: '   ' },
      { question_id: 'q4', value: null },
    ];

    function enviar(store: ReturnType<typeof criarStore>) {
      return store.dispatch(
        submitResponses({ formId: DEMO_FORM_ID, answers: respostas }),
      );
    }

    // Os três passos do envio, com o caminho feliz como padrão.
    function simularBack() {
      return {
        create: vi
          .spyOn(responsesApi, 'createFormResponse')
          .mockResolvedValue(formResponse),
        record: vi
          .spyOn(responsesApi, 'recordAnswer')
          .mockImplementation((_id, answer) =>
            Promise.resolve(answerResponse(answer.question_id)),
          ),
        submit: vi
          .spyOn(responsesApi, 'submitFormResponse')
          .mockResolvedValue({ ...formResponse, status: 'submitted' }),
      };
    }

    function gravadas(record: ReturnType<typeof simularBack>['record']) {
      return record.mock.calls.map(([, answer]) => answer.question_id);
    }

    it('abre, grava só as preenchidas e envia, nessa ordem', async () => {
      const back = simularBack();
      const store = criarStore();

      await enviar(store);

      expect(back.create).toHaveBeenCalledWith(DEMO_FORM_ID);
      expect(back.record).toHaveBeenNthCalledWith(1, FORM_RESPONSE_ID, {
        question_id: 'q1',
        value: 'Primeira',
      });
      expect(gravadas(back.record)).toEqual(['q1', 'q2']);
      expect(back.submit).toHaveBeenCalledWith(FORM_RESPONSE_ID);
      // Enviado: a retomada começa do zero.
      expect(store.getState().responses.submission).toEqual({
        status: 'ready',
        error: null,
        formResponseId: null,
        savedQuestionIds: [],
      });
    });

    it('409 ao abrir quer dizer que a pessoa já respondeu', async () => {
      const back = simularBack();
      back.create.mockRejectedValue(new ApiError('já existe', 409));
      const store = criarStore();

      await enviar(store);

      expect(back.record).not.toHaveBeenCalled();
      expect(back.submit).not.toHaveBeenCalled();
      expect(store.getState().responses.submission.error).toBe(
        'questionarioRevisao:erros.jaRespondido',
      );
    });

    it('falha no meio e a nova tentativa continua de onde parou', async () => {
      const back = simularBack();
      back.record.mockImplementation((_id, answer) =>
        answer.question_id === 'q2'
          ? Promise.reject(new ApiError('fora do ar', 503))
          : Promise.resolve(answerResponse(answer.question_id)),
      );
      const store = criarStore();

      await enviar(store);

      const depoisDaFalha = store.getState().responses.submission;
      expect(depoisDaFalha.status).toBe('error');
      expect(depoisDaFalha.error).toBe('questionarioRevisao:erros.envioFalhou');
      expect(depoisDaFalha.formResponseId).toBe(FORM_RESPONSE_ID);
      expect(depoisDaFalha.savedQuestionIds).toEqual(['q1']);
      expect(back.submit).not.toHaveBeenCalled();

      // O back voltou: tenta de novo.
      back.record.mockClear();
      back.record.mockImplementation((_id, answer) =>
        Promise.resolve(answerResponse(answer.question_id)),
      );
      await enviar(store);

      // Não abriu outra resposta e não gravou a q1 de novo.
      expect(back.create).toHaveBeenCalledOnce();
      expect(gravadas(back.record)).toEqual(['q2']);
      expect(back.submit).toHaveBeenCalledOnce();
      expect(store.getState().responses.submission.status).toBe('ready');
    });

    it('409 ao gravar uma pergunta conta como já gravada', async () => {
      const back = simularBack();
      back.record.mockImplementation((_id, answer) =>
        answer.question_id === 'q1'
          ? Promise.reject(new ApiError('já respondida', 409))
          : Promise.resolve(answerResponse(answer.question_id)),
      );
      const store = criarStore();

      await enviar(store);

      expect(gravadas(back.record)).toEqual(['q1', 'q2']);
      expect(back.submit).toHaveBeenCalledOnce();
      expect(store.getState().responses.submission.status).toBe('ready');
    });

    it('409 ao enviar conta como enviado', async () => {
      const back = simularBack();
      back.submit.mockRejectedValue(new ApiError('já submetido', 409));
      const store = criarStore();

      await enviar(store);

      expect(store.getState().responses.submission.status).toBe('ready');
    });

    it('erro de rede vira envioFalhou', async () => {
      const back = simularBack();
      back.create.mockRejectedValue(new TypeError('Failed to fetch'));
      const store = criarStore();

      await enviar(store);

      expect(store.getState().responses.submission.error).toBe(
        'questionarioRevisao:erros.envioFalhou',
      );
    });

    it('clearSubmissionError apaga só o erro, não o que já foi gravado', async () => {
      const back = simularBack();
      back.submit.mockRejectedValue(new ApiError('fora do ar', 503));
      const store = criarStore();
      await enviar(store);

      store.dispatch(clearSubmissionError());

      const submission = store.getState().responses.submission;
      expect(submission.error).toBeNull();
      expect(submission.formResponseId).toBe(FORM_RESPONSE_ID);
      expect(submission.savedQuestionIds).toEqual(['q1', 'q2']);
    });
  });
});
