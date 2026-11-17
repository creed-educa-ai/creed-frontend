import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dashboardsApi } from '@/features/dashboards/dashboardsApi';
import { lastCall, stubFetch } from '@/test/stubFetch';

describe('dashboardsApi', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getUserDashboard pede o próprio resultado, com o período quando escolhido', async () => {
    const fetchMock = stubFetch(200, {});

    await dashboardsApi.getUserDashboard({ period: 'form-1' });

    expect(lastCall(fetchMock).url).toBe('/api/v1/dashboards/me?period=form-1');
  });

  it('getUserDashboard com member_id pede o resultado do mentorando', async () => {
    const fetchMock = stubFetch(200, {});

    await dashboardsApi.getUserDashboard({
      period: 'form-1',
      member_id: 'link-m1',
    });

    expect(lastCall(fetchMock).url).toBe(
      '/api/v1/dashboards/members/link-m1?period=form-1',
    );
  });

  it('getCompanyDashboard manda só os filtros preenchidos', async () => {
    const fetchMock = stubFetch(200, {});

    await dashboardsApi.getCompanyDashboard({
      period: 'form-1',
      department: 'Marketing',
      member_id: undefined,
    });

    expect(lastCall(fetchMock)).toEqual({
      url: '/api/v1/dashboards/company?period=form-1&department=Marketing',
      method: 'GET',
      body: undefined,
    });
  });

  it('getCompanyDashboard sem filtro pede a organização inteira', async () => {
    const fetchMock = stubFetch(200, {});

    await dashboardsApi.getCompanyDashboard({});

    expect(lastCall(fetchMock).url).toBe('/api/v1/dashboards/company');
  });

  it('getCompanyDashboard repassa o signal para poder cancelar', async () => {
    const fetchMock = stubFetch(200, {});
    const controller = new AbortController();

    await dashboardsApi.getCompanyDashboard({}, controller.signal);

    const [, init] = fetchMock.mock.lastCall as unknown as [
      string,
      RequestInit,
    ];
    expect(init.signal).toBe(controller.signal);
  });
});
