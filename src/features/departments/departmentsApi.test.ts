import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { departmentsApi } from '@/features/departments/departmentsApi';
import { lastCall, stubFetch } from '@/test/stubFetch';

const ORGANIZATION_ID = '00000000-0000-0000-0000-000000000002';
const DEPARTMENT_ID = '00000000-0000-0000-0000-000000000001';

describe('departmentsApi', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('createDepartment usa a rota no singular, como no back', async () => {
    const fetchMock = stubFetch(201);

    await departmentsApi.createDepartment({
      organization_id: ORGANIZATION_ID,
      type: 'TecnologiaInformacao',
    });

    expect(lastCall(fetchMock)).toEqual({
      url: '/api/v1/department',
      method: 'POST',
      body: { organization_id: ORGANIZATION_ID, type: 'TecnologiaInformacao' },
    });
  });

  it('getDepartment lê pelo id', async () => {
    const fetchMock = stubFetch();

    await departmentsApi.getDepartment(DEPARTMENT_ID);

    expect(lastCall(fetchMock).url).toBe(`/api/v1/department/${DEPARTMENT_ID}`);
  });
});
