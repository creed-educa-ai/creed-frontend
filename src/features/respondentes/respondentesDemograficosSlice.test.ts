import { describe, expect, it } from 'vitest';
import reducer, {
  definirGenero,
  definirNacionalidade,
} from '@/features/respondentes/respondentesDemograficosSlice';

const estadoInicial = {
  nome: '',
  genero: null,
  faixaEtaria: null,
  origemEtnica: [],
  religiao: [],
  nacionalidade: null,
  estadoBrasil: null,
  regiaoPortugal: null,
  nacionalidadeOutra: '',
};

describe('respondentesDemograficosSlice', () => {
  it('guarda o genero selecionado', () => {
    const estado = reducer(estadoInicial, definirGenero('feminino'));
    expect(estado.genero).toBe('feminino');
  });

  it('limpa estadoBrasil ao trocar nacionalidade para portuguesa', () => {
    const comEstado = {
      ...estadoInicial,
      nacionalidade: 'brasileira',
      estadoBrasil: 'RS',
    };
    const estado = reducer(comEstado, definirNacionalidade('portuguesa'));
    expect(estado.estadoBrasil).toBeNull();
  });

  it('limpa regiaoPortugal e nacionalidadeOutra ao trocar para brasileira', () => {
    const comRegiao = {
      ...estadoInicial,
      nacionalidade: 'outra',
      regiaoPortugal: 'norte',
      nacionalidadeOutra: 'Argentina',
    };
    const estado = reducer(comRegiao, definirNacionalidade('brasileira'));
    expect(estado.regiaoPortugal).toBeNull();
    expect(estado.nacionalidadeOutra).toBe('');
  });
});
