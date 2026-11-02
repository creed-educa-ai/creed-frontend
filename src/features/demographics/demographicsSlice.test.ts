import { describe, expect, it } from 'vitest';
import { emptyDemographics } from './demographicsSchema';
import { login, logout } from '@/features/authentication/authenticationSlice';
import reducer, {
  setGender,
  setName,
  setNationality,
  setPerspective,
  saveDemographicsStep,
  type DemographicsDraft,
} from '@/features/demographics/demographicsSlice';

const estadoInicial: DemographicsDraft = {
  name: '',
  gender: null,
  age_range: null,
  ethnicities: [],
  religions: [],
  nationality: null,
  brazil_state: null,
  portugal_region: null,
  other_nationality: '',
  perspective: '',
};

describe('demographicsSlice', () => {
  it('preserves other steps when confirming or skipping step 2', () => {
    const previousSteps = {
      ...estadoInicial,
      name: 'Pessoa de teste',
      perspective: 'Resposta sintética',
    };
    // O payload tem só os campos da etapa 2, como a tela 2 envia.
    const saved = reducer(
      previousSteps,
      saveDemographicsStep({ ...emptyDemographics, gender: 'feminino' }),
    );
    expect(saved).toMatchObject({
      name: previousSteps.name,
      perspective: previousSteps.perspective,
      gender: 'feminino',
    });
    const skipped = reducer(saved, saveDemographicsStep(emptyDemographics));
    expect(skipped).toMatchObject({
      name: previousSteps.name,
      perspective: previousSteps.perspective,
      gender: null,
    });
  });

  it.each([logout.type, login.pending.type])(
    'clears the draft on %s',
    (type) => {
      const saved = reducer(estadoInicial, setGender('feminino'));
      expect(reducer(saved, { type })).toEqual(estadoInicial);
    },
  );
  it('guarda o genero selecionado', () => {
    const estado = reducer(estadoInicial, setGender('feminino'));
    expect(estado.gender).toBe('feminino');
  });

  it('guarda o nome confirmado e o limpa ao iniciar outra sessão', () => {
    const salvo = reducer(estadoInicial, setName('Pessoa de teste'));
    expect(salvo.name).toBe('Pessoa de teste');
    expect(reducer(salvo, { type: logout.type }).name).toBe('');
  });

  it('limpa estadoBrasil ao trocar nacionalidade para portuguesa', () => {
    const comEstado: DemographicsDraft = {
      ...estadoInicial,
      nationality: 'brasileira',
      brazil_state: 'RS',
    };
    const estado = reducer(comEstado, setNationality('portuguesa'));
    expect(estado.brazil_state).toBeNull();
  });

  it('limpa regiaoPortugal e nacionalidadeOutra ao trocar para brasileira', () => {
    const comRegiao: DemographicsDraft = {
      ...estadoInicial,
      nationality: 'outra',
      portugal_region: 'norte',
      other_nationality: 'Argentina',
    };
    const estado = reducer(comRegiao, setNationality('brasileira'));
    expect(estado.portugal_region).toBeNull();
    expect(estado.other_nationality).toBe('');
  });

  it('guarda a perspectiva escrita', () => {
    const estado = reducer(
      estadoInicial,
      setPerspective('Meus pais tinham um pequeno comércio.'),
    );
    expect(estado.perspective).toBe('Meus pais tinham um pequeno comércio.');
  });

  // A pergunta é opcional: quem apaga a resposta e avança precisa conseguir
  // deixar o campo vazio, não ficar preso ao texto salvo antes.
  it('substitui a perspectiva salva por texto vazio', () => {
    const comPerspectiva = { ...estadoInicial, perspective: 'Texto antigo' };
    const estado = reducer(comPerspectiva, setPerspective(''));
    expect(estado.perspective).toBe('');
  });

  // Logout e login descartam o rascunho de todas as etapas, inclusive a tela 3.
  it('limpa a perspectiva junto com o rascunho no logout', () => {
    const comPerspectiva = reducer(
      estadoInicial,
      setPerspective('Resposta sintética'),
    );
    expect(reducer(comPerspectiva, { type: logout.type }).perspective).toBe('');
  });
});
