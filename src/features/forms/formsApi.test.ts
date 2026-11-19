import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formsApi } from '@/features/forms/formsApi';
import { lastCall, stubFetch } from '@/test/stubFetch';

const FORM_ID = '00000000-0000-0000-0000-000000000003';
const ORGANIZATION_ID = '00000000-0000-0000-0000-000000000001';
const LINK_ID = '00000000-0000-0000-0000-000000000002';

describe('formsApi', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('createForm manda nome e organização, sem status', async () => {
    const fetchMock = stubFetch(201);

    await formsApi.createForm({
      name: 'Formulário',
      organization_id: ORGANIZATION_ID,
    });

    expect(lastCall(fetchMock)).toEqual({
      url: '/api/v1/forms',
      method: 'POST',
      body: { name: 'Formulário', organization_id: ORGANIZATION_ID },
    });
  });

  it('createPeriod manda as datas com fuso na organização, sem link_id', async () => {
    const fetchMock = stubFetch(201);

    await formsApi.createPeriod(ORGANIZATION_ID, {
      opens_at: '2026-11-10T09:00:00-03:00',
      closes_at: '2026-11-20T18:00:00-03:00',
    });

    expect(lastCall(fetchMock)).toEqual({
      url: `/api/v1/organizations/${ORGANIZATION_ID}/periods`,
      method: 'POST',
      body: {
        opens_at: '2026-11-10T09:00:00-03:00',
        closes_at: '2026-11-20T18:00:00-03:00',
      },
    });
  });

  it('createPeriod manda o link_id do mentorando', async () => {
    const fetchMock = stubFetch(201);

    await formsApi.createPeriod(ORGANIZATION_ID, {
      opens_at: '2026-11-10T09:00:00-03:00',
      closes_at: '2026-11-20T18:00:00-03:00',
      link_id: LINK_ID,
    });

    expect(lastCall(fetchMock).body).toMatchObject({ link_id: LINK_ID });
  });

  it('listPeriods lê os da organização inteira sem query', async () => {
    const fetchMock = stubFetch(200, []);

    await formsApi.listPeriods(ORGANIZATION_ID);

    expect(lastCall(fetchMock)).toEqual({
      url: `/api/v1/organizations/${ORGANIZATION_ID}/periods`,
      method: 'GET',
      body: undefined,
    });
  });

  it('listPeriods lê os de um mentorando pelo link_id', async () => {
    const fetchMock = stubFetch(200, []);

    await formsApi.listPeriods(ORGANIZATION_ID, LINK_ID);

    expect(lastCall(fetchMock).url).toBe(
      `/api/v1/organizations/${ORGANIZATION_ID}/periods?link_id=${LINK_ID}`,
    );
  });

  it('getForm lê o formulário pelo id', async () => {
    const fetchMock = stubFetch();

    await formsApi.getForm(FORM_ID);

    expect(lastCall(fetchMock)).toEqual({
      url: `/api/v1/forms/${FORM_ID}`,
      method: 'GET',
      body: undefined,
    });
  });
});
