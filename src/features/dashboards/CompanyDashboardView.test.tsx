import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authenticationReducer from '@/features/authentication/authenticationSlice';
import dashboardsReducer from '@/features/dashboards/dashboardsSlice';
import { dashboardsApi } from '@/features/dashboards/dashboardsApi';
import { CompanyDashboardView } from './CompanyDashboardView';
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
          role: 'admin',
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
      <MemoryRouter initialEntries={['/dashboard/company']}>
        <CompanyDashboardView />
      </MemoryRouter>
    </Provider>,
  );
  // A tela carrega pelo slice: espera o mock do dashboardsApi chegar.
  await waitFor(() => {
    expect(store.getState().dashboards.company.status).toBe('ready');
  });
  return view;
}

// O nome de um prisma aparece no resumo da empresa e no do Creed.ai: as
// buscas por título ficam presas à seção certa.
function secao(nome: string) {
  const titulo = screen.getByRole('button', { name: nome });
  const section = titulo.closest('section');
  if (!section) throw new Error(`Seção "${nome}" não encontrada`);
  return within(section);
}

describe('CompanyDashboardView', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('should render the page title with the company name', async () => {
    await renderizar();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Dashboard' }),
    ).toBeInTheDocument();
    // No cabeçalho, acima do título; o botão do recorte também se chama
    // Acme Inc., por isso a busca fica no `header`.
    expect(
      within(screen.getByRole('banner')).getByText('Acme Inc.'),
    ).toBeInTheDocument();
  });

  it('should render the summary title with the company name', async () => {
    await renderizar();

    expect(
      screen.getByRole('button', {
        name: i18n.t('resultado:resumoEmpresa', { empresa: 'Acme Inc.' }),
      }),
    ).toBeInTheDocument();
  });

  it('should render the completion rate card', async () => {
    await renderizar();

    expect(
      screen.getByText(i18n.t('resultado:taxaConclusao')),
    ).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('50/67')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '75',
    );
  });

  it('should render the highlight, opportunity and most common cards', async () => {
    await renderizar();
    const resumo = secao(
      i18n.t('resultado:resumoEmpresa', { empresa: 'Acme Inc.' }),
    );

    expect(
      resumo.getByText(`${i18n.t('resultado:destaque')} - 79`),
    ).toBeInTheDocument();
    expect(
      resumo.getByRole('heading', { name: 'Segurança Psicológica' }),
    ).toBeInTheDocument();

    expect(
      resumo.getByText(`${i18n.t('resultado:oportunidade')} - 54`),
    ).toBeInTheDocument();
    expect(
      resumo.getByRole('heading', { name: 'Neuroinovação' }),
    ).toBeInTheDocument();

    expect(
      resumo.getByText(`${i18n.t('resultado:maisComum')} - 67`),
    ).toBeInTheDocument();
    expect(
      resumo.getByRole('heading', { name: 'Cultura Empreendedora' }),
    ).toBeInTheDocument();
  });

  it('should collapse and expand the company summary when clicking its title', async () => {
    const user = userEvent.setup();
    await renderizar();

    const resumo = screen.getByRole('button', {
      name: i18n.t('resultado:resumoEmpresa', { empresa: 'Acme Inc.' }),
    });
    expect(resumo).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await user.click(resumo);

    expect(resumo).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByText('50/67')).not.toBeInTheDocument();

    await user.click(resumo);

    expect(resumo).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('50/67')).toBeInTheDocument();
  });

  it('should render the overview data section with a single prisma chart', async () => {
    await renderizar();

    expect(
      screen.getByRole('button', {
        name: i18n.t('resultado:metricas'),
      }),
    ).toBeInTheDocument();
    // A tabela acessível do radar (a outra tabela é o mapa de setores).
    expect(
      screen.getByRole('table', { name: /^Resultados/ }),
    ).toBeInTheDocument();
  });

  it('should compare with a department in another period', async () => {
    const user = userEvent.setup();
    await renderizar();

    // Começa em 2025/2; marcar o setor junta os dois: Marketing em 2025/2.
    await user.click(screen.getByRole('button', { name: 'Setor' }));
    await user.click(screen.getByRole('menuitemradio', { name: 'Marketing' }));

    expect(
      await screen.findByRole('button', { name: 'Marketing' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Acme Inc. 2026/1 em relação a Marketing 2025/2'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('table', { name: /^Resultados/ }),
    ).toHaveTextContent('Marketing 2025/2');
  });

  it('should compare with a department in the displayed period by picking it', async () => {
    const user = userEvent.setup();
    await renderizar();

    // Sem setor, o período exibido aparece no menu, mas não dá para escolher:
    // seria comparar a organização com ela mesma.
    await user.click(screen.getByRole('button', { name: '2025/2' }));
    expect(
      screen.getByRole('menuitemradio', { name: '2026/1' }),
    ).toHaveAttribute('aria-disabled', 'true');
    await user.keyboard('{Escape}');

    // Com o setor marcado, o período exibido vale: Marketing em 2026/1.
    await user.click(await screen.findByRole('button', { name: 'Setor' }));
    await user.click(screen.getByRole('menuitemradio', { name: 'Marketing' }));
    await user.click(await screen.findByRole('button', { name: '2025/2' }));
    await user.click(screen.getByRole('menuitemradio', { name: '2026/1' }));

    expect(
      await screen.findByText('Acme Inc. 2026/1 em relação a Marketing 2026/1'),
    ).toBeInTheDocument();
  });

  it('should compare with a department in the current period when no period is checked', async () => {
    const user = userEvent.setup();
    await renderizar();

    // "Sem comparação" limpa o período; aí escolher o setor compara com ele
    // no período exibido.
    await user.click(screen.getByRole('button', { name: '2025/2' }));
    await user.click(screen.getByRole('menuitem', { name: 'Sem comparação' }));
    await user.click(await screen.findByRole('button', { name: 'Setor' }));
    await user.click(screen.getByRole('menuitemradio', { name: 'RH' }));

    expect(
      await screen.findByText('Acme Inc. 2026/1 em relação a RH 2026/1'),
    ).toBeInTheDocument();
    expect(screen.getByText('diminuiu 14')).toBeInTheDocument();
  });

  it('should clear both comparisons when choosing no comparison', async () => {
    const user = userEvent.setup();
    await renderizar();

    await user.click(screen.getByRole('button', { name: 'Setor' }));
    await user.click(screen.getByRole('menuitemradio', { name: 'Marketing' }));
    await user.click(await screen.findByRole('button', { name: 'Marketing' }));
    await user.click(screen.getByRole('menuitem', { name: 'Sem comparação' }));

    expect(
      await screen.findByRole('button', { name: 'Período' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Setor' })).toBeInTheDocument();
    expect(
      screen.getByText('Acme Inc. 2026/1, sem comparação.'),
    ).toBeInTheDocument();
  });

  it('should show the chosen department as the main line', async () => {
    const user = userEvent.setup();
    await renderizar();

    await user.click(screen.getByRole('button', { name: 'Acme Inc.' }));
    const setorSub = await screen.findByRole('menuitem', { name: 'Setor' });
    setorSub.focus();
    await user.keyboard('{Enter}');
    const marketing = await screen.findByRole('menuitemradio', {
      name: 'Marketing',
    });
    marketing.focus();
    await user.keyboard('{Enter}');

    expect(
      await screen.findByText('Marketing 2026/1 em relação a Marketing 2025/2'),
    ).toBeInTheDocument();

    // O recorte muda a página inteira, não só o radar.
    expect(
      screen.getByRole('button', { name: 'Resumo de Marketing' }),
    ).toBeInTheDocument();
    expect(screen.getByText('12/14')).toBeInTheDocument();
    expect(
      screen.getByText('Análise de Marketing no período 2026/1.'),
    ).toBeInTheDocument();

    // O setor exibido também pode ser escolhido na comparação: Marketing em
    // 2026/1 contra Marketing em 2025/2.
    await user.click(screen.getByRole('button', { name: 'Setor' }));
    await user.click(screen.getByRole('menuitemradio', { name: 'Marketing' }));
    expect(
      await screen.findByText('Marketing 2026/1 em relação a Marketing 2025/2'),
    ).toBeInTheDocument();
    // O recorte do topo também se chama Marketing: a busca fica no grupo.
    expect(
      within(screen.getByRole('group', { name: 'Comparar com' })).getByRole(
        'button',
        { name: 'Marketing' },
      ),
    ).toBeInTheDocument();
  });

  it('should compare a department with the whole company', async () => {
    const user = userEvent.setup();
    await renderizar();

    await user.click(screen.getByRole('button', { name: 'Acme Inc.' }));
    const setorSub = await screen.findByRole('menuitem', { name: 'Setor' });
    setorSub.focus();
    await user.keyboard('{Enter}');
    const marketing = await screen.findByRole('menuitemradio', {
      name: 'Marketing',
    });
    marketing.focus();
    await user.keyboard('{Enter}');

    await user.click(await screen.findByRole('button', { name: 'Setor' }));
    await user.click(screen.getByRole('menuitemradio', { name: 'Acme Inc.' }));

    expect(
      await screen.findByText('Marketing 2026/1 em relação a Acme Inc. 2025/2'),
    ).toBeInTheDocument();
    // Segurança Psicológica: Marketing 82 contra a empresa 70.
    expect(screen.getByText('aumentou 12')).toBeInTheDocument();
  });

  it('should swap a department for the whole company without losing the period', async () => {
    const user = userEvent.setup();
    await renderizar();

    await user.click(screen.getByRole('button', { name: 'Setor' }));
    await user.click(screen.getByRole('menuitemradio', { name: 'Marketing' }));
    await user.click(await screen.findByRole('button', { name: 'Marketing' }));
    await user.click(screen.getByRole('menuitemradio', { name: 'Acme Inc.' }));

    expect(
      await screen.findByText('Acme Inc. 2026/1 em relação a Acme Inc. 2025/2'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2025/2' })).toBeInTheDocument();
  });

  it('should show the chosen employee as the main line', async () => {
    const user = userEvent.setup();
    await renderizar();

    await user.click(screen.getByRole('button', { name: 'Acme Inc.' }));
    const funcionarioSub = await screen.findByRole('menuitem', {
      name: 'Funcionário',
    });
    funcionarioSub.focus();
    await user.keyboard('{Enter}');
    const walter = await screen.findByRole('menuitemradio', {
      name: 'Walter White',
    });
    walter.focus();
    await user.keyboard('{Enter}');

    expect(
      await screen.findByText(
        'Walter White 2026/1 em relação a Walter White 2025/2',
      ),
    ).toBeInTheDocument();
    // Uma pessoa só não tem alinhamento.
    expect(
      screen.queryByRole('heading', { name: 'Alinhamento da equipe' }),
    ).not.toBeInTheDocument();
  });

  it('should show one Creed.ai card per prism, marking highlight and opportunity', async () => {
    await renderizar();
    const creed = secao(i18n.t('resultado:creedAi'));

    for (const name of [
      'Segurança Psicológica',
      'Liderança Adaptativa',
      'Cultura Empreendedora',
      'Adaptabilidade Cognitiva',
      'Neuroinovação',
    ]) {
      expect(creed.getByRole('heading', { name })).toBeInTheDocument();
    }
    // O destaque e a oportunidade são marcas nos cards, não cards à parte.
    expect(
      creed
        .getByRole('heading', { name: 'Segurança Psicológica' })
        .closest('article'),
    ).toHaveTextContent(i18n.t('resultado:destaque'));
    expect(
      creed.getByRole('heading', { name: 'Neuroinovação' }).closest('article'),
    ).toHaveTextContent(i18n.t('resultado:oportunidade'));
  });

  it('should show the team alignment in the overview', async () => {
    await renderizar();

    expect(
      screen.getByRole('heading', { name: 'Alinhamento da equipe' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Acme Inc. 2026/1 · 50 respostas'),
    ).toBeInTheDocument();
    expect(screen.getByText('Dividido')).toBeInTheDocument();
  });

  it('should show the alignment of a department even with few responses', async () => {
    const user = userEvent.setup();
    await renderizar();

    await user.click(screen.getByRole('button', { name: 'Acme Inc.' }));
    const setorSub = await screen.findByRole('menuitem', { name: 'Setor' });
    setorSub.focus();
    await user.keyboard('{Enter}');
    const administrativo = await screen.findByRole('menuitemradio', {
      name: 'Administrativo',
    });
    administrativo.focus();
    await user.keyboard('{Enter}');

    // A empresa já vê o resultado de cada pessoa: não há mínimo a proteger.
    expect(
      await screen.findByText('Administrativo 2026/1 · 4 respostas'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Alinhamento da equipe' }),
    ).toBeInTheDocument();
  });

  it('should keep the departments map of the whole company for any view, following only the period', async () => {
    const user = userEvent.setup();
    await renderizar();

    const mapa = () =>
      screen.getByRole('table', {
        name: '2026/1 · diferença em relação à empresa',
      });
    // RH: 3 pontos acima da empresa em Liderança Adaptativa.
    expect(within(mapa()).getByRole('row', { name: /RH/ })).toHaveTextContent(
      '80 +3',
    );
    expect(within(mapa()).queryByRole('button')).not.toBeInTheDocument();

    // Escolher um funcionário no topo não muda o mapa.
    await user.click(screen.getByRole('button', { name: 'Acme Inc.' }));
    const funcionarioSub = await screen.findByRole('menuitem', {
      name: 'Funcionário',
    });
    funcionarioSub.focus();
    await user.keyboard('{Enter}');
    const tom = await screen.findByRole('menuitemradio', {
      name: 'Tom Cruise',
    });
    tom.focus();
    await user.keyboard('{Enter}');

    expect(
      await screen.findByText(
        'Tom Cruise 2026/1 em relação a Tom Cruise 2025/2',
      ),
    ).toBeInTheDocument();
    expect(within(mapa()).getByRole('row', { name: /RH/ })).toHaveTextContent(
      '80 +3',
    );
  });

  it('should render the recommendation card in the Creed.ai summary', async () => {
    await renderizar();

    expect(
      screen.getByRole('heading', { name: 'Recomendação' }),
    ).toBeInTheDocument();
  });

  it('should start the view selector on the overview', async () => {
    await renderizar();

    expect(
      screen.getByRole('button', { name: 'Acme Inc.' }),
    ).toBeInTheDocument();
  });

  it('should select a department from the submenu', async () => {
    const user = userEvent.setup();
    await renderizar();

    const viewTrigger = screen.getByRole('button', { name: 'Acme Inc.' });
    await user.click(viewTrigger);

    const setorSub = await screen.findByRole('menuitem', { name: 'Setor' });
    setorSub.focus();
    await user.keyboard('{Enter}'); // abre submenu por teclado

    // Todos os setores do `DepartmentType` do back.
    for (const name of [
      'Marketing',
      'Financeiro',
      'Administrativo',
      'RH',
      'TI',
    ]) {
      expect(
        await screen.findByRole('menuitemradio', { name }),
      ).toBeInTheDocument();
    }

    const ti = screen.getByRole('menuitemradio', {
      name: 'TI',
    });
    ti.focus();
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(viewTrigger).toHaveTextContent('TI');
    });
  });

  it('should select a specific employee from the submenu', async () => {
    const user = userEvent.setup();
    await renderizar();

    // Guarda a referência do botão de visão ANTES de abrir o menu
    const viewTrigger = screen.getByRole('button', { name: 'Acme Inc.' });
    await user.click(viewTrigger);

    const funcionarioSub = await screen.findByRole('menuitem', {
      name: 'Funcionário',
    });
    funcionarioSub.focus();
    await user.keyboard('{Enter}'); // abre submenu por teclado

    const walterOption = await screen.findByRole('menuitemradio', {
      name: 'Walter White',
    });
    walterOption.focus();
    await user.keyboard('{Enter}'); // seleciona por teclado

    await waitFor(() => {
      expect(viewTrigger).toHaveTextContent('Walter White');
    });
  });

  it('should list PDF and CSV in the download menu', async () => {
    const user = userEvent.setup();
    await renderizar();

    await user.click(screen.getByRole('button', { name: 'Baixar' }));

    expect(screen.getByRole('menuitem', { name: 'PDF' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'CSV' })).toBeInTheDocument();
  });

  it('should export the latest organization-wide dashboard as a PDF', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    const getDashboard = vi.spyOn(dashboardsApi, 'getCompanyDashboard');
    const user = userEvent.setup();
    const { container } = await renderizar();

    await user.click(screen.getByRole('button', { name: 'Baixar' }));
    await user.click(screen.getByRole('menuitem', { name: 'PDF' }));

    await waitFor(() => {
      expect(print).toHaveBeenCalledTimes(1);
    });
    expect(getDashboard).toHaveBeenLastCalledWith({ period: '2026/1' });
    expect(
      container.querySelector(
        '.dashboard-pdf-report .pdf-company-summary-grid',
      ),
    ).toHaveClass('pdf-company-summary-grid');
    expect(
      container.querySelector('.dashboard-pdf-report .pdf-dashboard-metrics'),
    ).toHaveClass('pdf-dashboard-metrics');
  });

  it('should preserve the selected department in the latest PDF export', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    const getDashboard = vi.spyOn(dashboardsApi, 'getCompanyDashboard');
    const user = userEvent.setup();
    const { container } = await renderizar();

    await user.click(screen.getByRole('button', { name: 'Acme Inc.' }));
    const departmentMenu = await screen.findByRole('menuitem', {
      name: 'Setor',
    });
    departmentMenu.focus();
    await user.keyboard('{Enter}');
    const marketing = await screen.findByRole('menuitemradio', {
      name: 'Marketing',
    });
    marketing.focus();
    await user.keyboard('{Enter}');

    await user.click(screen.getByRole('button', { name: 'Baixar' }));
    await user.click(screen.getByRole('menuitem', { name: 'PDF' }));

    await waitFor(() => {
      expect(print).toHaveBeenCalledTimes(1);
    });
    expect(getDashboard).toHaveBeenLastCalledWith({
      period: '2026/1',
      department: 'Marketing',
    });
    expect(container.querySelector('.dashboard-pdf-report')).toHaveTextContent(
      'Resumo de Marketing',
    );
  });

  it('should translate the summary and the company-only items to English', async () => {
    await i18n.changeLanguage('en');
    await renderizar();

    expect(
      screen.getByRole('button', { name: 'Creed.ai' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Summary of Acme Inc.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Recommendation' }),
    ).toBeInTheDocument();
  });

  it('should translate the view menu to English', async () => {
    await i18n.changeLanguage('en');
    const user = userEvent.setup();
    await renderizar();

    await user.click(screen.getByRole('button', { name: 'Acme Inc.' }));

    expect(
      screen.getByRole('menuitemradio', { name: 'Acme Inc.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'Department' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'Employee' }),
    ).toBeInTheDocument();
  });
});
