// Slice Redux da feature organizations (RTK): as empresas que o super adm
// acompanha e aprova. Vêm do mock do organizationsApi até o back ter as rotas.
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { organizationsApi } from '@/features/organizations/organizationsApi';
import type { Company, CompanyRegistration } from '@/types/api';

interface OrganizationsState {
  companies: Company[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  /** Chave de i18n, não mensagem pronta: a tela é que traduz. */
  error: 'empresas:erroAoCarregar' | null;
}

const initialState: OrganizationsState = {
  companies: [],
  status: 'idle',
  error: null,
};

export const loadCompanies = createAsyncThunk(
  'organizations/loadCompanies',
  async () => organizationsApi.listCompanies(),
);

// Cadastro público: quem chama é a tela de cadastro, sem sessão. A tela usa o
// estado de envio do próprio formulário; aqui só a empresa entra na lista.
export const registerCompany = createAsyncThunk(
  'organizations/registerCompany',
  async (registration: CompanyRegistration) =>
    organizationsApi.registerCompany(registration),
);

export const approveCompany = createAsyncThunk(
  'organizations/approveCompany',
  async (id: string) => {
    await organizationsApi.approveCompany(id);
    return id;
  },
);

export const rejectCompany = createAsyncThunk(
  'organizations/rejectCompany',
  async (id: string) => {
    await organizationsApi.rejectCompany(id);
    return id;
  },
);

export const deleteCompany = createAsyncThunk(
  'organizations/deleteCompany',
  async (id: string) => {
    await organizationsApi.removeCompany(id);
    return id;
  },
);

function withoutCompany(state: OrganizationsState, id: string) {
  state.companies = state.companies.filter((company) => company.id !== id);
}

const organizationsSlice = createSlice({
  name: 'organizations',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCompanies.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadCompanies.fulfilled, (state, action) => {
        state.status = 'ready';
        state.companies = action.payload;
      })
      .addCase(loadCompanies.rejected, (state) => {
        state.status = 'error';
        state.error = 'empresas:erroAoCarregar';
      })
      .addCase(registerCompany.fulfilled, (state, action) => {
        state.companies.push(action.payload);
      })
      .addCase(approveCompany.fulfilled, (state, action) => {
        const company = state.companies.find(({ id }) => id === action.payload);
        if (company) company.status = 'ativo';
      })
      .addCase(rejectCompany.fulfilled, (state, action) => {
        withoutCompany(state, action.payload);
      })
      .addCase(deleteCompany.fulfilled, (state, action) => {
        withoutCompany(state, action.payload);
      });
  },
});

export default organizationsSlice.reducer;
