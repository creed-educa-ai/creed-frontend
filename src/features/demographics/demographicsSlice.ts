import {
  createAsyncThunk,
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import {
  emptyDemographics,
  normalizeDemographics,
  type DemographicsForm,
} from './demographicsSchema';
import { demographicsApi } from './demographicsApi';
import { login, logout } from '@/features/authentication/authenticationSlice';
import { ApiError } from '@/lib/apiClient';
import type { DemographicCreate, DemographicResponse } from '@/types/api';

// O que a pessoa preencheu nas duas etapas (perfil e perspectiva).
export type DemographicsDraft = DemographicsForm & {
  perspective: string;
};

type RequestStatus = 'idle' | 'loading' | 'ready' | 'error';

export type DemographicsState = DemographicsDraft & {
  // O perfil gravado no back. `exists` só vale com `status: 'ready'`.
  profile: {
    status: RequestStatus;
    exists: boolean;
    /** Chave de i18n, não mensagem pronta: a tela é que traduz. */
    error: string | null;
  };
  // O envio tem estado próprio: um erro ao salvar não pode apagar o que se
  // sabe do perfil nem o que a pessoa preencheu.
  saving: {
    status: RequestStatus;
    /** Chave de i18n, não mensagem pronta: a tela é que traduz. */
    error: string | null;
  };
};

// O pedaço do store que os thunks e o seletor leem. Pedir só ele, e não o
// `RootState` inteiro, deixa o slice testável num store só com este reducer
// (mesmo molde do `responsesSlice`).
interface DemographicsRootState {
  demographics: DemographicsState;
}

const initialState: DemographicsState = {
  ...emptyDemographics,
  perspective: '',
  profile: { status: 'idle', exists: false, error: null },
  saving: { status: 'idle', error: null },
};

// Só os campos da etapa de perfil. O que entra no formulário e o que volta
// dele passam por aqui, para o estado das requisições não vazar para a tela.
function pickDemographicsForm(data: DemographicsForm): DemographicsForm {
  return {
    gender: data.gender,
    age_range: data.age_range,
    ethnicities: data.ethnicities,
    religions: data.religions,
    nationality: data.nationality,
    brazil_state: data.brazil_state,
    portugal_region: data.portugal_region,
    other_nationality: data.other_nationality,
  };
}

// O back guarda "não preenchido" como `null`; os campos de texto da tela usam ''.
function draftFromResponse(profile: DemographicResponse): DemographicsDraft {
  return {
    gender: profile.gender,
    age_range: profile.age_range,
    ethnicities: profile.ethnicities,
    religions: profile.religions,
    nationality: profile.nationality,
    brazil_state: profile.brazil_state,
    portugal_region: profile.portugal_region,
    other_nationality: profile.other_nationality ?? '',
    perspective: profile.perspective ?? '',
  };
}

// Texto em branco vai como `null`. Quem pulou tudo manda só campos vazios, e é
// assim que o back registra que o onboarding foi pulado.
function payloadFromDraft(draft: DemographicsDraft): DemographicCreate {
  const form = normalizeDemographics(pickDemographicsForm(draft));
  return {
    ...form,
    other_nationality: form.other_nationality.trim() || null,
    perspective: draft.perspective.trim() || null,
  };
}

// Busca o perfil da pessoa logada. 404 não é erro: é "ainda não tem perfil",
// e sai como `null`.
export const loadMyDemographics = createAsyncThunk<
  DemographicResponse | null,
  undefined,
  { state: DemographicsRootState }
>(
  'demographics/loadMine',
  async () => {
    try {
      return await demographicsApi.getMyDemographics();
    } catch (erro) {
      if (erro instanceof ApiError && erro.status === 404) return null;
      throw erro;
    }
  },
  {
    // Uma busca por vez: quem dispara de novo enquanto ela corre não duplica.
    condition: (_, { getState }) =>
      getState().demographics.profile.status !== 'loading',
  },
);

// Salva o rascunho inteiro: o PUT substitui o perfil que estava no back.
export const saveMyDemographics = createAsyncThunk<
  DemographicResponse,
  undefined,
  { state: DemographicsRootState }
>('demographics/saveMine', (_, { getState }) =>
  demographicsApi.saveMyDemographics(payloadFromDraft(getState().demographics)),
);

// Limpa os campos dependentes de nacionalidade que nao correspondem mais a
// opcao escolhida, pra nao ficar lixo salvo de uma escolha anterior.
function clearNationalityDependents(state: DemographicsDraft) {
  if (state.nationality !== 'brasileira') state.brazil_state = null;
  if (state.nationality !== 'portuguesa') state.portugal_region = null;
  if (state.nationality !== 'outra') state.other_nationality = '';
}

const demographicsSlice = createSlice({
  name: 'demographics',
  initialState,
  reducers: {
    saveDemographicsStep(state, action: PayloadAction<DemographicsForm>) {
      // Atualiza somente os campos desta etapa, preservando a perspectiva.
      Object.assign(
        state,
        pickDemographicsForm(normalizeDemographics(action.payload)),
      );
    },
    setGender(state, action: PayloadAction<DemographicsForm['gender']>) {
      state.gender = action.payload;
    },
    setAgeRange(state, action: PayloadAction<DemographicsForm['age_range']>) {
      state.age_range = action.payload;
    },
    setEthnicities(
      state,
      action: PayloadAction<DemographicsForm['ethnicities']>,
    ) {
      state.ethnicities = action.payload;
    },
    setReligions(state, action: PayloadAction<DemographicsForm['religions']>) {
      state.religions = action.payload;
    },
    setNationality(
      state,
      action: PayloadAction<DemographicsForm['nationality']>,
    ) {
      state.nationality = action.payload;
      clearNationalityDependents(state);
    },
    setBrazilState(
      state,
      action: PayloadAction<DemographicsForm['brazil_state']>,
    ) {
      state.brazil_state = action.payload;
    },
    setPortugalRegion(
      state,
      action: PayloadAction<DemographicsForm['portugal_region']>,
    ) {
      state.portugal_region = action.payload;
    },
    setOtherNationality(state, action: PayloadAction<string>) {
      state.other_nationality = action.payload;
    },
    setPerspective(state, action: PayloadAction<string>) {
      state.perspective = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout, () => initialState)
      .addCase(login.pending, () => initialState)
      .addCase(loadMyDemographics.pending, (state) => {
        state.profile.status = 'loading';
        state.profile.error = null;
      })
      .addCase(loadMyDemographics.fulfilled, (state, action) => {
        // Sem perfil no back, o rascunho fica como está: pode ser alguém no
        // meio do primeiro preenchimento.
        if (action.payload) {
          Object.assign(state, draftFromResponse(action.payload));
        }
        state.profile = {
          status: 'ready',
          exists: action.payload !== null,
          error: null,
        };
      })
      .addCase(loadMyDemographics.rejected, (state) => {
        state.profile.status = 'error';
        state.profile.error = 'respondentes:demograficos.erroCarregar';
      })
      .addCase(saveMyDemographics.pending, (state) => {
        state.saving = { status: 'loading', error: null };
      })
      .addCase(saveMyDemographics.fulfilled, (state, action) => {
        // O rascunho passa a ser o que o back gravou, já normalizado por ele.
        Object.assign(state, draftFromResponse(action.payload));
        state.profile = { status: 'ready', exists: true, error: null };
        state.saving = { status: 'ready', error: null };
      })
      .addCase(saveMyDemographics.rejected, (state) => {
        state.saving = {
          status: 'error',
          error: 'respondentes:demograficos.erroSalvar',
        };
      });
  },
});

// Valores iniciais do formulário da etapa de perfil. Memoizado: sem isso, o
// seletor devolveria um objeto novo a cada leitura do estado.
export const selectDemographicsForm = createSelector(
  (state: DemographicsRootState) => state.demographics,
  (demographics): DemographicsForm =>
    normalizeDemographics(pickDemographicsForm(demographics)),
);

export const {
  saveDemographicsStep,
  setGender,
  setAgeRange,
  setEthnicities,
  setReligions,
  setNationality,
  setBrazilState,
  setPortugalRegion,
  setOtherNationality,
  setPerspective,
} = demographicsSlice.actions;
export default demographicsSlice.reducer;
