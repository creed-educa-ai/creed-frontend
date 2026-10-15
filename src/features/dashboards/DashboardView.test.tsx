import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardView } from './DashboardView';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

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

  it('should render the summary title with the company name', () => {
    render(<DashboardView />);

    expect(
      screen.getByRole('button', {
        name: i18n.t('resultado:resumoEmpresa', { empresa: 'Acme Inc.' }),
      }),
    ).toBeInTheDocument();
  });

  it('should render the completion rate card', () => {
    render(<DashboardView />);

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

  it('should render the highlight, opportunity and most common cards', () => {
    render(<DashboardView />);

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

  it('should collapse and expand the summary when clicking its title', async () => {
    const user = userEvent.setup();
    render(<DashboardView />);

    const resumo = screen.getByRole('button', {
      name: i18n.t('resultado:resumoEmpresa', { empresa: 'Acme Inc.' }),
    });
    expect(resumo).toHaveAttribute('aria-expanded', 'true');

    await user.click(resumo);

    expect(resumo).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Inovação' }),
    ).not.toBeInTheDocument();

    await user.click(resumo);

    expect(resumo).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Inovação' }),
    ).toBeInTheDocument();
  });

  it('should translate the summary to English', async () => {
    await i18n.changeLanguage('en');
    render(<DashboardView />);

    expect(
      screen.getByRole('button', { name: 'Summary of Acme Inc.' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Completion Rate')).toBeInTheDocument();
    expect(screen.getByText('Highlight - 79')).toBeInTheDocument();
    expect(screen.getByText('Opportunity - 54')).toBeInTheDocument();
    expect(screen.getByText('Most common - 67')).toBeInTheDocument();
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

    await user.click(screen.getByRole('button', { name: 'Visão Geral' }));
    await user.click(screen.getByRole('menuitem', { name: 'Funcionário' }));
    await user.click(
      await screen.findByRole('menuitemradio', { name: 'Walter White' }),
    );

    expect(
      await screen.findByRole('button', { name: 'Walter White' }),
    ).toBeInTheDocument();
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
