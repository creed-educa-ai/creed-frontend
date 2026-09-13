import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Demograficos2State {
  genero: string | null;
  faixaEtaria: string | null;
  origemEtnica: string[];
  religiao: string[];
  nacionalidade: string | null;
  estadoBrasil: string | null;
  regiaoPortugal: string | null;
  nacionalidadeOutra: string;
  perspectiva: string;
}

const initialState: Demograficos2State = {
  genero: null,
  faixaEtaria: null,
  origemEtnica: [],
  religiao: [],
  nacionalidade: null,
  estadoBrasil: null,
  regiaoPortugal: null,
  nacionalidadeOutra: '',
  perspectiva: '',
};

// Limpa os campos dependentes de nacionalidade que nao correspondem mais a
// opcao escolhida, pra nao ficar lixo salvo de uma escolha anterior.
function limparDependentesDeNacionalidade(state: Demograficos2State) {
  if (state.nacionalidade !== 'brasileira') state.estadoBrasil = null;
  if (state.nacionalidade !== 'portuguesa') state.regiaoPortugal = null;
  if (state.nacionalidade !== 'outra') state.nacionalidadeOutra = '';
}

const respondentesDemograficosSlice = createSlice({
  name: 'respondentesDemograficos',
  initialState,
  reducers: {
    definirGenero(state, action: PayloadAction<string>) {
      state.genero = action.payload;
    },
    definirFaixaEtaria(state, action: PayloadAction<string>) {
      state.faixaEtaria = action.payload;
    },
    definirOrigemEtnica(state, action: PayloadAction<string[]>) {
      state.origemEtnica = action.payload;
    },
    definirReligiao(state, action: PayloadAction<string[]>) {
      state.religiao = action.payload;
    },
    definirNacionalidade(state, action: PayloadAction<string>) {
      state.nacionalidade = action.payload;
      limparDependentesDeNacionalidade(state);
    },
    definirEstadoBrasil(state, action: PayloadAction<string>) {
      state.estadoBrasil = action.payload;
    },
    definirRegiaoPortugal(state, action: PayloadAction<string>) {
      state.regiaoPortugal = action.payload;
    },
    definirNacionalidadeOutra(state, action: PayloadAction<string>) {
      state.nacionalidadeOutra = action.payload;
    },
    definirPerspectiva(state, action: PayloadAction<string>) {
      state.perspectiva = action.payload;
    },
  },
});

export const {
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
