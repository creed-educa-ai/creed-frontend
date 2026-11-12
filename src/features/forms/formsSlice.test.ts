import { afterEach, describe, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { formsApi } from '@/features/forms/formsApi';
import reducer, {
  createPeriod,
  loadPeriods,
  pickActivePeriod,
} from '@/features/forms/formsSlice';
import { ERROS } from '@/features/forms/manageQuestionnaireSchema';
import { ApiError } from '@/lib/apiClient';
import type { PeriodRead } from '@/types/api';

const ORGANIZATION_ID = '00000000-0000-0000-0000-000000000001';
const LINK_ID = '00000000-0000-0000-0000-000000000002';

const estadoInicial = reducer(undefined, { type: '@@init' });

function periodo(
  id: string,
  status: PeriodRead['period_status'],
  opens_at: string,
): PeriodRead {
  return {
    id,
    name: 'Questionário',
    organization_id: ORGANIZATION_ID,
    status: 'draft',
    opens_at,
    closes_at: opens_at,
    link_id: null,
    created_at: '2026-01-01T00:00:00Z',
    period_status: status,
  };
}

function novoStore() {
  return configureStore({ reducer: { forms: reducer } });
}

describe('pickActivePeriod', () => {
  // A lista vem do back do mais recente ao mais antigo.
  it('prefere o aberto aos agendados', () => {
    const lista = [
      periodo('agendado', 'scheduled', '2026-03-01T00:00:00Z'),
      periodo('aberto', 'open', '2026-01-01T00:00:00Z'),
    ];
    expect(pickActivePeriod(lista)?.id).toBe('aberto');
  });

  it('sem aberto, fica com o próximo agendado (o que abre primeiro)', () => {
    const lista = [
      periodo('depois', 'scheduled', '2026-05-01T00:00:00Z'),
      periodo('proximo', 'scheduled', '2026-03-01T00:00:00Z'),
      periodo('passou', 'past', '2025-12-01T00:00:00Z'),
    ];
    expect(pickActivePeriod(lista)?.id).toBe('proximo');
  });

  it('só com períodos que passaram, não há período ativo', () => {
    expect(
      pickActivePeriod([periodo('passou', 'past', '2025-12-01T00:00:00Z')]),
    ).toBeNull();
  });
});

describe('formsSlice', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('guarda de quem é a lista ao começar a carga', () => {
    const estado = reducer(
      estadoInicial,
      loadPeriods.pending('r1', {
        organizationId: ORGANIZATION_ID,
        linkId: LINK_ID,
      }),
    );
    expect(estado.periods.status).toBe('loading');
    expect(estado.periods.linkId).toBe(LINK_ID);
  });

  it('ignora a resposta de uma carga anterior', () => {
    const lista = [periodo('a', 'open', '2026-01-01T00:00:00Z')];
    let estado = reducer(
      estadoInicial,
      loadPeriods.pending('antiga', { organizationId: ORGANIZATION_ID }),
    );
    estado = reducer(
      estado,
      loadPeriods.pending('atual', {
        organizationId: ORGANIZATION_ID,
        linkId: LINK_ID,
      }),
    );
    estado = reducer(
      estado,
      loadPeriods.fulfilled(lista, 'antiga', {
        organizationId: ORGANIZATION_ID,
      }),
    );
    expect(estado.periods.status).toBe('loading');
    expect(estado.periods.items).toEqual([]);
  });

  it('createPeriod manda a organização e o corpo separados', async () => {
    const createSpy = vi
      .spyOn(formsApi, 'createPeriod')
      .mockResolvedValue({} as never);
    const store = novoStore();

    await store.dispatch(
      createPeriod({
        organizationId: ORGANIZATION_ID,
        opens_at: '2026-11-10T09:00:00-03:00',
        closes_at: '2026-11-20T18:00:00-03:00',
        link_id: LINK_ID,
      }),
    );

    expect(createSpy).toHaveBeenCalledWith(ORGANIZATION_ID, {
      opens_at: '2026-11-10T09:00:00-03:00',
      closes_at: '2026-11-20T18:00:00-03:00',
      link_id: LINK_ID,
    });
  });

  it('409 vira a mensagem de conflito', async () => {
    vi.spyOn(formsApi, 'createPeriod').mockRejectedValue(
      new ApiError('Já existe período para este público nesse intervalo', 409),
    );
    const result = await novoStore().dispatch(
      createPeriod({
        organizationId: ORGANIZATION_ID,
        opens_at: '2026-11-10T09:00:00-03:00',
        closes_at: '2026-11-20T18:00:00-03:00',
      }),
    );
    expect(result.payload).toBe(ERROS.periodoConflito);
  });

  it('outro erro vira a mensagem genérica', async () => {
    vi.spyOn(formsApi, 'createPeriod').mockRejectedValue(
      new ApiError('opens_at não pode estar no passado', 422),
    );
    const result = await novoStore().dispatch(
      createPeriod({
        organizationId: ORGANIZATION_ID,
        opens_at: '2026-11-10T09:00:00-03:00',
        closes_at: '2026-11-20T18:00:00-03:00',
      }),
    );
    expect(result.payload).toBe(ERROS.periodoFalhou);
  });
});
