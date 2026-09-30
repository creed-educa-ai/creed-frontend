// Estado do questionário: o formulário e as perguntas que vieram do back.
// As respostas digitadas NÃO moram aqui: ficam no FormView e vão para a
// revisão pelo `state` da rota (spec da CREED-48, "Abordagem técnica" item 4).
import {
  createAsyncThunk,
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';
import { responsesApi } from '@/features/responses/responsesApi';
import { ApiError } from '@/lib/apiClient';
import type { FormRead, QuestionResponse, QuestionSection } from '@/types/api';

// 🟡 Premissa P-035: sem rota que liste formulários, o questionário abre sempre
// o formulário de demonstração do seed local do back.
export const DEMO_FORM_ID = '00000000-0000-0000-0000-000000000003';

// 🟡 Premissa P-036: a ordem das abas. Seção que o back criar e não estiver
// aqui não aparece: acrescente o valor novo nesta lista.
const SECTION_ORDER: QuestionSection[] = ['profile', 'assessment', 'closing'];

// O envio tem estado próprio: carregar e enviar acontecem em momentos
// diferentes, e um erro de envio não pode apagar as perguntas da tela.
interface SubmissionState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  /** Chave de i18n, não mensagem pronta: a tela é que traduz. */
  error: string | null;
  // O que já foi gravado numa tentativa que falhou no meio. "Tentar de novo"
  // continua daqui: não abre outra resposta de formulário (daria 409) nem
  // grava de novo a mesma pergunta (P-032).
  formResponseId: string | null;
  savedQuestionIds: string[];
}

