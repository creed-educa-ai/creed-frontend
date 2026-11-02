import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formsApi } from '@/features/forms/formsApi';
import { lastCall, stubFetch } from '@/test/stubFetch';

const FORM_ID = '00000000-0000-0000-0000-000000000003';
const ORGANIZATION_ID = '00000000-0000-0000-0000-000000000001';

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
