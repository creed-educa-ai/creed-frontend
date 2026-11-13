import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authenticationReducer from '@/features/authentication/authenticationSlice';
import { dashboardsApi } from '@/features/dashboards/dashboardsApi';
import dashboardsReducer from '@/features/dashboards/dashboardsSlice';
import { UserDashboardView } from './UserDashboardView';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { ApiError } from '@/lib/apiClient';
import { userDashboardFixture } from './__fixtures__/userDashboard';

// O menu do topo lê o papel na sessão e marca o item da rota atual.
async function renderizar(role = 'respondente') {
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
          link_id: null,
          organization_id: null,
          organization_name: null,
        },
        status: 'authenticated' as const,
        error: null,
        passwordReset: { status: 'idle' as const, error: null },
      },
    },
  });

  const view = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <UserDashboardView />
      </MemoryRouter>
    </Provider>,
  );
  // A tela carrega pelo slice: espera a resposta do back (a fixture) chegar.
  await waitFor(() => {
    expect(store.getState().dashboards.user.status).toBe('ready');
  });
  return view;
}

describe('UserDashboardView', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(async () => {
    // O back responde o período pedido, ou o mais recente.
    vi.spyOn(dashboardsApi, 'getUserDashboard').mockImplementation(
      (filters = {}) => Promise.resolve(userDashboardFixture(filters.period)),
    );
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('should render the page title and the logo', async () => {
    await renderizar();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Dashboard' }),
    ).toBeInTheDocument();
    expect(screen.getByAltText('CREED.ai')).toBeInTheDocument();
  });

  it('should render the header menu items by accessible name', async () => {
    await renderizar();

    expect(
      screen.getByRole('link', { name: i18n.t('formulario:menuPainel') }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: i18n.t('formulario:menuFormulario') }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: i18n.t('formulario:menuInformacoes'),
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: i18n.t('formulario:menuSair') }),
    ).toBeInTheDocument();
  });

  it('should not render the company-only summary, recommendation or view selector', async () => {
    await renderizar();

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: i18n.t('resultado:resumoEmpresa', { empresa: 'Acme Inc.' }),
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Recomendação' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Acme Inc.' }),
    ).not.toBeInTheDocument();
  });

  it('should render the overview data section with the variation card and one prisma chart', async () => {
    await renderizar();

    expect(
      screen.getByRole('button', {
        name: i18n.t('resultado:metricas'),
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: i18n.t('dashboardPrisma:variacao.titulo'),
      }),
    ).toBeInTheDocument();
    // O radar traz uma tabela acessível com os valores.
    expect(screen.getAllByRole('table')).toHaveLength(1);
    // O alinhamento é só da visão da empresa.
    expect(
      screen.queryByRole('heading', { name: 'Alinhamento da equipe' }),
    ).not.toBeInTheDocument();
  });

  it('should start comparing with the most recent period', async () => {
    await renderizar();

    expect(
      screen.getByRole('group', { name: 'Comparar com' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '31/12/2025' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('30/06/2026 em relação a 31/12/2025'),
    ).toBeInTheDocument();
    expect(screen.getByRole('table')).toHaveTextContent('31/12/2025');
    // Quem responde só compara com os próprios períodos, não com setores.
    expect(
      screen.queryByRole('button', { name: 'Setor' }),
    ).not.toBeInTheDocument();
  });

  it('should change the compared period in the chart and in the variation card', async () => {
    const user = userEvent.setup();
    await renderizar();

    await user.click(screen.getByRole('button', { name: '31/12/2025' }));
    await user.click(screen.getByRole('menuitemradio', { name: '30/06/2025' }));

    expect(
      await screen.findByRole('button', { name: '30/06/2025' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('30/06/2026 em relação a 30/06/2025'),
    ).toBeInTheDocument();
    expect(screen.getByText('diminuiu 3')).toBeInTheDocument();
    expect(screen.getByRole('table')).toHaveTextContent('30/06/2025');
    // As dimensões seguem a mesma comparação (S7: 82 contra 78 em 30/06/2025).
    expect(screen.getByText(/S7/).closest('li')).toHaveTextContent('82 / 78');
  });

  it('should keep the compared period when choosing it again', async () => {
    const user = userEvent.setup();
    await renderizar();

    await user.click(screen.getByRole('button', { name: '31/12/2025' }));
    await user.click(screen.getByRole('menuitemradio', { name: '31/12/2025' }));

    // Só "Sem comparação" limpa.
    expect(
      await screen.findByRole('button', { name: '31/12/2025' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('30/06/2026 em relação a 31/12/2025'),
    ).toBeInTheDocument();
  });

  it('should show only the current period when choosing no comparison', async () => {
    const user = userEvent.setup();
    await renderizar();

    await user.click(screen.getByRole('button', { name: '31/12/2025' }));
    await user.click(screen.getByRole('menuitem', { name: 'Sem comparação' }));

    expect(
      await screen.findByText('30/06/2026, sem comparação.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Período' })).toBeInTheDocument();
    expect(screen.queryByText(/aumentou|diminuiu/)).not.toBeInTheDocument();
    expect(screen.getByRole('table').querySelectorAll('thead th')).toHaveLength(
      2,
    );
  });

  it('should load the chosen period and compare it with the one before', async () => {
    const user = userEvent.setup();
    await renderizar();

    await user.click(
      screen.getByRole('button', { name: /^30\/06\/2026\s*Período$/ }),
    );
    await user.click(screen.getByRole('menuitemradio', { name: '31/12/2025' }));

    expect(
      await screen.findByText('31/12/2025 em relação a 30/06/2025'),
    ).toBeInTheDocument();
    // Linha cheia (31/12/2025) e tracejada (30/06/2025) na tabela do radar.
    const header = screen.getByRole('table').querySelector('thead');
    expect(header).toHaveTextContent('31/12/2025');
    expect(header).toHaveTextContent('30/06/2025');
  });

  it('should not compare the oldest period with anything by default', async () => {
    const user = userEvent.setup();
    await renderizar();

    await user.click(
      screen.getByRole('button', { name: /^30\/06\/2026\s*Período$/ }),
    );
    await user.click(screen.getByRole('menuitemradio', { name: '30/06/2025' }));

    expect(
      await screen.findByText('30/06/2025, sem comparação.'),
    ).toBeInTheDocument();
  });

  it('should collapse and expand the overview data section', async () => {
    const user = userEvent.setup();
    await renderizar();

    const secao = screen.getByRole('button', {
      name: i18n.t('resultado:metricas'),
    });
    expect(secao).toHaveAttribute('aria-expanded', 'true');

    await user.click(secao);

    expect(secao).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('heading', {
        name: i18n.t('dashboardPrisma:variacao.titulo'),
      }),
    ).not.toBeInTheDocument();
    expect(screen.queryAllByRole('table')).toHaveLength(0);

    await user.click(secao);

    expect(secao).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('heading', {
        name: i18n.t('dashboardPrisma:variacao.titulo'),
      }),
    ).toBeInTheDocument();
  });

  it('should collapse and expand the Creed.ai summary', async () => {
    const user = userEvent.setup();
    await renderizar();

    const resumo = screen.getByRole('button', {
      name: i18n.t('resultado:creedAi'),
    });
    expect(resumo).toHaveAttribute('aria-expanded', 'true');

    await user.click(resumo);

    expect(resumo).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('heading', { name: i18n.t('resultado:analise') }),
    ).not.toBeInTheDocument();

    await user.click(resumo);

    expect(
      screen.getByRole('heading', { name: i18n.t('resultado:analise') }),
    ).toBeInTheDocument();
  });

  it('should change the period when selecting another option', async () => {
    const user = userEvent.setup();
    await renderizar();

    // No jsdom não há CSS: os dois spans (desktop e mobile) entram no nome do botão.
    await user.click(screen.getByRole('button', { name: /30\/06\/2026/ }));
    expect(
      screen.getByRole('menuitemradio', { name: '30/06/2026' }),
    ).toHaveAttribute('aria-checked', 'true');

    await user.click(screen.getByRole('menuitemradio', { name: '31/12/2025' }));

    // O botão do topo leva o rótulo de celular no nome ("Período"); o de
    // comparação também se chama "31/12/2025", e sem esse sufixo os dois casariam.
    expect(
      await screen.findByRole('button', {
        name: /^31\/12\/2025\s*Período$/,
      }),
    ).toBeInTheDocument();
  });

  it('should list PDF and CSV in the download menu', async () => {
    const user = userEvent.setup();
    await renderizar();

    await user.click(screen.getByRole('button', { name: 'Baixar' }));

    expect(screen.getByRole('menuitem', { name: 'PDF' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'CSV' })).toBeInTheDocument();
  });

  it('should export the latest period using the dedicated PDF report', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    const getDashboard = vi.spyOn(dashboardsApi, 'getUserDashboard');
    const user = userEvent.setup();
    const { container } = await renderizar();

    await user.click(screen.getByRole('button', { name: 'Baixar' }));
    await user.click(screen.getByRole('menuitem', { name: 'PDF' }));

    await waitFor(() => {
      expect(print).toHaveBeenCalledTimes(1);
    });
    expect(getDashboard).toHaveBeenLastCalledWith({ period: 'periodo-2026-1' });
    expect(
      container.querySelector('.dashboard-pdf-report'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('.dashboard-pdf-report nav'),
    ).not.toBeInTheDocument();
    expect(
      container.querySelector(
        '.dashboard-pdf-report .pdf-dashboard-metrics .pdf-prisma-radar',
      ),
    ).toHaveAttribute('viewBox', '0 0 260 250');
    expect(
      container.querySelectorAll(
        '.dashboard-pdf-report .pdf-prisma-axis-label',
      ),
    ).toHaveLength(5);
    expect(
      container.querySelectorAll(
        '.dashboard-pdf-report .pdf-prisma-axis-value',
      ),
    ).toHaveLength(5);
    expect(
      container.querySelectorAll(
        '.dashboard-pdf-report .pdf-prisma-summaries article',
      ),
    ).toHaveLength(5);
    expect(container.querySelector('.dashboard-pdf-report')).toHaveTextContent(
      'Leitura breve de Segurança Psicológica para você.',
    );
  });

  it('should translate the sections and the download button to English', async () => {
    await i18n.changeLanguage('en');
    await renderizar();

    expect(
      screen.getByRole('button', { name: 'Creed.ai' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Metrics' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Download' }),
    ).toBeInTheDocument();
  });

  it('should show a translated error when the dashboard does not load', async () => {
    vi.spyOn(dashboardsApi, 'getUserDashboard').mockRejectedValue(
      new Error('Falha técnica'),
    );
    const store = configureStore({
      reducer: {
        authentication: authenticationReducer,
        dashboards: dashboardsReducer,
      },
    });
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <UserDashboardView />
        </MemoryRouter>
      </Provider>,
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar o dashboard.',
    );
  });

  it('should show the period by its end date, not by the form id', async () => {
    await renderizar();

    expect(
      screen.getByRole('button', { name: /^30\/06\/2026\s*Período$/ }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/periodo-2026-1/)).not.toBeInTheDocument();
  });

  it('should show the end date in the format of the screen language', async () => {
    await i18n.changeLanguage('en');
    await renderizar();

    expect(
      screen.getByRole('button', { name: /^06\/30\/2026\s*Period$/ }),
    ).toBeInTheDocument();
  });

  it('should ask for the chosen period by its id', async () => {
    const user = userEvent.setup();
    await renderizar();

    await user.click(
      screen.getByRole('button', { name: /^30\/06\/2026\s*Período$/ }),
    );
    await user.click(screen.getByRole('menuitemradio', { name: '31/12/2025' }));

    await waitFor(() => {
      expect(dashboardsApi.getUserDashboard).toHaveBeenLastCalledWith({
        period: 'periodo-2025-2',
      });
    });
  });

  it('should say the analysis is not available yet when the texts come empty', async () => {
    vi.spyOn(dashboardsApi, 'getUserDashboard').mockResolvedValue({
      ...userDashboardFixture(),
      creed_summary: {
        ...userDashboardFixture().creed_summary,
        analiseTexto: [],
        recomendacaoTexto: [],
        prismas: {} as never,
      },
    });
    await renderizar();

    // Um na análise e um em cada um dos cinco cards de prisma.
    expect(screen.getAllByText('Análise ainda não disponível.')).toHaveLength(
      6,
    );
    expect(screen.getByText('Destaque')).toBeInTheDocument();
  });

  it('should point to the questionnaire when the person has no result yet', async () => {
    vi.spyOn(dashboardsApi, 'getUserDashboard').mockRejectedValue(
      new ApiError('Você ainda não tem resultado', 404),
    );
    const store = configureStore({
      reducer: {
        authentication: authenticationReducer,
        dashboards: dashboardsReducer,
      },
    });
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <UserDashboardView />
        </MemoryRouter>
      </Provider>,
    );

    expect(
      await screen.findByText(
        'Você ainda não tem resultado. Ele aparece aqui depois que você enviar um questionário.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Ir para o questionário' }),
    ).toHaveAttribute('href', '/questionnaire');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should offer the manager a way back to the company dashboard', async () => {
    await renderizar('gestor');

    expect(
      screen.getByRole('link', { name: 'Voltar ao dashboard da empresa' }),
    ).toHaveAttribute('href', '/dashboard/company');
  });

  it('should not offer the way back to whoever answers', async () => {
    await renderizar();

    expect(
      screen.queryByRole('link', { name: 'Voltar ao dashboard da empresa' }),
    ).not.toBeInTheDocument();
  });
});
