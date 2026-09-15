import { describe, expect, it } from 'vitest';
import { emptyDemographics } from './demographicsSchema';
import { login, logout } from '@/features/authentication/authenticationSlice';
import reducer, {
  definirGenero,
  definirNome,
  definirNacionalidade,
  saveDemographicsStep,
  type DemographicsDraft,
} from '@/features/respondentes/respondentesDemograficosSlice';

const estadoInicial: DemographicsDraft = {
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
  it('preserves other steps when confirming or skipping step 2', () => {
    const previousSteps = {
      ...estadoInicial,
      nome: 'Pessoa de teste',
      perspectiva: 'Resposta sintética',
    };
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

  it('guarda o nome confirmado e o limpa ao iniciar outra sessão', () => {
    const salvo = reducer(estadoInicial, definirNome('Pessoa de teste'));
    expect(salvo.nome).toBe('Pessoa de teste');
    expect(reducer(salvo, { type: logout.type }).nome).toBe('');
  });

  it('limpa estadoBrasil ao trocar nacionalidade para portuguesa', () => {
    const comEstado: DemographicsDraft = {
      ...estadoInicial,
      nacionalidade: 'brasileira',
      estadoBrasil: 'RS',
    };
    const estado = reducer(comEstado, definirNacionalidade('portuguesa'));
    expect(estado.estadoBrasil).toBeNull();
  });

  it('limpa regiaoPortugal e nacionalidadeOutra ao trocar para brasileira', () => {
    const comRegiao: DemographicsDraft = {
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
