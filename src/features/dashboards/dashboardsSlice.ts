// Slice Redux da feature dashboards (RTK). Um estado por tela: o dashboard
// individual e o da organização carregam em momentos diferentes.
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  dashboardsApi,
  type CompanyDashboard,
  type DashboardFilters,
  type OverviewDashboard,
  type OverviewKind,
  type UserDashboard,
} from '@/features/dashboards/dashboardsApi';
import { ApiError } from '@/lib/apiClient';

type Status = 'idle' | 'loading' | 'ready' | 'error';

/** Chave de i18n, não mensagem pronta: a tela é que traduz. */
type ErrorKey =
  | 'dashboard:erroAoCarregar'
  | 'dashboard:semResultado'
  | 'dashboard:semResultadoEmpresa';

interface DashboardState<T> {
  data: T | null;
  status: Status;
  error: ErrorKey | null;
}

interface DashboardsState {
  // De quem é o resultado individual: nulo é o de quem está logado; um id é o
  // mentorando que a administradora abriu.
  user: DashboardState<UserDashboard> & { memberId: string | null };
  company: DashboardState<CompanyDashboard>;
  // O retrato atual da administradora: as duas visões carregam juntas, porque
  // as listas do filtro do topo (empresas e mentorandos) saem delas.
  overview: Record<OverviewKind, DashboardState<OverviewDashboard>>;
}

const vazio = { data: null, status: 'idle', error: null } as const;

const initialState: DashboardsState = {
  user: { ...vazio, memberId: null },
  company: { ...vazio },
  overview: { companies: { ...vazio }, mentees: { ...vazio } },
};

// Cada troca de filtro carrega de novo: quem recorta é o back. O dado anterior
// fica no estado enquanto o novo chega, para a tela não piscar.
// 404 é a pessoa que ainda não enviou nenhum questionário: a tela mostra o
// caminho até ele, não uma mensagem de erro.
export const loadUserDashboard = createAsyncThunk<
  UserDashboard,
  Pick<DashboardFilters, 'period' | 'member_id'>,
  { rejectValue: ErrorKey }
>('dashboards/loadUserDashboard', async (filters, { rejectWithValue }) => {
  try {
    return await dashboardsApi.getUserDashboard(filters);
  } catch (erro) {
    if (erro instanceof ApiError && erro.status === 404) {
      return rejectWithValue('dashboard:semResultado');
    }
    return rejectWithValue('dashboard:erroAoCarregar');
  }
});

// Trocar o filtro rápido dispara várias cargas: a tela cancela a anterior
// (`abort()` da promessa do dispatch), e só a última chega ao estado. 404 é a
// organização (ou o recorte) ainda sem resultado.
export const loadCompanyDashboard = createAsyncThunk<
  CompanyDashboard,
  DashboardFilters,
  { rejectValue: ErrorKey }
>(
  'dashboards/loadCompanyDashboard',
  async (filters, { rejectWithValue, signal }) => {
    try {
      return await dashboardsApi.getCompanyDashboard(filters, signal);
    } catch (erro) {
      if (erro instanceof ApiError && erro.status === 404) {
        return rejectWithValue('dashboard:semResultadoEmpresa');
      }
      throw erro;
    }
  },
);

// 404 é ninguém ter respondido ainda: estado da tela, não erro.
export const loadOverview = createAsyncThunk<
  OverviewDashboard,
  OverviewKind,
  { rejectValue: ErrorKey }
>('dashboards/loadOverview', async (kind, { rejectWithValue, signal }) => {
  try {
    return await dashboardsApi.getOverview(kind, signal);
  } catch (erro) {
    if (erro instanceof ApiError && erro.status === 404) {
      return rejectWithValue('dashboard:semResultadoEmpresa');
    }
    throw erro;
  }
});

const dashboardsSlice = createSlice({
  name: 'dashboards',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadUserDashboard.pending, (state, action) => {
        // Outra pessoa: o resultado da anterior não fica na tela enquanto o
        // novo chega.
        const memberId = action.meta.arg.member_id ?? null;
        if (memberId !== state.user.memberId) state.user.data = null;
        state.user.memberId = memberId;
        state.user.status = 'loading';
        state.user.error = null;
      })
      .addCase(loadUserDashboard.fulfilled, (state, action) => {
        // A administradora trocou de mentorando antes desta carga chegar.
        if ((action.meta.arg.member_id ?? null) !== state.user.memberId) return;
        state.user.status = 'ready';
        state.user.data = action.payload;
      })
      .addCase(loadUserDashboard.rejected, (state, action) => {
        if ((action.meta.arg.member_id ?? null) !== state.user.memberId) return;
        state.user.status = 'error';
        state.user.error = action.payload ?? 'dashboard:erroAoCarregar';
      })
      .addCase(loadCompanyDashboard.pending, (state) => {
        state.company.status = 'loading';
        state.company.error = null;
      })
      .addCase(loadCompanyDashboard.fulfilled, (state, action) => {
        state.company.status = 'ready';
        state.company.data = action.payload;
      })
      .addCase(loadCompanyDashboard.rejected, (state, action) => {
        // Cancelada porque o filtro mudou: a carga nova já está a caminho.
        if (action.meta.aborted) return;
        // O dado anterior pode ser de outra empresa (a administradora troca):
        // com erro, ele não fica na tela junto do aviso.
        state.company.data = null;
        state.company.status = 'error';
        state.company.error = action.payload ?? 'dashboard:erroAoCarregar';
      })
      .addCase(loadOverview.pending, (state, action) => {
        const overview = state.overview[action.meta.arg];
        overview.status = 'loading';
        overview.error = null;
      })
      .addCase(loadOverview.fulfilled, (state, action) => {
        const overview = state.overview[action.meta.arg];
        overview.status = 'ready';
        overview.data = action.payload;
      })
      .addCase(loadOverview.rejected, (state, action) => {
        if (action.meta.aborted) return;
        const overview = state.overview[action.meta.arg];
        overview.status = 'error';
        overview.error = action.payload ?? 'dashboard:erroAoCarregar';
      });
  },
});

export default dashboardsSlice.reducer;
