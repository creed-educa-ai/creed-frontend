import { configureStore } from '@reduxjs/toolkit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { questionsApi } from '@/features/questions/questionsApi';
import { responsesApi } from '@/features/responses/responsesApi';
import reducer, {
  clearSubmissionError,
  loadQuestionnaire,
  paraAnswerCreate,
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

// O período aberto para a pessoa: quem escolhe é o back (`/forms/current`).
const FORM_ID = 'd40b7a55-b9cc-4b78-ae5d-ab325fd655e2';
const FORM_RESPONSE_ID = '3b1bb89a-471f-48b0-9025-cfda3b20d240';

const formResponse: FormResponseResponse = {
  id: FORM_RESPONSE_ID,
  form_id: FORM_ID,
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
  id: FORM_ID,
  name: 'Período 2026/2',
  organization_id: '00000000-0000-0000-0000-000000000001',
  status: 'draft',
  opens_at: '2026-11-01T12:00:00Z',
  closes_at: '2026-12-01T12:00:00Z',
  link_id: null,
  created_at: '2026-09-30T18:38:18Z',
};

function question(
  overrides: Partial<QuestionResponse> & Pick<QuestionResponse, 'id'>,
): QuestionResponse {
  return {
    instrument_id: 'instrumento-creed',
    text: `Pergunta ${overrides.id}`,
    order_index: 0,
    type: 'descriptive',
    section: 'S2',
    required: true,
    dimensao: null,
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

// Store com as perguntas já no estado, como se o carregamento tivesse
// terminado, mas sem passar pelo thunk.
function criarStoreCom(questions: QuestionResponse[]) {
  const store = criarStore();
  store.dispatch(
    loadQuestionnaire.fulfilled(
      { form, formResponse: null, questions },
      'teste',
      'pt-BR',
    ),
  );
  return store;
}

// Objetiva com alternativas de rótulo "Rótulo <valor>".
function objetiva(
  id: string,
  order_index: number,
  valores: string[],
): QuestionResponse {
  return question({
    id,
    order_index,
    type: 'objective',
    options: valores.map((value, index) => ({
      id: `${id}-opcao-${value}`,
      question_id: id,
      label: `Rótulo ${value}`,
      value,
      order_index: index,
      created_at: '2026-09-30T18:38:18Z',
    })),
  });
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
      formResponse: null,
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

  it('já carregado, recarregar não volta a loading', () => {
    const carregado = reducer(
      undefined,
      loadQuestionnaire.fulfilled(
        { form, formResponse: null, questions: [] },
        'teste',
        'pt-BR',
      ),
    );

    const state = reducer(carregado, { type: loadQuestionnaire.pending.type });

    // A troca de idioma recarrega sem desmontar o questionário da tela.
    expect(state.status).toBe('ready');
  });

  it('carrega o questionário atual e as perguntas no idioma pedido', async () => {
    const getCurrentForm = vi
      .spyOn(responsesApi, 'getCurrentForm')
      .mockResolvedValue({ form, form_response: null });
    const listQuestions = vi
      .spyOn(questionsApi, 'listQuestions')
      .mockResolvedValue([question({ id: 'q1' })]);
    const store = criarStore();

    await store.dispatch(loadQuestionnaire('en'));

    expect(getCurrentForm).toHaveBeenCalledOnce();
    expect(listQuestions).toHaveBeenCalledWith(FORM_ID, { lang: 'en' });
    const state = store.getState().responses;
    expect(state.status).toBe('ready');
    expect(state.form).toEqual(form);
    expect(state.formResponse).toBeNull();
    expect(state.questions.map(({ id }) => id)).toEqual(['q1']);
  });

  it('formulário sem pergunta fica ready, com lista vazia', async () => {
    vi.spyOn(responsesApi, 'getCurrentForm').mockResolvedValue({
      form,
      form_response: null,
    });
    vi.spyOn(questionsApi, 'listQuestions').mockResolvedValue([]);
    const store = criarStore();

    await store.dispatch(loadQuestionnaire('pt-BR'));

    expect(store.getState().responses.status).toBe('ready');
    expect(secoes(store)).toEqual([]);
  });

  it('já enviado, guarda a resposta e não busca as perguntas', async () => {
    const enviada: FormResponseResponse = {
      ...formResponse,
      status: 'submitted',
      submitted_at: '2026-11-02T12:00:00Z',
    };
    vi.spyOn(responsesApi, 'getCurrentForm').mockResolvedValue({
      form,
      form_response: enviada,
    });
    const listQuestions = vi.spyOn(questionsApi, 'listQuestions');
    const store = criarStore();

    await store.dispatch(loadQuestionnaire('pt-BR'));

    expect(listQuestions).not.toHaveBeenCalled();
    const state = store.getState().responses;
    expect(state.status).toBe('ready');
    expect(state.formResponse).toEqual(enviada);
    // Já enviada, não é retomada.
    expect(state.submission.formResponseId).toBeNull();
  });

  it('em andamento, o envio continua na resposta que já existe', async () => {
    vi.spyOn(responsesApi, 'getCurrentForm').mockResolvedValue({
      form,
      form_response: formResponse,
    });
    vi.spyOn(questionsApi, 'listQuestions').mockResolvedValue([]);
    const store = criarStore();

    await store.dispatch(loadQuestionnaire('pt-BR'));

    expect(store.getState().responses.submission.formResponseId).toBe(
      FORM_RESPONSE_ID,
    );
  });

  it.each([
    [404, 'formulario:erros.semQuestionarioAberto'],
    [403, 'formulario:erros.semAcesso'],
    [500, 'formulario:erros.servicoIndisponivel'],
  ])('erro %i vira a chave %s', async (status, chave) => {
    vi.spyOn(responsesApi, 'getCurrentForm').mockRejectedValue(
      new ApiError('erro do back', status),
    );
    const store = criarStore();

    await store.dispatch(loadQuestionnaire('pt-BR'));

    const state = store.getState().responses;
    expect(state.status).toBe('error');
    expect(state.error).toBe(chave);
  });

  it('erro de rede, sem ApiError, vira servicoIndisponivel', async () => {
    vi.spyOn(responsesApi, 'getCurrentForm').mockRejectedValue(
      new TypeError('Failed to fetch'),
    );
    const store = criarStore();

    await store.dispatch(loadQuestionnaire('pt-BR'));

    expect(store.getState().responses.error).toBe(
      'formulario:erros.servicoIndisponivel',
    );
  });

  describe('selectQuestionnaireSections', () => {
    // Põe as perguntas direto no estado: aqui o que
    // se testa é só a regra do seletor.
    function storeCom(questions: QuestionResponse[]) {
      return criarStoreCom(questions);
    }

    it('ordena as seções na ordem do formulário original, numeradas de 1', () => {
      const store = storeCom([
        question({ id: 'c', section: 'S9', order_index: 2 }),
        question({ id: 'p', section: 'S2', order_index: 0 }),
        question({ id: 'a', section: 'S4', order_index: 1 }),
      ]);

      expect(
        secoes(store).map(({ numero, section }) => [numero, section]),
      ).toEqual([
        [1, 'S2'],
        [2, 'S4'],
        [3, 'S9'],
      ]);
    });

    it('pula seção sem pergunta, sem deixar buraco na numeração', () => {
      const store = storeCom([
        question({ id: 'p', section: 'S2' }),
        question({ id: 'c', section: 'S9', order_index: 1 }),
      ]);

      expect(
        secoes(store).map(({ numero, section }) => [numero, section]),
      ).toEqual([
        [1, 'S2'],
        [2, 'S9'],
      ]);
    });

    it('ordena as perguntas da seção por order_index', () => {
      const store = storeCom([
        question({ id: 'segunda', order_index: 5 }),
        question({ id: 'primeira', order_index: 1 }),
      ]);

      expect(secoes(store)[0]?.perguntas.map(({ id }) => id)).toEqual([
        'primeira',
        'segunda',
      ]);
    });

    it('esconde a objetiva sem alternativas (P-037)', () => {
      const store = storeCom([
        question({ id: 'descritiva', order_index: 0 }),
        question({ id: 'objetiva', order_index: 1, type: 'objective' }),
        question({
          id: 'so-objetiva',
          section: 'S9',
          order_index: 2,
          type: 'objective',
          options: [],
        }),
      ]);

      const resultado = secoes(store);
      expect(resultado).toHaveLength(1);
      expect(resultado[0]?.perguntas.map(({ id }) => id)).toEqual([
        'descritiva',
      ]);
    });

    it('converte cada tipo do back para o tipo da tela', () => {
      const store = storeCom([
        question({ id: 'texto', order_index: 0 }),
        objetiva('escala', 1, ['1', '2', '3', '4', '5']),
        objetiva('lista', 2, ['a', 'b', 'c']),
        // Cinco alternativas, mas não são 1 a 5: é lista (P-040).
        objetiva('quase', 3, ['0', '1', '2', '3', '4']),
      ]);

      expect(
        secoes(store)[0]?.perguntas.map(({ id, tipo }) => [id, tipo]),
      ).toEqual([
        ['texto', 'dissertativa'],
        ['escala', 'quantitativa'],
        ['lista', 'objetiva'],
        ['quase', 'objetiva'],
      ]);
    });

    it('entrega texto, obrigatoriedade e os rótulos das alternativas em ordem', () => {
      // Alternativas fora de ordem no back: a tela recebe pela order_index.
      const embaralhada = objetiva('lista', 0, ['a', 'b', 'c']);
      embaralhada.options = [...(embaralhada.options ?? [])].reverse();
      const store = storeCom([{ ...embaralhada, required: false }]);

      expect(secoes(store)[0]?.perguntas[0]).toEqual({
        id: 'lista',
        texto: 'Pergunta lista',
        tipo: 'objetiva',
        opcoes: ['Rótulo a', 'Rótulo b', 'Rótulo c'],
        obrigatoria: false,
      });
    });

    it('devolve a mesma lista enquanto as perguntas não mudam', () => {
      const store = storeCom([question({ id: 'q1' })]);

      expect(secoes(store)).toBe(secoes(store));
    });
  });

  describe('submitResponses', () => {
    // As perguntas que a tela carregou: o envio consulta o tipo de cada uma.
    const perguntasCarregadas = [
      question({ id: 'q1', order_index: 0 }),
      question({ id: 'q2', order_index: 1 }),
      question({ id: 'q3', order_index: 2, required: false }),
      question({ id: 'q4', order_index: 3, required: false }),
      objetiva('q5', 4, ['1', '2', '3', '4', '5']),
    ];

    const respostas = [
      { question_id: 'q1', answer: 'Primeira' },
      { question_id: 'q2', answer: 'Segunda' },
      // Opcional em branco e sem resposta: não vão para o back (P-038).
      { question_id: 'q3', answer: '   ' },
      { question_id: 'q4', answer: null },
      // Objetiva respondida: vai em `option_id`, achado pelo rótulo (P-039).
      { question_id: 'q5', answer: 'Rótulo 3' },
    ];

    function criarStore() {
      return criarStoreCom(perguntasCarregadas);
    }

    function enviar(store: ReturnType<typeof criarStore>) {
      return store.dispatch(submitResponses({ answers: respostas }));
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

      // O formulário é o que o carregamento trouxe.
      expect(back.create).toHaveBeenCalledWith(FORM_ID);
      expect(back.record).toHaveBeenNthCalledWith(1, FORM_RESPONSE_ID, {
        question_id: 'q1',
        value: 'Primeira',
      });
      expect(gravadas(back.record)).toEqual(['q1', 'q2', 'q5']);
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
      expect(gravadas(back.record)).toEqual(['q2', 'q5']);
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

      expect(gravadas(back.record)).toEqual(['q1', 'q2', 'q5']);
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

    it('sem questionário carregado, não chama o back', async () => {
      const back = simularBack();
      // Store vazio: o carregamento nunca aconteceu.
      const store = configureStore({ reducer: { responses: reducer } });

      await store.dispatch(submitResponses({ answers: respostas }));

      expect(back.create).not.toHaveBeenCalled();
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
      expect(submission.savedQuestionIds).toEqual(['q1', 'q2', 'q5']);
    });
  });
  describe('paraAnswerCreate', () => {
    it('descritiva vai em value', () => {
      expect(paraAnswerCreate(question({ id: 'q1' }), 'Meu texto')).toEqual({
        question_id: 'q1',
        value: 'Meu texto',
      });
    });

    it('objetiva vai em option_id, achado pelo rótulo (P-039)', () => {
      const escala = objetiva('q5', 0, ['1', '2', '3', '4', '5']);

      expect(paraAnswerCreate(escala, 'Rótulo 4')).toEqual({
        question_id: 'q5',
        option_id: 'q5-opcao-4',
      });
    });

    it('sem resposta, em branco ou alternativa desconhecida: nada a gravar', () => {
      const escala = objetiva('q5', 0, ['1', '2', '3', '4', '5']);

      expect(paraAnswerCreate(question({ id: 'q1' }), null)).toBeNull();
      expect(paraAnswerCreate(question({ id: 'q1' }), '  ')).toBeNull();
      expect(paraAnswerCreate(escala, 'Rótulo 9')).toBeNull();
    });
  });
});
