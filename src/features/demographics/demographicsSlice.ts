import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  emptyDemographics,
  normalizeDemographics,
  type DemographicsForm,
} from './demographicsSchema';
import { login, logout } from '@/features/authentication/authenticationSlice';

export type DemographicsDraft = DemographicsForm & {
  name: string;
  perspective: string;
};

const initialState: DemographicsDraft = {
  ...emptyDemographics,
  name: '',
  perspective: '',
};

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
