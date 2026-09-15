import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  emptyDemographics,
  normalizeDemographics,
  type DemographicsForm,
} from './demographicsSchema';
import { login, logout } from '@/features/authentication/authenticationSlice';

export type DemographicsDraft = DemographicsForm & {
  nome: string;
  perspectiva: string;
};

const initialState: DemographicsDraft = {
  ...emptyDemographics,
  nome: '',
  perspectiva: '',
};

// Limpa os campos dependentes de nacionalidade que nao correspondem mais a
// opcao escolhida, pra nao ficar lixo salvo de uma escolha anterior.
function limparDependentesDeNacionalidade(state: DemographicsDraft) {
  if (state.nacionalidade !== 'brasileira') state.estadoBrasil = null;
  if (state.nacionalidade !== 'portuguesa') state.regiaoPortugal = null;
  if (state.nacionalidade !== 'outra') state.nacionalidadeOutra = '';
}

const respondentesDemograficosSlice = createSlice({
  name: 'respondentesDemograficos',
  initialState,
  reducers: {
    definirNome(state, action: PayloadAction<string>) {
      state.nome = action.payload;
    },
    saveDemographicsStep(state, action: PayloadAction<DemographicsForm>) {
      // Atualiza somente os campos desta etapa, preservando os das telas 1 e 3.
      Object.assign(state, normalizeDemographics(action.payload));
    },
    definirGenero(state, action: PayloadAction<DemographicsForm['genero']>) {
      state.genero = action.payload;
    },
    definirFaixaEtaria(
      state,
      action: PayloadAction<DemographicsForm['faixaEtaria']>,
    ) {
      state.faixaEtaria = action.payload;
    },
    definirOrigemEtnica(
      state,
      action: PayloadAction<DemographicsForm['origemEtnica']>,
    ) {
      state.origemEtnica = action.payload;
    },
    definirReligiao(
      state,
      action: PayloadAction<DemographicsForm['religiao']>,
    ) {
      state.religiao = action.payload;
    },
    definirNacionalidade(
      state,
      action: PayloadAction<DemographicsForm['nacionalidade']>,
    ) {
      state.nacionalidade = action.payload;
      limparDependentesDeNacionalidade(state);
    },
    definirEstadoBrasil(
      state,
      action: PayloadAction<DemographicsForm['estadoBrasil']>,
    ) {
      state.estadoBrasil = action.payload;
    },
    definirRegiaoPortugal(
      state,
      action: PayloadAction<DemographicsForm['regiaoPortugal']>,
    ) {
      state.regiaoPortugal = action.payload;
    },
    definirNacionalidadeOutra(state, action: PayloadAction<string>) {
      state.nacionalidadeOutra = action.payload;
    },
    definirPerspectiva(state, action: PayloadAction<string>) {
      state.perspectiva = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout, () => initialState)
      .addCase(login.pending, () => initialState);
  },
});

export const {
  definirNome,
  saveDemographicsStep,
  definirGenero,
  definirFaixaEtaria,
  definirOrigemEtnica,
  definirReligiao,
  definirNacionalidade,
  definirEstadoBrasil,
  definirRegiaoPortugal,
  definirNacionalidadeOutra,
  definirPerspectiva,
} = respondentesDemograficosSlice.actions;
export default respondentesDemograficosSlice.reducer;
