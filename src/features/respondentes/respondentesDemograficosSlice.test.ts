import { describe, expect, it } from 'vitest';
import { emptyDemographics } from './demographicsSchema';
import { login, logout } from '@/features/authentication/authenticationSlice';
import reducer, {
  definirGenero,
  definirNacionalidade,
  definirPerspectiva,
  saveDemographicsStep,
  type Demograficos2State,
} from '@/features/respondentes/respondentesDemograficosSlice';

const estadoInicial: Demograficos2State = {
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
  it('preserves other steps when confirming or skipping step 2', () => {
    const previousSteps = {
      ...estadoInicial,
      nome: 'Pessoa de teste',
      perspectiva: 'Resposta sintética',
    };
    // O payload tem só os campos da etapa 2, como a tela 2 envia.
    const saved = reducer(
      previousSteps,
      saveDemographicsStep({ ...emptyDemographics, genero: 'feminino' }),
    );
    expect(saved).toMatchObject({
      nome: previousSteps.nome,
      perspectiva: previousSteps.perspectiva,
      genero: 'feminino',
    });
    const skipped = reducer(saved, saveDemographicsStep(emptyDemographics));
    expect(skipped).toMatchObject({
      nome: previousSteps.nome,
      perspectiva: previousSteps.perspectiva,
      genero: null,
    });
  });

  it.each([logout.type, login.pending.type])(
    'clears the draft on %s',
    (type) => {
      const saved = reducer(estadoInicial, definirGenero('feminino'));
      expect(reducer(saved, { type })).toEqual(estadoInicial);
    },
  );
  it('guarda o genero selecionado', () => {
    const estado = reducer(estadoInicial, definirGenero('feminino'));
    expect(estado.genero).toBe('feminino');
  });

  it('limpa estadoBrasil ao trocar nacionalidade para portuguesa', () => {
    const comEstado: Demograficos2State = {
      ...estadoInicial,
      nacionalidade: 'brasileira',
      estadoBrasil: 'RS',
    };
    const estado = reducer(comEstado, definirNacionalidade('portuguesa'));
    expect(estado.estadoBrasil).toBeNull();
  });

  it('limpa regiaoPortugal e nacionalidadeOutra ao trocar para brasileira', () => {
    const comRegiao: Demograficos2State = {
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

  // Logout e login descartam o rascunho de todas as etapas, inclusive a tela 3.
  it('limpa a perspectiva junto com o rascunho no logout', () => {
    const comPerspectiva = reducer(
      estadoInicial,
      definirPerspectiva('Resposta sintética'),
    );
    expect(reducer(comPerspectiva, { type: logout.type }).perspectiva).toBe('');
  });
});
