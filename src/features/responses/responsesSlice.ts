// Estado do questionário: o formulário e as perguntas que vieram do back.
// As respostas digitadas NÃO moram aqui: ficam no FormView e vão para a
// revisão pelo `state` da rota (spec da CREED-48, "Abordagem técnica" item 4).
import {
  createAsyncThunk,
  createSelector,
  createSlice,
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

interface ResponsesState {
  form: FormRead | null;
  questions: QuestionResponse[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  /** Chave de i18n, não mensagem pronta: a tela é que traduz. */
  error: string | null;
}

const initialState: ResponsesState = {
  form: null,
  questions: [],
  status: 'idle',
  error: null,
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

const responsesSlice = createSlice({
  name: 'responses',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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

export default responsesSlice.reducer;
