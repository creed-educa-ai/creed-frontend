import { describe, expect, it } from 'vitest';
import reducer, {
  definirGenero,
  definirNacionalidade,
  definirPerspectiva,
} from '@/features/respondentes/respondentesDemograficosSlice';

const estadoInicial = {
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

  it('guarda a perspectiva escrita', () => {
    const estado = reducer(
      estadoInicial,
      definirPerspectiva('Meus pais tinham um pequeno comércio.'),
    );
    expect(estado.perspectiva).toBe('Meus pais tinham um pequeno comércio.');
  });

  // A pergunta é opcional: quem apaga a resposta e avança precisa conseguir
  // deixar o campo vazio, não ficar preso ao texto salvo antes.
  it('substitui a perspectiva salva por texto vazio', () => {
    const comPerspectiva = { ...estadoInicial, perspectiva: 'Texto antigo' };
    const estado = reducer(comPerspectiva, definirPerspectiva(''));
    expect(estado.perspectiva).toBe('');
  });
});
