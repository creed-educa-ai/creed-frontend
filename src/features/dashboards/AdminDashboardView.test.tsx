import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authenticationReducer from '@/features/authentication/authenticationSlice';
import dashboardsReducer from '@/features/dashboards/dashboardsSlice';
import { dashboardsApi } from '@/features/dashboards/dashboardsApi';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { ApiError } from '@/lib/apiClient';
import { CompanyDashboardRoute } from './AdminDashboardView';
import { companyDashboardFixture } from './__fixtures__/companyDashboard';
import { retrato } from './__fixtures__/overviewDashboard';
import { userDashboardFixture } from './__fixtures__/userDashboard';

const CREED = 'org-creed';

function renderizar(role = 'admin', url = '/dashboard/company') {
  const store = configureStore({
    reducer: {
      authentication: authenticationReducer,
      dashboards: dashboardsReducer,
    },
    preloadedState: {
      authentication: {
        user: {
          id: 'usuario-1',
          email: 'dev@creed.example.com',
          role,
          link_id: 'link-admin',
          organization_id: CREED,
          organization_name: null,
        },
        status: 'authenticated' as const,
        error: null,
        passwordReset: { status: 'idle' as const, error: null },
      },
    },
  });
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[url]}>
        <CompanyDashboardRoute />
      </MemoryRouter>
    </Provider>,
  );
}

async function escolher(
  user: ReturnType<typeof userEvent.setup>,
  de: string,
  para: string,
) {
  await user.click(await screen.findByRole('button', { name: de }));
  await user.click(screen.getByRole('menuitemradio', { name: para }));
}

