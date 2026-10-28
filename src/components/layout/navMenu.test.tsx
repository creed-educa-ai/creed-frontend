import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { NavMenu } from '@/components/layout/navMenu';
import authenticationReducer from '@/features/authentication/authenticationSlice';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import type { UserSessionResponse } from '@/types/api';

function usuarioCom(role: string): UserSessionResponse {
  return {
    id: 'usuario-1',
    email: 'dev@creed.example.com',
    role,
    link_id: null,
    organization_id: null,
    organization_name: null,
  };
}

// Sem usuário = sessão vazia (login desligado ou deslogado).
function renderizar(user: UserSessionResponse | null, rota = '/dashboard') {
  const store = configureStore({
    reducer: { authentication: authenticationReducer },
    preloadedState: {
      authentication: {
        user,
        status: user ? ('authenticated' as const) : ('idle' as const),
        error: null,
      },
    },
  });

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[rota]}>
        <Routes>
          <Route path="/" element={<p>tela de boas-vindas</p>} />
          <Route path="*" element={<NavMenu />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

  return store;
}

type ItemDoMenu =
  'menuPainel' | 'menuPainelControle' | 'menuFormulario' | 'menuInformacoes';

const link = (chave: ItemDoMenu) =>
  screen.getByRole('link', { name: i18n.t(`formulario:${chave}`) });

describe('NavMenu', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('should point the respondent to their own dashboard, without control panel', () => {
    renderizar(usuarioCom('respondente'));

    expect(link('menuPainel')).toHaveAttribute('href', '/dashboard');
    expect(
      screen.queryByRole('link', {
        name: i18n.t('formulario:menuPainelControle'),
      }),
    ).not.toBeInTheDocument();
  });

  it('should point the admin to the company dashboard and the control panel', () => {
    renderizar(usuarioCom('admin'));

    expect(link('menuPainel')).toHaveAttribute('href', '/dashboard/company');
    expect(link('menuPainelControle')).toHaveAttribute(
      'href',
      '/control-panel',
    );
  });

  it('should give the manager the company dashboard but not the control panel', () => {
    renderizar(usuarioCom('gestor'));

    expect(link('menuPainel')).toHaveAttribute('href', '/dashboard/company');
    expect(
      screen.queryByRole('link', {
        name: i18n.t('formulario:menuPainelControle'),
      }),
    ).not.toBeInTheDocument();
  });

  it('should fall back to the respondent menu when there is no session', () => {
    renderizar(null);

    expect(link('menuPainel')).toHaveAttribute('href', '/dashboard');
    expect(
      screen.queryByRole('link', {
        name: i18n.t('formulario:menuPainelControle'),
      }),
    ).not.toBeInTheDocument();
  });

  it('should point the form and information items to their screens', () => {
    renderizar(usuarioCom('respondente'));

    expect(link('menuFormulario')).toHaveAttribute('href', '/questionnaire');
    expect(link('menuInformacoes')).toHaveAttribute('href', '/about');
  });

  it('should mark the item of the current route as the current page', () => {
    renderizar(usuarioCom('admin'), '/control-panel');

    expect(link('menuPainelControle')).toHaveAttribute('aria-current', 'page');
    expect(link('menuPainel')).not.toHaveAttribute('aria-current');
  });

  it('should log out and go to the welcome screen on "Sair"', async () => {
    const store = renderizar(usuarioCom('admin'));

    await userEvent.click(
      screen.getByRole('button', { name: i18n.t('formulario:menuSair') }),
    );

    expect(store.getState().authentication.user).toBeNull();
    expect(screen.getByText('tela de boas-vindas')).toBeInTheDocument();
  });

  it('should be a labelled navigation landmark', () => {
    renderizar(usuarioCom('respondente'));

    expect(
      screen.getByRole('navigation', {
        name: i18n.t('formulario:menuNavegacao'),
      }),
    ).toBeInTheDocument();
  });
  it('should show the item name as a hint when hovering it', async () => {
    renderizar(usuarioCom('respondente'));

    await userEvent.hover(link('menuFormulario'));

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      i18n.t('formulario:menuFormulario'),
    );
  });

  // Regressão: o TooltipTrigger (asChild) junta as classes como texto, e uma
  // className em função chegava ao DOM como string — o item perdia padding,
  // hover e o destaque da página atual.
  it('should keep the item styles inside the tooltip trigger', () => {
    renderizar(usuarioCom('admin'), '/control-panel');

    const atual = link('menuPainelControle');
    expect(atual).toHaveClass('p-2', 'aria-[current=page]:bg-primary');
    expect(atual.getAttribute('class')).not.toContain('=>');
  });

  it('should show the hint when the item gets keyboard focus', async () => {
    renderizar(usuarioCom('respondente'));

    await userEvent.tab();

    expect(link('menuPainel')).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      i18n.t('formulario:menuPainel'),
    );
  });
});
