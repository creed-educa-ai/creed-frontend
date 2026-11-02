import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { participantsApi } from '@/features/participants/participantsApi';
import { lastCall, stubFetch } from '@/test/stubFetch';

const PARTICIPANT_ID = '7f9c2b1e-4a3d-4c8e-9b6f-2d1e0a5c8b73';

describe('participantsApi', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('createParticipant manda o nome, sem documento quando não há', async () => {
    const fetchMock = stubFetch(201);

    await participantsApi.createParticipant({ name: 'Pessoa Exemplo' });

    expect(lastCall(fetchMock)).toEqual({
      url: '/api/v1/participants',
      method: 'POST',
      body: { name: 'Pessoa Exemplo' },
    });
  });

  it('getParticipant lê pelo id', async () => {
    const fetchMock = stubFetch();

    await participantsApi.getParticipant(PARTICIPANT_ID);

    expect(lastCall(fetchMock).url).toBe(
      `/api/v1/participants/${PARTICIPANT_ID}`,
    );
  });
});
