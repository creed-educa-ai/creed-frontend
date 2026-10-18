import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardView } from './DashboardView';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

// O resumo em cards só aparece no fluxo empresa (toggle ligado).
async function renderComoEmpresa() {
  const user = userEvent.setup();
  render(<DashboardView />);
  await user.click(screen.getByRole('button', { name: 'Toggle empresa' }));
  return user;
}

describe('DashboardView', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('should render the page title and the logo', () => {
    render(<DashboardView />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Dashboard' }),
    ).toBeInTheDocument();
    expect(screen.getByAltText('CREED.ai')).toBeInTheDocument();
  });

  it('should render the header menu buttons by accessible name', () => {
    render(<DashboardView />);

    expect(
      screen.getByRole('button', { name: i18n.t('formulario:menuPainel') }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: i18n.t('formulario:menuFormulario') }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: i18n.t('formulario:menuInformacoes'),
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: i18n.t('formulario:menuSair') }),
    ).toBeInTheDocument();
  });

  it('should hide the company summary cards by default', () => {
    render(<DashboardView />);

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: i18n.t('resultado:resumoEmpresa', { empresa: 'Acme Inc.' }),
      }),
    ).not.toBeInTheDocument();
  });

  it('should render the summary title with the company name', async () => {
    await renderComoEmpresa();

    expect(
      screen.getByRole('button', {
        name: i18n.t('resultado:resumoEmpresa', { empresa: 'Acme Inc.' }),
      }),
    ).toBeInTheDocument();
  });

  it('should render the completion rate card', async () => {
    await renderComoEmpresa();

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
    await renderComoEmpresa();

    expect(
      screen.getByText(`${i18n.t('resultado:destaque')} - 79`),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Inovação' }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(`${i18n.t('resultado:oportunidade')} - 54`),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Neuroinovação' }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(`${i18n.t('resultado:maisComum')} - 67`),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Cultura' }),
    ).toBeInTheDocument();
  });

  it('should collapse and expand the company summary when clicking its title', async () => {
    const user = await renderComoEmpresa();

    const resumo = screen.getByRole('button', {
      name: i18n.t('resultado:resumoEmpresa', { empresa: 'Acme Inc.' }),
    });
    expect(resumo).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await user.click(resumo);

    expect(resumo).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Inovação' }),
    ).not.toBeInTheDocument();

    await user.click(resumo);

    expect(resumo).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('heading', { name: 'Inovação' }),
    ).toBeInTheDocument();
  });

  it('should render the overview data section with both prisma charts and the metrics cards', () => {
    render(<DashboardView />);

    expect(
      screen.getByRole('button', {
        name: i18n.t('resultado:dadosVisaoGeral'),
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: i18n.t('resultado:metricas') }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: i18n.t('resultado:evolucao') }),
    ).toBeInTheDocument();
    // Cada radar traz uma tabela acessível com os valores.
    expect(screen.getAllByRole('table')).toHaveLength(2);
  });

  it('should collapse and expand the overview data section', async () => {
    const user = userEvent.setup();
    render(<DashboardView />);

    const secao = screen.getByRole('button', {
      name: i18n.t('resultado:dadosVisaoGeral'),
    });
    expect(secao).toHaveAttribute('aria-expanded', 'true');

    await user.click(secao);

    expect(secao).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('heading', { name: i18n.t('resultado:metricas') }),
    ).not.toBeInTheDocument();
    expect(screen.queryAllByRole('table')).toHaveLength(0);

    await user.click(secao);

    expect(secao).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('heading', { name: i18n.t('resultado:metricas') }),
    ).toBeInTheDocument();
  });

  it('should collapse and expand the Creed.ai summary', async () => {
    const user = userEvent.setup();
    render(<DashboardView />);

    const resumo = screen.getByRole('button', {
      name: i18n.t('resultado:resumo'),
    });
    expect(resumo).toHaveAttribute('aria-expanded', 'true');

    await user.click(resumo);

    expect(resumo).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('heading', { name: 'Destaque' }),
    ).not.toBeInTheDocument();

    await user.click(resumo);

    expect(
      screen.getByRole('heading', { name: 'Destaque' }),
    ).toBeInTheDocument();
  });

  it('should hide the company-only items by default', () => {
    render(<DashboardView />);

    expect(
      screen.queryByRole('heading', { name: 'Recomendação' }),
    ).not.toBeInTheDocument();
  });

  it('should show the company-only items after clicking the toggle', async () => {
    await renderComoEmpresa();

    expect(
      screen.getByRole('heading', { name: 'Recomendação' }),
    ).toBeInTheDocument();
  });

  it('should hide the company-only items again when toggled off', async () => {
    const user = userEvent.setup();
    render(<DashboardView />);

    const toggle = screen.getByRole('button', { name: 'Toggle empresa' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(
      screen.queryByRole('heading', { name: 'Recomendação' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('should translate the summary and the company-only items to English', async () => {
    await i18n.changeLanguage('en');
    await renderComoEmpresa();

    expect(
      screen.getByRole('button', { name: 'Creed.ai Summary' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Summary of Acme Inc.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Overview Data' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Recommendation' }),
    ).toBeInTheDocument();
  });
  it('should hide the view selector by default', () => {
    render(<DashboardView />);

    expect(
      screen.queryByRole('button', { name: 'Visão Geral' }),
    ).not.toBeInTheDocument();
  });

  it('should show the view selector only when company mode is on', async () => {
    const user = userEvent.setup();
    render(<DashboardView />);

    const toggle = screen.getByRole('button', { name: 'Toggle empresa' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('button', { name: 'Visão Geral' }),
    ).toBeInTheDocument();

    await user.click(toggle);
    expect(
      screen.queryByRole('button', { name: 'Visão Geral' }),
    ).not.toBeInTheDocument();
  });

  it('should change the view label when selecting a group', async () => {
    const user = userEvent.setup();
    render(<DashboardView />);
    await user.click(screen.getByRole('button', { name: 'Toggle empresa' }));

    await user.click(screen.getByRole('button', { name: 'Visão Geral' }));
    await user.click(screen.getByRole('menuitemradio', { name: 'Gerentes' }));

    expect(
      await screen.findByRole('button', { name: 'Gerentes' }),
    ).toBeInTheDocument();
  });
  it('should select a specific employee from the submenu', async () => {
    const user = userEvent.setup();
    render(<DashboardView />);

    await user.click(screen.getByRole('button', { name: 'Toggle empresa' }));

    // Guarda a referência do botão de visão ANTES de abrir o menu
    const viewTrigger = screen.getByRole('button', { name: 'Visão Geral' });
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
  it('should reset the view to overview when company mode is turned off and on', async () => {
    const user = userEvent.setup();
    render(<DashboardView />);

    const toggle = screen.getByRole('button', { name: 'Toggle empresa' });
    await user.click(toggle);
    await user.click(screen.getByRole('button', { name: 'Visão Geral' }));
    await user.click(screen.getByRole('menuitemradio', { name: 'Gerentes' }));

    await user.click(toggle);
    await user.click(toggle);

    expect(
      await screen.findByRole('button', { name: 'Visão Geral' }),
    ).toBeInTheDocument();
  });

  it('should change the period when selecting another option', async () => {
    const user = userEvent.setup();
    render(<DashboardView />);

    // No jsdom não há CSS: os dois spans (desktop e mobile) entram no nome do botão.
    await user.click(screen.getByRole('button', { name: /2026\/1/ }));
    expect(
      screen.getByRole('menuitemradio', { name: '2026/1' }),
    ).toHaveAttribute('aria-checked', 'true');

    await user.click(screen.getByRole('menuitemradio', { name: '2025/2' }));

    expect(
      await screen.findByRole('button', { name: /2025\/2/ }),
    ).toBeInTheDocument();
  });

  it('should list PDF and CSV in the download menu', async () => {
    const user = userEvent.setup();
    render(<DashboardView />);

    await user.click(screen.getByRole('button', { name: 'Baixar' }));

    expect(screen.getByRole('menuitem', { name: 'PDF' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'CSV' })).toBeInTheDocument();
  });

  it('should open the print dialog when choosing PDF', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    const user = userEvent.setup();
    render(<DashboardView />);

    await user.click(screen.getByRole('button', { name: 'Baixar' }));
    await user.click(screen.getByRole('menuitem', { name: 'PDF' }));

    expect(print).toHaveBeenCalledTimes(1);
    print.mockRestore();
  });

  it('should translate the action buttons and the view menu to English', async () => {
    await i18n.changeLanguage('en');
    const user = userEvent.setup();
    render(<DashboardView />);

    expect(
      screen.getByRole('button', { name: 'Download' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Toggle empresa' }));
    await user.click(screen.getByRole('button', { name: 'Overview' }));

    expect(
      screen.getByRole('menuitemradio', { name: 'Overview' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitemradio', { name: 'Managers' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitemradio', { name: 'Team members' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'Employee' }),
    ).toBeInTheDocument();
  });
});
