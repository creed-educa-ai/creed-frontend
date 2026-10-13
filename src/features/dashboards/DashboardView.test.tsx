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

  it('should collapse and expand the company summary when clicking its title', async () => {
    const user = userEvent.setup();
    render(<DashboardView />);

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
    const user = userEvent.setup();
    render(<DashboardView />);

    await user.click(screen.getByRole('button', { name: 'Toggle empresa' }));

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
  });

  it('should translate the summary and the company-only items to English', async () => {
    await i18n.changeLanguage('en');
    const user = userEvent.setup();
    render(<DashboardView />);

    await user.click(screen.getByRole('button', { name: 'Toggle empresa' }));

    expect(
      screen.getByRole('button', { name: 'Creed.ai Summary' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Highlight' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Recommendation' }),
    ).toBeInTheDocument();
  });
});