describe('AdminDashboardView', () => {
  beforeEach(async () => {
    vi.spyOn(dashboardsApi, 'getOverview').mockImplementation((kind) =>
      Promise.resolve(retrato(kind)),
    );
    vi.spyOn(dashboardsApi, 'getCompanyDashboard').mockImplementation(
      (filters) => Promise.resolve(companyDashboardFixture(filters)),
    );
    // O dashboard individual do mentorando, com o nome dele.
    vi.spyOn(dashboardsApi, 'getUserDashboard').mockImplementation(
      (filters = {}) =>
        Promise.resolve({
          ...userDashboardFixture(filters.period),
          member_name: 'Mentorando 1',
        }),
    );
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should start with the current picture of all companies', async () => {
    renderizar();

    expect(
      await screen.findByText('Respostas de 01/09/2026 a 15/10/2026'),
    ).toBeInTheDocument();
    // Sem filtro de período: o retrato atual não tem período.
    expect(
      screen.queryByRole('button', { name: /Período/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Empresas × prismas' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /Empresa A/ })).toHaveTextContent(
      '+10',
    );
  });

  it('should list the companies and the mentees with results in the selector', async () => {
    const user = userEvent.setup();
    renderizar();

    await user.click(
      await screen.findByRole('button', { name: 'Todas as empresas' }),
    );

    expect(
      screen.getAllByRole('menuitemradio').map((item) => item.textContent),
    ).toEqual([
      'Todas as empresas',
      'Empresa A',
      'Empresa B',
      'Todos os mentorandos',
      'Mentorando 1',
    ]);
  });

  it('should compare all companies with one of them', async () => {
    const user = userEvent.setup();
    renderizar();

    await escolher(user, 'Empresa', 'Empresa B');

    expect(
      await screen.findByText('Todas as empresas em relação a Empresa B'),
    ).toBeInTheDocument();
  });

  it('should open one company with the company dashboard', async () => {
    const user = userEvent.setup();
    renderizar();

    await escolher(user, 'Todas as empresas', 'Empresa A');

    await waitFor(() => {
      expect(dashboardsApi.getCompanyDashboard).toHaveBeenLastCalledWith(
        { organization_id: 'org-a', member_id: undefined },
        expect.any(AbortSignal),
      );
    });
    // O seletor continua, junto do período e do recorte da empresa.
    expect(
      await screen.findByRole('button', { name: 'Empresa A' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /30\/06\/2026\s*Período/ }),
    ).toBeInTheDocument();
  });

  it('should open one mentee with the individual dashboard', async () => {
    const user = userEvent.setup();
    renderizar();

    await escolher(user, 'Todas as empresas', 'Mentorando 1');

    await waitFor(() => {
      expect(dashboardsApi.getUserDashboard).toHaveBeenLastCalledWith(
        { period: undefined, member_id: 'link-m1' },
        expect.any(AbortSignal),
      );
    });
    // O nome dele no cabeçalho, e só os períodos dele: sem setor nem pessoa.
    await screen.findByRole('button', { name: /30\/06\/2026\s*Período/ });
    expect(screen.getAllByText('Mentorando 1').length).toBeGreaterThan(0);
    expect(dashboardsApi.getCompanyDashboard).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('button', { name: 'Acme Inc.' }),
    ).not.toBeInTheDocument();
  });

  it('should show the current picture of all mentees', async () => {
    const user = userEvent.setup();
    renderizar();

    await escolher(user, 'Todas as empresas', 'Todos os mentorandos');

    expect(
      await screen.findByRole('button', { name: 'Todos os mentorandos' }),
    ).toBeInTheDocument();
    // Sem mapa: com uma pessoa por linha, ele só repetiria a nota de cada uma,
    // que a comparação já mostra.
    expect(
      screen.queryByRole('heading', { name: /× prismas/ }),
    ).not.toBeInTheDocument();
  });

  it('should open the company from the URL, as the control panel links it', async () => {
    renderizar('admin', '/dashboard/company?organization_id=org-a');

    await waitFor(() => {
      expect(dashboardsApi.getCompanyDashboard).toHaveBeenLastCalledWith(
        { organization_id: 'org-a', member_id: undefined },
        expect.any(AbortSignal),
      );
    });
    expect(
      await screen.findByRole('button', { name: 'Empresa A' }),
    ).toBeInTheDocument();
  });

  it('should open the mentee from the URL, as the control panel links it', async () => {
    renderizar('admin', '/dashboard/company?member_id=link-m1');

    await waitFor(() => {
      expect(dashboardsApi.getUserDashboard).toHaveBeenLastCalledWith(
        { period: undefined, member_id: 'link-m1' },
        expect.any(AbortSignal),
      );
    });
    expect(
      await screen.findByRole('button', { name: 'Mentorando 1' }),
    ).toBeInTheDocument();
  });

  it('should not offer the questionnaire when the mentee has no result', async () => {
    vi.spyOn(dashboardsApi, 'getUserDashboard').mockRejectedValue(
      new ApiError('O mentorando ainda não tem resultado', 404),
    );
    renderizar('admin', '/dashboard/company?member_id=link-m1');

    expect(
      await screen.findByText(
        'Este mentorando ainda não tem resultado. Ele aparece aqui depois que o mentorando enviar um questionário.',
      ),
    ).toBeInTheDocument();
    // O questionário é de quem está logado, não do mentorando.
    expect(
      screen.queryByRole('link', { name: 'Ir para o questionário' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Mentorando 1' }),
    ).toBeInTheDocument();
  });

  it('should keep the selector when nobody answered yet', async () => {
    vi.spyOn(dashboardsApi, 'getOverview').mockRejectedValue(
      new ApiError('Ainda não há resultados', 404),
    );
    renderizar();

    expect(
      await screen.findByText(
        'Ainda não há resultados. Eles aparecem aqui depois que alguém responder um questionário.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Todas as empresas' }),
    ).toBeInTheDocument();
  });

  it('should show the manager her own organization, without the admin selector', async () => {
    renderizar('gestor');

    await screen.findByRole('button', { name: 'Acme Inc.' });
    expect(dashboardsApi.getOverview).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('button', { name: 'Todas as empresas' }),
    ).not.toBeInTheDocument();
  });

  describe('with the Creed.ai text of the chosen company being prepared', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should show what its manager sees, asking again for that company', async () => {
      const pronto = companyDashboardFixture();
      const busca = vi
        .spyOn(dashboardsApi, 'getCompanyDashboard')
        .mockResolvedValueOnce({
          ...pronto,
          creed_summary: {
            ...pronto.creed_summary,
            analiseTexto: [],
            recomendacaoTexto: [],
            prismas: {} as never,
            insight_status: 'pending',
            generated_at: null,
          },
        })
        .mockResolvedValue(pronto);
      renderizar('admin', '/dashboard/company?organization_id=org-a');

      expect(
        await screen.findAllByText('O Creed.ai está preparando este texto.'),
      ).toHaveLength(7);

      await act(() => vi.advanceTimersByTimeAsync(15_000));
      // A busca repetida é a da empresa escolhida, não a da administradora.
      expect(busca).toHaveBeenLastCalledWith(
        expect.objectContaining({ organization_id: 'org-a' }),
        expect.any(AbortSignal),
      );
      expect(screen.getByText('Gerado em 02/07/2026')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Recomendação para a equipe. Lorem ipsum dolor sit amet.',
        ),
      ).toBeInTheDocument();
    });
  });

  describe('download do retrato atual', () => {
    it('should list PDF and CSV in the download menu of all companies', async () => {
      const user = userEvent.setup();
      renderizar();

      await screen.findByText('Respostas de 01/09/2026 a 15/10/2026');
      await user.click(screen.getByRole('button', { name: 'Baixar' }));

      expect(screen.getByRole('menuitem', { name: 'PDF' })).toBeEnabled();
      expect(screen.getByRole('menuitem', { name: 'CSV' })).toBeEnabled();
    });

    it('should export the current picture of all companies as a CSV file', async () => {
      const csvExportModule = await import('./exportDashboardCsv');
      const exportCsvSpy = vi
        .spyOn(csvExportModule, 'exportDashboardCsv')
        .mockImplementation(() => undefined);
      const user = userEvent.setup();
      renderizar();

      await screen.findByText('Respostas de 01/09/2026 a 15/10/2026');
      await user.click(screen.getByRole('button', { name: 'Baixar' }));
      await user.click(screen.getByRole('menuitem', { name: 'CSV' }));

      expect(exportCsvSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'overview',
          viewLabel: 'Todas as empresas',
          responsesLabel: 'Respostas de 01/09/2026 a 15/10/2026',
          groupHeading: 'Empresa',
        }),
      );
    });

    it('should print the current picture of the mentees without asking the backend again', async () => {
      const print = vi
        .spyOn(window, 'print')
        .mockImplementation(() => undefined);
      const user = userEvent.setup();
      renderizar('admin', '/dashboard/company?view=mentees');

      await screen.findByText('Respostas de 01/09/2026 a 15/10/2026');
      await user.click(screen.getByRole('button', { name: 'Baixar' }));
      await user.click(screen.getByRole('menuitem', { name: 'PDF' }));

      await waitFor(() => {
        expect(print).toHaveBeenCalledTimes(1);
      });
      // Um pedido por retrato, o da carga: o PDF usa o que já está na tela.
      expect(dashboardsApi.getOverview).toHaveBeenCalledTimes(2);
      const report = document.querySelector('.dashboard-pdf-report');
      expect(
        report?.querySelectorAll('.pdf-company-summary-grid > article'),
      ).toHaveLength(4);
      // Sem o mapa: com uma pessoa por linha, ele só repetiria a nota dela.
      expect(report).not.toHaveTextContent('× prismas');
    });
  });
});