interface ResponsesState {
  form: FormRead | null;
  questions: QuestionResponse[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  /** Chave de i18n, não mensagem pronta: a tela é que traduz. */
  error: string | null;
  submission: SubmissionState;
}

const initialSubmission: SubmissionState = {
  status: 'idle',
  error: null,
  formResponseId: null,
  savedQuestionIds: [],
};

const initialState: ResponsesState = {
  form: null,
  questions: [],
  status: 'idle',
  error: null,
  submission: initialSubmission,
};

// O que atravessa daqui para a tela é chave de tradução, nunca o texto do
// back, que vem só em português e não passa pelo i18n.
function chaveDeErro(erro: unknown): string {
  if (erro instanceof ApiError && erro.status === 404) {
    return 'formulario:erros.naoEncontrado';
  }
  if (erro instanceof ApiError && erro.status === 403) {
    return 'formulario:erros.semAcesso';
  }
  return 'formulario:erros.servicoIndisponivel';
}

export const loadQuestionnaire = createAsyncThunk<
  { form: FormRead; questions: QuestionResponse[] },
  string,
  { rejectValue: string }
>('responses/loadQuestionnaire', async (formId, { rejectWithValue }) => {
  try {
    const form = await responsesApi.getForm(formId);
    const questions = await responsesApi.listQuestions(formId);
    return { form, questions };
  } catch (erro) {
    return rejectWithValue(chaveDeErro(erro));
  }
});

function ehConflito(erro: unknown) {
  return erro instanceof ApiError && erro.status === 409;
}

export interface AnswerToSubmit {
  question_id: string;
  value: string | null;
}

// 🟡 Premissa P-034: é aqui, e só aqui, que o questionário grava no back. Três
// passos em ordem: abrir a resposta de formulário, gravar cada resposta
// preenchida, enviar. Uma por vez, para a retomada saber exatamente onde parou.
export const submitResponses = createAsyncThunk<
  undefined,
  { formId: string; answers: AnswerToSubmit[] },
  { state: { responses: ResponsesState }; rejectValue: string }
>(
  'responses/submitResponses',
  async ({ formId, answers }, { getState, dispatch, rejectWithValue }) => {
    try {
      let formResponseId = getState().responses.submission.formResponseId;
      if (formResponseId === null) {
        try {
          const created = await responsesApi.createFormResponse(formId);
          formResponseId = created.id;
        } catch (erro) {
          // O back só aceita uma resposta por vínculo e formulário.
          if (ehConflito(erro)) {
            return rejectWithValue('questionarioRevisao:erros.jaRespondido');
          }
          throw erro;
        }
        dispatch(responsesSlice.actions.formResponseCreated(formResponseId));
      }

      for (const answer of answers) {
        // 🟡 Premissa P-038: opcional em branco não vai para o back.
        if (answer.value === null || answer.value.trim() === '') continue;
        const jaGravada = getState().responses.submission.savedQuestionIds;
        if (jaGravada.includes(answer.question_id)) continue;

        try {
          await responsesApi.recordAnswer(formResponseId, {
            question_id: answer.question_id,
            value: answer.value,
          });
        } catch (erro) {
          // 409 aqui quer dizer que a tentativa anterior gravou, mas a resposta
          // do back se perdeu no caminho: a pergunta já está lá.
          if (!ehConflito(erro)) throw erro;
        }
        dispatch(responsesSlice.actions.answerSaved(answer.question_id));
      }

      try {
        await responsesApi.submitFormResponse(formResponseId);
      } catch (erro) {
        // Mesmo caso: o envio anterior chegou, a confirmação é que não voltou.
        if (!ehConflito(erro)) throw erro;
      }
    } catch {
      return rejectWithValue('questionarioRevisao:erros.envioFalhou');
    }
  },
);

const responsesSlice = createSlice({
  name: 'responses',
  initialState,
  reducers: {
    formResponseCreated(state, action: PayloadAction<string>) {
      state.submission.formResponseId = action.payload;
    },
    answerSaved(state, action: PayloadAction<string>) {
      state.submission.savedQuestionIds.push(action.payload);
    },
    // A tela de revisão chama ao abrir: um erro de uma visita anterior não
    // deve aparecer antes de a pessoa tentar enviar.
    clearSubmissionError(state) {
      state.submission.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitResponses.pending, (state) => {
        state.submission.status = 'loading';
        state.submission.error = null;
      })
      .addCase(submitResponses.fulfilled, (state) => {
        // Enviado: começa do zero. Guardar o id de uma resposta já enviada
        // faria um novo envio "retomar" uma resposta que não aceita mais nada.
        state.submission = { ...initialSubmission, status: 'ready' };
      })
      .addCase(submitResponses.rejected, (state, action) => {
        state.submission.status = 'error';
        state.submission.error =
          action.payload ?? 'questionarioRevisao:erros.envioFalhou';
      })
      .addCase(loadQuestionnaire.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadQuestionnaire.fulfilled, (state, action) => {
        state.status = 'ready';
        state.form = action.payload.form;
        state.questions = action.payload.questions;
      })
      .addCase(loadQuestionnaire.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload ?? 'formulario:erros.servicoIndisponivel';
      });
  },
});

export interface QuestionnaireSection {
  /** Número da aba na tela, começando em 1. */
  numero: number;
  section: QuestionSection;
  questions: QuestionResponse[];
}

// As perguntas já agrupadas como a tela desenha: uma seção por aba, na ordem
// de SECTION_ORDER, só as que têm pergunta, e cada uma na ordem de
// `order_index`. `createSelector` evita montar uma lista nova a cada render.
export const selectQuestionnaireSections = createSelector(
  (state: RootState) => state.responses.questions,
  (questions): QuestionnaireSection[] => {
    // 🟡 Premissa P-037: a objetiva só aparece quando existirem as
    // alternativas (CREED-37); o back ainda recusa a resposta dela.
    const descritivas = questions.filter(
      (question) => question.type === 'descriptive',
    );

    const secoes: QuestionnaireSection[] = [];
    for (const section of SECTION_ORDER) {
      const daSecao = descritivas
        .filter((question) => question.section === section)
        .sort((a, b) => a.order_index - b.order_index);
      if (daSecao.length > 0) {
        secoes.push({
          numero: secoes.length + 1,
          section,
          questions: daSecao,
        });
      }
    }
    return secoes;
  },
);

export const { clearSubmissionError } = responsesSlice.actions;
export default responsesSlice.reducer;
