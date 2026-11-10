// Slice Redux da feature organizations (RTK): as empresas que o super adm
// acompanha e aprova, que ainda vêm do mock do organizationsApi, e o envio do
// cadastro público, que já vai ao back.
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { organizationsApi } from '@/features/organizations/organizationsApi';
import { ApiError } from '@/lib/apiClient';
import type { Company, OrganizationSignUp } from '@/types/api';

interface OrganizationsState {
  companies: Company[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  /** Chave de i18n, não mensagem pronta: a tela é que traduz. */
  error: 'empresas:erroAoCarregar' | null;
  /**
   * O envio do cadastro público tem status próprio: quem cadastra não tem
   * sessão nem lista, e o `status` acima é o da tabela do super adm.
   */
  signUp: {
    status: 'idle' | 'loading' | 'ready' | 'error';
    /** Chave de i18n, como `error`. */
    error: string | null;
  };
}

const initialState: OrganizationsState = {
  companies: [],
  status: 'idle',
  error: null,
  signUp: { status: 'idle', error: null },
};

/** 409 do cadastro: a tela põe a mensagem no campo "Documento". */
export const DOCUMENTO_JA_CADASTRADO = 'cadastro:erros.documentoJaCadastrado';

/**
 * O 409 é do campo documento. O resto (422, 503, rede fora) é "tente de
 * novo": o formulário já barra o que o back recusaria com 422.
 */
function chaveDeErroDoCadastro(erro: unknown): string {
  if (erro instanceof ApiError && erro.status === 409) {
    return DOCUMENTO_JA_CADASTRADO;
  }
  return 'cadastro:erros.envioIndisponivel';
}

export const loadCompanies = createAsyncThunk(
  'organizations/loadCompanies',
  async () => organizationsApi.listCompanies(),
);

// Cadastro público: quem chama é a tela de cadastro, sem sessão. `undefined`:
// a tela só precisa saber que deu certo, e quem cadastra não tem lista onde
// pôr a empresa.
export const signUpOrganization = createAsyncThunk<
  undefined,
  OrganizationSignUp,
  { rejectValue: string }
>('organizations/signUpOrganization', async (body, { rejectWithValue }) => {
  try {
    await organizationsApi.signUp(body);
  } catch (erro) {
    return rejectWithValue(chaveDeErroDoCadastro(erro));
  }
});

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
  reducers: {
    // O store é um só para o app inteiro: sem isto, o erro do último envio
    // reaparece quando a pessoa volta à tela de cadastro.
    clearSignUp(state) {
      state.signUp = { status: 'idle', error: null };
    },
  },
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
      .addCase(signUpOrganization.pending, (state) => {
        state.signUp.status = 'loading';
        state.signUp.error = null;
      })
      .addCase(signUpOrganization.fulfilled, (state) => {
        state.signUp.status = 'ready';
      })
      .addCase(signUpOrganization.rejected, (state, action) => {
        state.signUp.status = 'error';
        state.signUp.error =
          action.payload ?? 'cadastro:erros.envioIndisponivel';
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

export const { clearSignUp } = organizationsSlice.actions;
export default organizationsSlice.reducer;
