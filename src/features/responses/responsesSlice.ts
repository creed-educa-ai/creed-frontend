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
import type { QuestionType as TipoDaTela } from '@/features/responses/Question';
import { questoesDeDemonstracao } from '@/features/responses/questoesDeDemonstracao';
import { responsesApi } from '@/features/responses/responsesApi';
import { ApiError } from '@/lib/apiClient';
import type {
  AnswerCreate,
  FormRead,
  QuestionResponse,
  QuestionSection,
} from '@/types/api';

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
    // DEMONSTRAÇÃO: escala e objetiva no formato do back, até a CREED-37.
    // Só num formulário que tem pergunta: o vazio continua vazio. Apagar este
    // `if`, e o arquivo questoesDeDemonstracao.ts, quando a CREED-37 chegar.
    if (questions.length > 0) {
      return {
        form,
        questions: [...questions, ...questoesDeDemonstracao(formId)],
      };
    }
    return { form, questions };
  } catch (erro) {
    return rejectWithValue(chaveDeErro(erro));
  }
});

function ehConflito(erro: unknown) {
  return erro instanceof ApiError && erro.status === 409;
}

/** O que a tela respondeu numa pergunta: o texto, ou o rótulo da alternativa. */
export interface AnswerToSubmit {
  question_id: string;
  answer: string | null;
}

// Monta o corpo do `POST .../answers` como o back espera: descritiva em
// `value`, objetiva em `option_id` (P-039). A tela guarda a alternativa pelo
// rótulo; aqui ele vira o id. Devolve null quando não há o que gravar.
export function paraAnswerCreate(
  question: QuestionResponse,
  answer: string | null,
): AnswerCreate | null {
  // 🟡 Premissa P-038: opcional em branco não vai para o back.
  if (answer === null || answer.trim() === '') return null;
  if (question.type === 'descriptive') {
    return { question_id: question.id, value: answer };
  }
  const option = question.options?.find(({ label }) => label === answer);
  return option ? { question_id: question.id, option_id: option.id } : null;
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

      const { questions, submission } = getState().responses;
      for (const { question_id, answer } of answers) {
        const question = questions.find(({ id }) => id === question_id);
        if (!question) continue;
        // O back ainda recusa resposta objetiva com 422 (D2 da CREED-47).
        // Quando a CREED-37 chegar, apagar esta linha: o corpo com
        // `option_id` já sai pronto de `paraAnswerCreate`.
        if (question.type === 'objective') continue;

        const corpo = paraAnswerCreate(question, answer);
        if (!corpo) continue;
        if (submission.savedQuestionIds.includes(question_id)) continue;

        try {
          await responsesApi.recordAnswer(formResponseId, corpo);
        } catch (erro) {
          // 409 aqui quer dizer que a tentativa anterior gravou, mas a resposta
          // do back se perdeu no caminho: a pergunta já está lá.
          if (!ehConflito(erro)) throw erro;
        }
        dispatch(responsesSlice.actions.answerSaved(question_id));
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

/** A pergunta do jeito que a tela desenha. Só o seletor conhece o formato do back. */
export interface PerguntaDaTela {
  id: string;
  texto: string;
  tipo: TipoDaTela;
  /** Rótulos das alternativas, em ordem; vazio na dissertativa. */
  opcoes: string[];
  obrigatoria: boolean;
}

export interface QuestionnaireSection {
  /** Número da aba na tela, começando em 1. */
  numero: number;
  section: QuestionSection;
  perguntas: PerguntaDaTela[];
}

function alternativasEmOrdem(question: QuestionResponse) {
  return [...(question.options ?? [])].sort(
    (a, b) => a.order_index - b.order_index,
  );
}

// 🟡 Premissa P-040: objetiva com alternativas de valor 1 a 5, em ordem, é
// desenhada como escala. Qualquer outra objetiva vira lista de alternativas.
function tipoDaTela(question: QuestionResponse): TipoDaTela {
  if (question.type === 'descriptive') return 'dissertativa';
  const valores = alternativasEmOrdem(question).map(({ value }) => value);
  return valores.join(',') === '1,2,3,4,5' ? 'quantitativa' : 'objetiva';
}

// As perguntas já agrupadas como a tela desenha: uma seção por aba, na ordem
// de SECTION_ORDER, só as que têm pergunta, e cada uma na ordem de
// `order_index`. `createSelector` evita montar uma lista nova a cada render.
export const selectQuestionnaireSections = createSelector(
  (state: RootState) => state.responses.questions,
  (questions): QuestionnaireSection[] => {
    // 🟡 Premissa P-037: objetiva sem alternativas não tem como ser
    // respondida, então não aparece.
    const respondiveis = questions.filter(
      (question) =>
        question.type === 'descriptive' ||
        alternativasEmOrdem(question).length > 0,
    );

    const secoes: QuestionnaireSection[] = [];
    for (const section of SECTION_ORDER) {
      const daSecao = respondiveis
        .filter((question) => question.section === section)
        .sort((a, b) => a.order_index - b.order_index);
      if (daSecao.length > 0) {
        secoes.push({
          numero: secoes.length + 1,
          section,
          perguntas: daSecao.map((question) => ({
            id: question.id,
            texto: question.text,
            tipo: tipoDaTela(question),
            opcoes: alternativasEmOrdem(question).map(({ label }) => label),
            obrigatoria: question.required,
          })),
        });
      }
    }
    return secoes;
  },
);

export const { clearSubmissionError } = responsesSlice.actions;
export default responsesSlice.reducer;
