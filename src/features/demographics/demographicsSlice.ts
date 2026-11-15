import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { DemographicCreate, DemographicResponse } from '@/types/api';
import { demographicsApi } from './demographicsApi';
import {
  emptyDemographics,
  normalizeDemographics,
  type DemographicsForm,
} from './demographicsSchema';
import { login, logout } from '@/features/authentication/authenticationSlice';

export type DemographicsDraft = DemographicsForm & {
  name: string;
  perspective: string;
  // Se o perfil salvo no back já veio para o rascunho nesta sessão. Só vem uma
  // vez: voltar à etapa 1 não apaga o que a pessoa mudou nas outras.
  loaded: boolean;
};

const initialState: DemographicsDraft = {
  ...emptyDemographics,
  name: '',
  perspective: '',
  loaded: false,
};

// O perfil que a pessoa já salvou, para o rascunho começar dele. 404 é quem
// ainda não passou pelo onboarding: o rascunho fica vazio.
export const loadDemographics = createAsyncThunk<
  DemographicResponse | null,
  undefined,
  { state: { demographics: DemographicsDraft } }
>(
  'demographics/load',
  async () => {
    try {
      return await demographicsApi.getMine();
    } catch {
      return null;
    }
  },
  { condition: (_, { getState }) => !getState().demographics.loaded },
);

// O corpo do `PUT`: o rascunho no formato do `DemographicCreate`. Texto vazio
// vai como nulo.
export function demographicsPayload(
  draft: DemographicsDraft,
): DemographicCreate {
  const form = normalizeDemographics(draft);
  return {
    gender: form.gender,
    age_range: form.age_range,
    ethnicities: form.ethnicities,
    religions: form.religions,
    nationality: form.nationality,
    brazil_state: form.brazil_state,
    portugal_region: form.portugal_region,
    other_nationality: form.other_nationality.trim() || null,
    perspective: draft.perspective.trim() || null,
  };
}

// No fim da etapa 3, o rascunho inteiro vai ao back. Quem chama decide o que
// fazer com a falha (a tela continua, para tentar de novo).
export const saveDemographics = createAsyncThunk<
  DemographicResponse,
  undefined,
  { state: { demographics: DemographicsDraft } }
>('demographics/save', (_, { getState }) =>
  demographicsApi.saveMine(demographicsPayload(getState().demographics)),
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
    setName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    saveDemographicsStep(state, action: PayloadAction<DemographicsForm>) {
      // Atualiza somente os campos desta etapa, preservando os das telas 1 e 3.
      Object.assign(state, normalizeDemographics(action.payload));
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
      .addCase(loadDemographics.fulfilled, (state, action) => {
        state.loaded = true;
        const profile = action.payload;
        if (!profile) return;
        Object.assign(state, {
          gender: profile.gender,
          age_range: profile.age_range,
          ethnicities: profile.ethnicities,
          religions: profile.religions,
          nationality: profile.nationality,
          brazil_state: profile.brazil_state,
          portugal_region: profile.portugal_region,
          other_nationality: profile.other_nationality ?? '',
          perspective: profile.perspective ?? '',
        });
      })
      .addCase(logout, () => initialState)
      .addCase(login.pending, () => initialState);
  },
});

export const {
  setName,
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
