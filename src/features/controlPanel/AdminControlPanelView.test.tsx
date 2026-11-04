import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authenticationReducer from '@/features/authentication/authenticationSlice';
import { resetCompaniesMock } from '@/features/organizations/organizationsApi';
import organizationsReducer from '@/features/organizations/organizationsSlice';
import { resetMenteesMock } from '@/features/users/usersApi';
import usersReducer from '@/features/users/usersSlice';
import { AdminControlPanelView } from './AdminControlPanelView';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

// O menu do topo lê o papel na sessão e marca o item da rota atual.
function renderizar() {
  const store = configureStore({
    reducer: {
      authentication: authenticationReducer,
      organizations: organizationsReducer,
      users: usersReducer,
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

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/control-panel/admin']}>
        <AdminControlPanelView />
      </MemoryRouter>
    </Provider>,
  );
}

describe('AdminControlPanelView', () => {
  beforeEach(async () => {
    resetCompaniesMock();
    resetMenteesMock();
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render the admin header, the section titles and the card titles', () => {
    renderizar();

    expect(
      screen.getByText(i18n.t('painelControle:administradora')),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: i18n.t('painelControle:titulo'),
      }),
    ).toBeInTheDocument();
    for (const titulo of [
      i18n.t('painelControle:controles'),
      i18n.t('painelControle:membros'),
    ]) {
      expect(
        screen.getByRole('heading', { level: 2, name: titulo }),
      ).toBeInTheDocument();
    }
    // "Adicionar mentorando" é o card de "Controles"; Empresas e Mentorandos,
    // os cards de "Membros".
    for (const titulo of [
      i18n.t('adicionarMentorando:titulo'),
      i18n.t('empresas:titulo'),
      i18n.t('mentees:title'),
    ]) {
      expect(
        screen.getByRole('heading', { level: 3, name: titulo }),
      ).toBeInTheDocument();
    }
  });

  it('should list the companies and the mentees', async () => {
    renderizar();

    expect(
      (await screen.findAllByText('Tech Solutions')).length,
    ).toBeGreaterThan(0);
    expect(
      (await screen.findAllByText('Wilson Mathias')).length,
    ).toBeGreaterThan(0);
  });

  it('should highlight the control panel in the menu', () => {
    renderizar();

    expect(
      screen.getByRole('link', {
        name: i18n.t('formulario:menuPainelControle'),
      }),
    ).toHaveAttribute('aria-current', 'page');
  });

  it('should hand the typed name and email to the placeholder handler', async () => {
    const consoleSpy = vi
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);
    const user = userEvent.setup();
    renderizar();

    // Sem seletor de função: o mentorando entra como respondente.
    expect(
      screen.queryByRole('combobox', {
        name: i18n.t('organizations:addMember.role.label'),
      }),
    ).not.toBeInTheDocument();
    await user.type(
      screen.getByRole('textbox', {
        name: i18n.t('organizations:addMember.name.label'),
      }),
      'Ana Souza',
    );
    await user.type(
      screen.getByRole('textbox', {
        name: i18n.t('organizations:addMember.email.label'),
      }),
      'ana@exemplo.com',
    );
    await user.click(
      screen.getByRole('button', {
        name: i18n.t('organizations:addMember.submit'),
      }),
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Mentorando adicionado:', {
        name: 'Ana Souza',
        email: 'ana@exemplo.com',
        role: 'respondente',
      });
    });
  });
});
