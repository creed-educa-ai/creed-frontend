// Slice Redux da feature dashboards (RTK). Um estado por tela: o dashboard
// individual e o da organização carregam em momentos diferentes.
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  dashboardsApi,
  type CompanyDashboard,
  type DashboardFilters,
  type UserDashboard,
} from '@/features/dashboards/dashboardsApi';

type Status = 'idle' | 'loading' | 'ready' | 'error';

/** Chave de i18n, não mensagem pronta: a tela é que traduz. */
type ErrorKey = 'dashboard:erroAoCarregar';

interface DashboardState<T> {
  data: T | null;
  status: Status;
  error: ErrorKey | null;
}

interface DashboardsState {
  user: DashboardState<UserDashboard>;
  company: DashboardState<CompanyDashboard>;
}

const initialState: DashboardsState = {
  user: { data: null, status: 'idle', error: null },
  company: { data: null, status: 'idle', error: null },
};

// Cada troca de filtro carrega de novo: quem recorta é o back. O dado anterior
// fica no estado enquanto o novo chega, para a tela não piscar.
export const loadUserDashboard = createAsyncThunk(
  'dashboards/loadUserDashboard',
  async (filters: Pick<DashboardFilters, 'period'>) =>
    dashboardsApi.getUserDashboard(filters),
);

export const loadCompanyDashboard = createAsyncThunk(
  'dashboards/loadCompanyDashboard',
  async (filters: DashboardFilters) =>
    dashboardsApi.getCompanyDashboard(filters),
);

const dashboardsSlice = createSlice({
  name: 'dashboards',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadUserDashboard.pending, (state) => {
        state.user.status = 'loading';
        state.user.error = null;
      })
      .addCase(loadUserDashboard.fulfilled, (state, action) => {
        state.user.status = 'ready';
        state.user.data = action.payload;
      })
      .addCase(loadUserDashboard.rejected, (state) => {
        state.user.status = 'error';
        state.user.error = 'dashboard:erroAoCarregar';
      })
      .addCase(loadCompanyDashboard.pending, (state) => {
        state.company.status = 'loading';
        state.company.error = null;
      })
      .addCase(loadCompanyDashboard.fulfilled, (state, action) => {
        state.company.status = 'ready';
        state.company.data = action.payload;
      })
      .addCase(loadCompanyDashboard.rejected, (state) => {
        state.company.status = 'error';
        state.company.error = 'dashboard:erroAoCarregar';
      });
  },
});

export default dashboardsSlice.reducer;
