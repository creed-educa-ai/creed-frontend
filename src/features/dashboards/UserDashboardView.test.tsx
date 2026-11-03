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

// O menu do topo lê o papel na sessão e marca o item da rota atual.
async function renderizar() {
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
          role: 'respondente',
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
  // A tela carrega pelo slice: espera o mock do dashboardsApi chegar.
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
      screen.queryByRole('button', { name: 'Visão Geral' }),
    ).not.toBeInTheDocument();
  });

  it('should render the overview data section with the variation card and one prisma chart', async () => {
    await renderizar();

    expect(
      screen.getByRole('button', {
        name: i18n.t('resultado:dadosVisaoGeral'),
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
    expect(screen.getByRole('button', { name: '2025/2' })).toBeInTheDocument();
    expect(screen.getByText('2026/1 em relação a 2025/2')).toBeInTheDocument();
    expect(screen.getByRole('table')).toHaveTextContent('2025/2');
    // Quem responde só compara com os próprios períodos, não com setores.
    expect(
      screen.queryByRole('button', { name: 'Setor' }),
    ).not.toBeInTheDocument();
  });

  it('should change the compared period in the chart and in the variation card', async () => {
    const user = userEvent.setup();
    await renderizar();

    await user.click(screen.getByRole('button', { name: '2025/2' }));
    await user.click(screen.getByRole('menuitemradio', { name: '2025/1' }));

    expect(
      await screen.findByRole('button', { name: '2025/1' }),
    ).toBeInTheDocument();
    expect(screen.getByText('2026/1 em relação a 2025/1')).toBeInTheDocument();
    expect(screen.getByText('diminuiu 3')).toBeInTheDocument();
    expect(screen.getByRole('table')).toHaveTextContent('2025/1');
    // As dimensões seguem a mesma comparação (S7: 82 contra 78 em 2025/1).
    expect(screen.getByText(/S7/).closest('li')).toHaveTextContent('82 / 78');
  });

  it('should uncheck the compared period when clicking it again', async () => {
    const user = userEvent.setup();
    await renderizar();

    await user.click(screen.getByRole('button', { name: '2025/2' }));
    await user.click(screen.getByRole('menuitemradio', { name: '2025/2' }));

    expect(
      await screen.findByRole('button', { name: 'Período' }),
    ).toBeInTheDocument();
    expect(screen.getByText('2026/1, sem comparação.')).toBeInTheDocument();
  });

  it('should show only the current period when choosing no comparison', async () => {
    const user = userEvent.setup();
    await renderizar();

    await user.click(screen.getByRole('button', { name: '2025/2' }));
    await user.click(screen.getByRole('menuitem', { name: 'Sem comparação' }));

    expect(
      await screen.findByText('2026/1, sem comparação.'),
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
      screen.getByRole('button', { name: /^2026\/1\s*Período$/ }),
    );
    await user.click(screen.getByRole('menuitemradio', { name: '2025/2' }));

    expect(
      await screen.findByText('2025/2 em relação a 2025/1'),
    ).toBeInTheDocument();
    // Linha cheia (2025/2) e tracejada (2025/1) na tabela do radar.
    const header = screen.getByRole('table').querySelector('thead');
    expect(header).toHaveTextContent('2025/2');
    expect(header).toHaveTextContent('2025/1');
  });

  it('should not compare the oldest period with anything by default', async () => {
    const user = userEvent.setup();
    await renderizar();

    await user.click(
      screen.getByRole('button', { name: /^2026\/1\s*Período$/ }),
    );
    await user.click(screen.getByRole('menuitemradio', { name: '2025/1' }));

    expect(
      await screen.findByText('2025/1, sem comparação.'),
    ).toBeInTheDocument();
  });

  it('should collapse and expand the overview data section', async () => {
    const user = userEvent.setup();
    await renderizar();

    const secao = screen.getByRole('button', {
      name: i18n.t('resultado:dadosVisaoGeral'),
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
      name: i18n.t('resultado:resumo'),
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
    await user.click(screen.getByRole('button', { name: /2026\/1/ }));
    expect(
      screen.getByRole('menuitemradio', { name: '2026/1' }),
    ).toHaveAttribute('aria-checked', 'true');

    await user.click(screen.getByRole('menuitemradio', { name: '2025/2' }));

    // O botão do topo leva o rótulo de celular no nome ("Período"); o de
    // comparação também se chama "2025/2", e sem esse sufixo os dois casariam.
    expect(
      await screen.findByRole('button', { name: /^2025\/2\s*Período$/ }),
    ).toBeInTheDocument();
  });

  it('should list PDF and CSV in the download menu', async () => {
    const user = userEvent.setup();
    await renderizar();

    await user.click(screen.getByRole('button', { name: 'Baixar' }));

    expect(screen.getByRole('menuitem', { name: 'PDF' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'CSV' })).toBeInTheDocument();
  });

  it('should open the print dialog when choosing PDF', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    const user = userEvent.setup();
    await renderizar();

    await user.click(screen.getByRole('button', { name: 'Baixar' }));
    await user.click(screen.getByRole('menuitem', { name: 'PDF' }));

    expect(print).toHaveBeenCalledTimes(1);
    print.mockRestore();
  });

  it('should translate the sections and the download button to English', async () => {
    await i18n.changeLanguage('en');
    await renderizar();

    expect(
      screen.getByRole('button', { name: 'Creed.ai Summary' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Overview Data' }),
    ).toBeInTheDocument();
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
});
