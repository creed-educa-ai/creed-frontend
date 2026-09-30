import { configureStore } from '@reduxjs/toolkit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { responsesApi } from '@/features/responses/responsesApi';
import reducer, {
  DEMO_FORM_ID,
  loadQuestionnaire,
  selectQuestionnaireSections,
} from '@/features/responses/responsesSlice';
import { ApiError } from '@/lib/apiClient';
import type { FormRead, QuestionResponse } from '@/types/api';

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
});
