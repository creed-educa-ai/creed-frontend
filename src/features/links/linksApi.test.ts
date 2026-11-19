import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { linksApi } from '@/features/links/linksApi';
import { lastCall, stubFetch } from '@/test/stubFetch';

const ORGANIZATION_ID = '8f14e45f-ceea-467e-adde-3f81905dbc1c';
const PARTICIPANT_ID = 'e5c0e7fa-3e57-427a-8d7b-a4ab5fb6c339';
const LINK_ID = 'd40b7a55-b9cc-4b78-ae5d-ab325fd655e2';

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

  it('listMembers filtra pelo tipo do vínculo na query', async () => {
    const fetchMock = stubFetch(200, []);

    const members = await linksApi.listMembers(ORGANIZATION_ID, 'mentoria');

    expect(members).toEqual([]);
    expect(lastCall(fetchMock)).toEqual({
      url: `/api/v1/organizations/${ORGANIZATION_ID}/members?type=mentoria`,
      method: 'GET',
      body: undefined,
    });
  });

  it('deleteMember apaga pelo vínculo, dentro da organização', async () => {
    const fetchMock = stubFetch(204);

    await linksApi.deleteMember(ORGANIZATION_ID, LINK_ID);

    expect(lastCall(fetchMock)).toEqual({
      url: `/api/v1/organizations/${ORGANIZATION_ID}/members/${LINK_ID}`,
      method: 'DELETE',
      body: undefined,
    });
  });

  it('updateMemberDepartment manda só o setor, no campo department', async () => {
    const fetchMock = stubFetch(200);

    await linksApi.updateMemberDepartment(
      ORGANIZATION_ID,
      LINK_ID,
      'Marketing',
    );

    expect(lastCall(fetchMock)).toEqual({
      url: `/api/v1/organizations/${ORGANIZATION_ID}/members/${LINK_ID}`,
      method: 'PATCH',
      body: { department: 'Marketing' },
    });
  });

  it('updateMemberDepartment com null tira o setor', async () => {
    const fetchMock = stubFetch(200);

    await linksApi.updateMemberDepartment(ORGANIZATION_ID, LINK_ID, null);

    expect(lastCall(fetchMock).body).toEqual({ department: null });
  });

  it('listMembers sem tipo traz todos os vínculos', async () => {
    const fetchMock = stubFetch(200, []);

    await linksApi.listMembers(ORGANIZATION_ID);

    expect(lastCall(fetchMock).url).toBe(
      `/api/v1/organizations/${ORGANIZATION_ID}/members`,
    );
  });
});
