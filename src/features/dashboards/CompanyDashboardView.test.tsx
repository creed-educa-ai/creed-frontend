import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authenticationReducer from '@/features/authentication/authenticationSlice';
import { CompanyDashboardView } from './CompanyDashboardView';
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
          role: 'admin',
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
      <MemoryRouter initialEntries={['/dashboard/company']}>
        <CompanyDashboardView />
      </MemoryRouter>
    </Provider>,
  );
}

describe('CompanyDashboardView', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('should render the page title with the company name', () => {
    renderizar();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Dashboard' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Acme Inc.')).toBeInTheDocument();
  });

  it('should render the summary title with the company name', () => {
    renderizar();

    expect(
      screen.getByRole('button', {
        name: i18n.t('resultado:resumoEmpresa', { empresa: 'Acme Inc.' }),
      }),
    ).toBeInTheDocument();
  });

  it('should render the completion rate card', () => {
    renderizar();

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
    renderizar();

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
    renderizar();

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

  it('should render the overview data section with the prisma and evolution charts', () => {
    renderizar();

    expect(
      screen.getByRole('button', {
        name: i18n.t('resultado:dadosVisaoGeral'),
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('table')).toHaveLength(2);
  });

  it('should render the recommendation card in the Creed.ai summary', () => {
    renderizar();

    expect(
      screen.getByRole('heading', { name: 'Recomendação' }),
    ).toBeInTheDocument();
  });

  it('should start the view selector on the overview', () => {
    renderizar();

    expect(
      screen.getByRole('button', { name: 'Visão Geral' }),
    ).toBeInTheDocument();
  });

  it('should change the view label when selecting a group', async () => {
    const user = userEvent.setup();
    renderizar();

    await user.click(screen.getByRole('button', { name: 'Visão Geral' }));
    await user.click(screen.getByRole('menuitemradio', { name: 'Gerentes' }));

    expect(
      await screen.findByRole('button', { name: 'Gerentes' }),
    ).toBeInTheDocument();
  });

  it('should select a specific employee from the submenu', async () => {
    const user = userEvent.setup();
    renderizar();

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

  it('should list PDF and CSV in the download menu', async () => {
    const user = userEvent.setup();
    renderizar();

    await user.click(screen.getByRole('button', { name: 'Baixar' }));

    expect(screen.getByRole('menuitem', { name: 'PDF' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'CSV' })).toBeInTheDocument();
  });

  it('should translate the summary and the company-only items to English', async () => {
    await i18n.changeLanguage('en');
    renderizar();

    expect(
      screen.getByRole('button', { name: 'Creed.ai Summary' }),
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
    renderizar();

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
