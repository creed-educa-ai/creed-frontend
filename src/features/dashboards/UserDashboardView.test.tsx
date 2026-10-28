import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authenticationReducer from '@/features/authentication/authenticationSlice';
import { UserDashboardView } from './UserDashboardView';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

// O menu do topo lê o papel na sessão e marca o item da rota atual.
function renderizar() {
  const store = configureStore({
    reducer: { authentication: authenticationReducer },
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
      },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <UserDashboardView />
      </MemoryRouter>
    </Provider>,
  );
}

describe('UserDashboardView', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('should render the page title and the logo', () => {
    renderizar();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Dashboard' }),
    ).toBeInTheDocument();
    expect(screen.getByAltText('CREED.ai')).toBeInTheDocument();
  });

  it('should render the header menu items by accessible name', () => {
    renderizar();

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

  it('should not render the company-only summary, recommendation or view selector', () => {
    renderizar();

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

  it('should render the overview data section with both prisma charts and the metrics card', () => {
    renderizar();

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
    renderizar();

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
    renderizar();

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

  it('should change the period when selecting another option', async () => {
    const user = userEvent.setup();
    renderizar();

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
    renderizar();

    await user.click(screen.getByRole('button', { name: 'Baixar' }));

    expect(screen.getByRole('menuitem', { name: 'PDF' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'CSV' })).toBeInTheDocument();
  });

  it('should open the print dialog when choosing PDF', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    const user = userEvent.setup();
    renderizar();

    await user.click(screen.getByRole('button', { name: 'Baixar' }));
    await user.click(screen.getByRole('menuitem', { name: 'PDF' }));

    expect(print).toHaveBeenCalledTimes(1);
    print.mockRestore();
  });

  it('should translate the sections and the download button to English', async () => {
    await i18n.changeLanguage('en');
    renderizar();

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
});
