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

  it('should render the summary with highlight, opportunity and analysis', () => {
    render(<DashboardView />);

    expect(
      screen.getByRole('button', { name: 'Resumo do Creed.ai' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Destaque' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Oportunidade' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Análise do Creed.ai' }),
    ).toBeInTheDocument();
  });

  it('should collapse and expand the summary when clicking its title', async () => {
    const user = userEvent.setup();
    render(<DashboardView />);

    const resumo = screen.getByRole('button', { name: 'Resumo do Creed.ai' });
    expect(resumo).toHaveAttribute('aria-expanded', 'true');

    await user.click(resumo);

    expect(resumo).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('heading', { name: 'Destaque' }),
    ).not.toBeInTheDocument();

    await user.click(resumo);

    expect(resumo).toHaveAttribute('aria-expanded', 'true');
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
