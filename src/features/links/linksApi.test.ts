import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { linksApi } from '@/features/links/linksApi';
import { lastCall, stubFetch } from '@/test/stubFetch';

const ORGANIZATION_ID = '8f14e45f-ceea-467e-adde-3f81905dbc1c';
const PARTICIPANT_ID = 'e5c0e7fa-3e57-427a-8d7b-a4ab5fb6c339';

describe('linksApi', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('createLink leva a organização no caminho, não no corpo', async () => {
    const fetchMock = stubFetch(201);

    await linksApi.createLink(ORGANIZATION_ID, {
      participant_id: PARTICIPANT_ID,
      type: 'emprego',
      role: 'gestor',
    });

    expect(lastCall(fetchMock)).toEqual({
      url: `/api/v1/organizations/${ORGANIZATION_ID}/links`,
      method: 'POST',
      body: { participant_id: PARTICIPANT_ID, type: 'emprego', role: 'gestor' },
    });
  });
});
