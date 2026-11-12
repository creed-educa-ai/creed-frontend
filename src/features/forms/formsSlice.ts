// Slice Redux da feature forms (RTK): os períodos de um público — a
// organização inteira (painel da empresa) ou um mentorando (modal da tabela
// de mentorandos) — e a abertura de um período novo (P-5).
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { formsApi } from '@/features/forms/formsApi';
import { ERROS } from '@/features/forms/manageQuestionnaireSchema';
import { ApiError } from '@/lib/apiClient';
import type { FormRead, PeriodCreate, PeriodRead } from '@/types/api';

type Status = 'idle' | 'loading' | 'ready' | 'error';

/** O que a tela mostra no formulário quando abrir o período falha. */
export type CreatePeriodError =
  typeof ERROS.periodoConflito | typeof ERROS.periodoFalhou;

interface FormsState {
  // Um público por vez: as duas telas que usam nunca aparecem juntas, e o
  // modal troca de mentorando a cada abertura.
  periods: {
    items: PeriodRead[];
    status: Status;
    /** Chave de i18n, não mensagem pronta: a tela é que traduz. */
    error: 'painelControle:erros.carregarPeriodo' | null;
    // De quem é a lista: a organização inteira (`null`) ou um mentorando.
    // A tela confere, para não mostrar o período do mentorando anterior no
    // instante em que o modal troca de pessoa.
    linkId: string | null;
    // A última carga pedida: resposta de um pedido anterior (outro
    // mentorando) chega tarde e não pode sobrescrever a atual.
    requestId: string | null;
  };
}

const initialState: FormsState = {
  periods: {
    items: [],
    status: 'idle',
    error: null,
    linkId: null,
    requestId: null,
  },
};

interface PeriodAudience {
  organizationId: string;
  // Sem ele, os períodos da organização inteira.
  linkId?: string | undefined;
}

export const loadPeriods = createAsyncThunk(
  'forms/loadPeriods',
  async ({ organizationId, linkId }: PeriodAudience) =>
    formsApi.listPeriods(organizationId, linkId),
);

// Recarregar os períodos não é daqui: é da tela, depois de criar (um thunk,
// uma responsabilidade).
export const createPeriod = createAsyncThunk<
  FormRead,
  { organizationId: string } & PeriodCreate,
  { rejectValue: CreatePeriodError }
>(
  'forms/createPeriod',
  async ({ organizationId, ...period }, { rejectWithValue }) => {
    try {
      return await formsApi.createPeriod(organizationId, period);
    } catch (erro) {
      // 409: já existe período do mesmo público que cruza ou encosta nestas
      // datas. O resto (422 de data no passado pelo relógio do back, 403, 5xx)
      // é a mensagem genérica.
      if (erro instanceof ApiError && erro.status === 409) {
        return rejectWithValue(ERROS.periodoConflito);
      }
      return rejectWithValue(ERROS.periodoFalhou);
    }
  },
);

// O período que trava um novo: o aberto, senão o próximo agendado. Os que já
// passaram não contam. A lista vem do mais recente ao mais antigo, então o
// próximo agendado é o último deles.
// > 🟡 Premissa P-085 — enquanto houver um período aberto ou agendado, a tela
// > mostra as datas dele só para leitura; um novo só depois que ele terminar.
export function pickActivePeriod(periods: PeriodRead[]): PeriodRead | null {
  return (
    periods.find((period) => period.period_status === 'open') ??
    periods.filter((period) => period.period_status === 'scheduled').at(-1) ??
    null
  );
}

const formsSlice = createSlice({
  name: 'forms',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadPeriods.pending, (state, action) => {
        state.periods.status = 'loading';
        state.periods.error = null;
        state.periods.items = [];
        state.periods.linkId = action.meta.arg.linkId ?? null;
        state.periods.requestId = action.meta.requestId;
      })
      .addCase(loadPeriods.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.periods.requestId) return;
        state.periods.status = 'ready';
        state.periods.items = action.payload;
      })
      .addCase(loadPeriods.rejected, (state, action) => {
        if (action.meta.requestId !== state.periods.requestId) return;
        state.periods.status = 'error';
        state.periods.error = 'painelControle:erros.carregarPeriodo';
      });
  },
});

export default formsSlice.reducer;
