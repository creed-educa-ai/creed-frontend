import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authenticationReducer from '@/features/authentication/authenticationSlice';
import { PainelControleSuperView } from './PainelControleSuperView';
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
      <MemoryRouter initialEntries={['/control-panel/admin']}>
        <PainelControleSuperView />
      </MemoryRouter>
    </Provider>,
  );
}

describe('PainelControleSuperView', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render the admin header and the three section titles', () => {
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
      i18n.t('adicionarMentorando:titulo'),
      i18n.t('empresas:titulo'),
      i18n.t('mentees:title'),
    ]) {
      expect(
        screen.getByRole('heading', { level: 2, name: titulo }),
      ).toBeInTheDocument();
    }
  });

  it('should list the companies and the mentees', () => {
    renderizar();

    expect(screen.getByText('Tech Solutions')).toBeInTheDocument();
    expect(screen.getAllByText('Wilson Mathias').length).toBeGreaterThan(0);
  });

  it('should highlight the control panel in the menu', () => {
    renderizar();

    expect(
      screen.getByRole('link', {
        name: i18n.t('formulario:menuPainelControle'),
      }),
    ).toHaveAttribute('aria-current', 'page');
  });

  it('should hand the typed email to the placeholder handler', async () => {
    const consoleSpy = vi
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);
    const user = userEvent.setup();
    renderizar();

    await user.type(
      screen.getByRole('textbox', {
        name: i18n.t('adicionarMentorando:email.label'),
      }),
      'ana@exemplo.com',
    );
    await user.click(
      screen.getByRole('button', {
        name: i18n.t('adicionarMentorando:adicionar'),
      }),
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Mentorando adicionado:', {
        email: 'ana@exemplo.com',
      });
    });
  });
});
