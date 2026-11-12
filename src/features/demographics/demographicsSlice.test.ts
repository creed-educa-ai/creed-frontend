import { configureStore } from '@reduxjs/toolkit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { emptyDemographics } from './demographicsSchema';
import { demographicsApi } from './demographicsApi';
import { login, logout } from '@/features/authentication/authenticationSlice';
import reducer, {
  loadMyDemographics,
  saveDemographicsStep,
  saveMyDemographics,
  selectDemographicsForm,
  setGender,
  setNationality,
  setPerspective,
  type DemographicsState,
} from '@/features/demographics/demographicsSlice';
import { ApiError } from '@/lib/apiClient';
import type { DemographicResponse } from '@/types/api';

const estadoInicial: DemographicsState = {
  gender: null,
  age_range: null,
  ethnicities: [],
  religions: [],
  nationality: null,
  brazil_state: null,
  portugal_region: null,
  other_nationality: '',
  perspective: '',
  profile: { status: 'idle', exists: false, error: null },
  saving: { status: 'idle', error: null },
};

const perfilGravado: DemographicResponse = {
  id: '5d8e2a1b-7c4f-4e9a-8b3d-6f1c0e2a9b47',
  participant_id: '7f9c2b1e-4a3d-4c8e-9b6f-2d1e0a5c8b73',
  gender: 'feminino',
  age_range: '26_35',
  ethnicities: ['europeia', 'latino_americana'],
  religions: ['crista'],
  nationality: 'brasileira',
  brazil_state: 'RS',
  portugal_region: null,
  other_nationality: null,
  perspective: 'Meus pais tinham um pequeno comércio.',
  created_at: '2026-10-18T14:30:00Z',
  updated_at: null,
};

// Um store de verdade só com este slice: o thunk roda inteiro, e o teste lê o
// estado como a tela vai ler.
function criarStore(preloaded?: DemographicsState) {
  return configureStore({
    reducer: { demographics: reducer },
    preloadedState: preloaded ? { demographics: preloaded } : undefined,
  });
}

