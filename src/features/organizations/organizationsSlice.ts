// Slice Redux da feature organizations (RTK): as organizações que a
// administradora acompanha, aprova e exclui, e o envio do cadastro público.
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { organizationsApi } from '@/features/organizations/organizationsApi';
import { ApiError } from '@/lib/apiClient';
import type { OrganizationResponse, OrganizationSignUp } from '@/types/api';

interface OrganizationsState {
  organizations: OrganizationResponse[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  /** Chave de i18n, não mensagem pronta: a tela é que traduz. */
  error: 'empresas:erroAoCarregar' | null;
  /**
   * O envio do cadastro público tem status próprio: quem cadastra não tem
   * sessão nem lista, e o `status` acima é o da tabela da administradora.
   */
  signUp: {
    status: 'idle' | 'loading' | 'ready' | 'error';
    /** Chave de i18n, como `error`. */
    error: string | null;
  };
}

const initialState: OrganizationsState = {
  organizations: [],
  status: 'idle',
  error: null,
  signUp: { status: 'idle', error: null },
};

/** 409 do cadastro: a tela põe a mensagem no campo "Documento". */
export const DOCUMENTO_JA_CADASTRADO = 'cadastro:erros.documentoJaCadastrado';

/** 409 da aprovação: a tela avisa e recarrega a lista. */
export const NAO_APROVADA = 'empresas:toasts.naoAprovadaDescricao';

/** O maior `tamanho_pagina` que o `GET /organizacoes` aceita. */
const TAMANHO_DA_PAGINA = 200;

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

/**
 * O 409 tem duas causas que a tela não distingue: a empresa já não está
 * pendente (outra pessoa aprovou antes), ou o e-mail do cadastro já tem
 * acesso. O resto (503, rede fora) é "tente de novo".
 */
function chaveDeErroDaAprovacao(erro: unknown): string {
  if (erro instanceof ApiError && erro.status === 409) {
    return NAO_APROVADA;
  }
  return 'comum:tenteNovamenteEmInstantes';
}

// A tabela pagina, busca e ordena na própria tela, então precisa da lista
// inteira: pede página por página até juntar o `total`. Para também numa
// página vazia, ou uma exclusão entre duas chamadas deixaria o laço sem fim.
export const loadOrganizations = createAsyncThunk(
  'organizations/loadOrganizations',
  async () => {
    const organizations: OrganizationResponse[] = [];
    for (let pagina = 1; ; pagina += 1) {
      const resposta = await organizationsApi.listOrganizations({
        pagina,
        tamanho_pagina: TAMANHO_DA_PAGINA,
      });
      organizations.push(...resposta.itens);
      const acabou =
        resposta.itens.length === 0 || organizations.length >= resposta.total;
      if (acabou) return organizations;
    }
  },
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

// Devolve a organização como o back a deixou (ativa), que entra no lugar da
// pendente.
export const approveOrganization = createAsyncThunk<
  OrganizationResponse,
  string,
  { rejectValue: string }
>('organizations/approveOrganization', async (id, { rejectWithValue }) => {
  try {
    return await organizationsApi.approveOrganization(id);
  } catch (erro) {
    return rejectWithValue(chaveDeErroDaAprovacao(erro));
  }
});

// Excluir e rejeitar são a mesma rota (P-078). Sem `rejectValue`: a tela
// mostra o mesmo "tente de novo" para qualquer falha.
export const deleteOrganization = createAsyncThunk(
  'organizations/deleteOrganization',
  async (id: string) => {
    await organizationsApi.deleteOrganization(id);
    return id;
  },
);

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
      .addCase(loadOrganizations.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadOrganizations.fulfilled, (state, action) => {
        state.status = 'ready';
        state.organizations = action.payload;
      })
      .addCase(loadOrganizations.rejected, (state) => {
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
      .addCase(approveOrganization.fulfilled, (state, action) => {
        state.organizations = state.organizations.map((organization) =>
          organization.id === action.payload.id ? action.payload : organization,
        );
      })
      .addCase(deleteOrganization.fulfilled, (state, action) => {
        state.organizations = state.organizations.filter(
          (organization) => organization.id !== action.payload,
        );
      });
  },
});

export const { clearSignUp } = organizationsSlice.actions;
export default organizationsSlice.reducer;