describe('demographicsSlice', () => {
  it('preserves the other step when confirming or skipping the profile step', () => {
    const previousSteps: DemographicsState = {
      ...estadoInicial,
      perspective: 'Resposta sintética',
    };
    // O payload tem só os campos da etapa de perfil, como a tela envia.
    const saved = reducer(
      previousSteps,
      saveDemographicsStep({ ...emptyDemographics, gender: 'feminino' }),
    );
    expect(saved).toMatchObject({
      perspective: previousSteps.perspective,
      gender: 'feminino',
    });
    const skipped = reducer(saved, saveDemographicsStep(emptyDemographics));
    expect(skipped).toMatchObject({
      perspective: previousSteps.perspective,
      gender: null,
    });
  });

  // O formulário devolve tudo que recebeu como valor inicial. Se o estado das
  // requisições entrasse junto, voltaria gravado por cima do estado atual.
  it('ignores anything in the payload that is not a profile field', () => {
    const carregado: DemographicsState = {
      ...estadoInicial,
      profile: { status: 'ready', exists: true, error: null },
    };
    const payloadComSobra = {
      ...emptyDemographics,
      gender: 'feminino' as const,
      profile: { status: 'idle', exists: false, error: null },
    };

    const saved = reducer(carregado, saveDemographicsStep(payloadComSobra));

    expect(saved.gender).toBe('feminino');
    expect(saved.profile).toEqual(carregado.profile);
  });

  it.each([logout.type, login.pending.type])(
    'clears the draft on %s',
    (type) => {
      const saved = reducer(estadoInicial, setGender('feminino'));
      expect(reducer(saved, { type })).toEqual(estadoInicial);
    },
  );

  // Outra pessoa pode entrar no mesmo navegador: o que se sabia do perfil da
  // anterior não pode decidir se a próxima vê o onboarding.
  it('forgets what it knew about the profile on logout', () => {
    const comPerfil: DemographicsState = {
      ...estadoInicial,
      profile: { status: 'ready', exists: true, error: null },
    };
    expect(reducer(comPerfil, { type: logout.type }).profile).toEqual(
      estadoInicial.profile,
    );
  });

  it('guarda o genero selecionado', () => {
    const estado = reducer(estadoInicial, setGender('feminino'));
    expect(estado.gender).toBe('feminino');
  });

  it('limpa estadoBrasil ao trocar nacionalidade para portuguesa', () => {
    const comEstado: DemographicsState = {
      ...estadoInicial,
      nationality: 'brasileira',
      brazil_state: 'RS',
    };
    const estado = reducer(comEstado, setNationality('portuguesa'));
    expect(estado.brazil_state).toBeNull();
  });

  it('limpa regiaoPortugal e nacionalidadeOutra ao trocar para brasileira', () => {
    const comRegiao: DemographicsState = {
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

  // Logout e login descartam o rascunho de todas as etapas.
  it('limpa a perspectiva junto com o rascunho no logout', () => {
    const comPerspectiva = reducer(
      estadoInicial,
      setPerspective('Resposta sintética'),
    );
    expect(reducer(comPerspectiva, { type: logout.type }).perspective).toBe('');
  });

  it('selectDemographicsForm devolve só os campos do formulário de perfil', () => {
    const estado: DemographicsState = {
      ...estadoInicial,
      gender: 'feminino',
      perspective: 'Resposta sintética',
    };

    const form = selectDemographicsForm({ demographics: estado });

    expect(form).toEqual({ ...emptyDemographics, gender: 'feminino' });
  });
});

describe('demographicsSlice — perfil no back', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loadMyDemographics preenche o rascunho com o perfil gravado', async () => {
    vi.spyOn(demographicsApi, 'getMyDemographics').mockResolvedValue(
      perfilGravado,
    );
    const store = criarStore();

    await store.dispatch(loadMyDemographics());

    const estado = store.getState().demographics;
    expect(estado.profile).toEqual({
      status: 'ready',
      exists: true,
      error: null,
    });
    expect(estado).toMatchObject({
      gender: 'feminino',
      ethnicities: ['europeia', 'latino_americana'],
      brazil_state: 'RS',
      // `null` do back vira '' nos campos de texto da tela.
      other_nationality: '',
      perspective: 'Meus pais tinham um pequeno comércio.',
    });
  });

  // 404 é "ainda não fez o onboarding", não falha: a tela mostra o onboarding.
  it('loadMyDemographics trata o 404 como perfil inexistente, sem erro', async () => {
    vi.spyOn(demographicsApi, 'getMyDemographics').mockRejectedValue(
      new ApiError('Perfil demográfico não encontrado', 404),
    );
    const store = criarStore();

    await store.dispatch(loadMyDemographics());

    expect(store.getState().demographics.profile).toEqual({
      status: 'ready',
      exists: false,
      error: null,
    });
  });

  // Quem está no meio do primeiro preenchimento não perde o que já escolheu.
  it('loadMyDemographics sem perfil não apaga o rascunho', async () => {
    vi.spyOn(demographicsApi, 'getMyDemographics').mockRejectedValue(
      new ApiError('Perfil demográfico não encontrado', 404),
    );
    const store = criarStore({ ...estadoInicial, gender: 'masculino' });

    await store.dispatch(loadMyDemographics());

    expect(store.getState().demographics.gender).toBe('masculino');
  });

  it('loadMyDemographics guarda a chave de erro quando o back falha', async () => {
    vi.spyOn(demographicsApi, 'getMyDemographics').mockRejectedValue(
      new ApiError('Erro interno', 500),
    );
    const store = criarStore();

    await store.dispatch(loadMyDemographics());

    expect(store.getState().demographics.profile).toEqual({
      status: 'error',
      exists: false,
      error: 'respondentes:demograficos.erroCarregar',
    });
  });

  it('loadMyDemographics não dispara duas buscas ao mesmo tempo', async () => {
    const getSpy = vi
      .spyOn(demographicsApi, 'getMyDemographics')
      .mockResolvedValue(perfilGravado);
    const store = criarStore();

    await Promise.all([
      store.dispatch(loadMyDemographics()),
      store.dispatch(loadMyDemographics()),
    ]);

    expect(getSpy).toHaveBeenCalledTimes(1);
  });

  it('saveMyDemographics manda o rascunho e marca que o perfil existe', async () => {
    const saveSpy = vi
      .spyOn(demographicsApi, 'saveMyDemographics')
      .mockResolvedValue(perfilGravado);
    const store = criarStore({
      ...estadoInicial,
      gender: 'feminino',
      nationality: 'brasileira',
      brazil_state: 'RS',
      perspective: '  Meus pais tinham um pequeno comércio.  ',
    });

    await store.dispatch(saveMyDemographics());

    expect(saveSpy).toHaveBeenCalledWith({
      gender: 'feminino',
      age_range: null,
      ethnicities: [],
      religions: [],
      nationality: 'brasileira',
      brazil_state: 'RS',
      portugal_region: null,
      other_nationality: null,
      perspective: 'Meus pais tinham um pequeno comércio.',
    });
    const estado = store.getState().demographics;
    expect(estado.saving).toEqual({ status: 'ready', error: null });
    expect(estado.profile.exists).toBe(true);
  });

  // Pular também salva: tudo vazio, e é assim que o back registra que pulou.
  it('saveMyDemographics manda tudo vazio para quem pulou as etapas', async () => {
    const saveSpy = vi
      .spyOn(demographicsApi, 'saveMyDemographics')
      .mockResolvedValue({
        ...perfilGravado,
        gender: null,
        age_range: null,
        ethnicities: [],
        religions: [],
        nationality: null,
        brazil_state: null,
        perspective: null,
      });
    const store = criarStore();

    await store.dispatch(saveMyDemographics());

    expect(saveSpy).toHaveBeenCalledWith({
      gender: null,
      age_range: null,
      ethnicities: [],
      religions: [],
      nationality: null,
      brazil_state: null,
      portugal_region: null,
      other_nationality: null,
      perspective: null,
    });
  });

  // O back recusa estado ou região que não batem com a nacionalidade.
  it('saveMyDemographics não manda campo de outra nacionalidade', async () => {
    const saveSpy = vi
      .spyOn(demographicsApi, 'saveMyDemographics')
      .mockResolvedValue(perfilGravado);
    const store = criarStore({
      ...estadoInicial,
      nationality: 'portuguesa',
      brazil_state: 'RS',
      portugal_region: 'norte',
      other_nationality: 'Argentina',
    });

    await store.dispatch(saveMyDemographics());

    expect(saveSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        nationality: 'portuguesa',
        brazil_state: null,
        portugal_region: 'norte',
        other_nationality: null,
      }),
    );
  });

  it('saveMyDemographics guarda a chave de erro e mantém o rascunho quando falha', async () => {
    vi.spyOn(demographicsApi, 'saveMyDemographics').mockRejectedValue(
      new ApiError('Erro interno', 500),
    );
    const store = criarStore({
      ...estadoInicial,
      gender: 'feminino',
      profile: { status: 'ready', exists: false, error: null },
    });

    await store.dispatch(saveMyDemographics());

    const estado = store.getState().demographics;
    expect(estado.saving).toEqual({
      status: 'error',
      error: 'respondentes:demograficos.erroSalvar',
    });
    expect(estado.gender).toBe('feminino');
    expect(estado.profile.exists).toBe(false);
  });
});
