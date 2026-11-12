import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authenticationReducer from '@/features/authentication/authenticationSlice';
import { linksApi } from '@/features/links/linksApi';
import formsReducer from '@/features/forms/formsSlice';
import organizationsReducer from '@/features/organizations/organizationsSlice';
import { usersApi } from '@/features/users/usersApi';
import usersReducer from '@/features/users/usersSlice';
import { ApiError } from '@/lib/apiClient';
import { Toaster } from '@/components/ui/sonner';
import { stubFetch } from '@/test/stubFetch';
import type {
  MemberListItem,
  OrganizationResponse,
  UserResponse,
} from '@/types/api';
import { AdminControlPanelView } from './AdminControlPanelView';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

const TECH_SOLUTIONS: OrganizationResponse = {
  id: 'org-tech',
  name: 'Tech Solutions',
  address: '[A informar]',
  document_id: 'doc-tech',
  status: 'active',
  email: 'contato@techsolutions.com',
  contact_name: 'Carlos Oliveira',
  phone: '11987654321',
  document: { type: 'cnpj', value: '12345678000190' },
  created_at: '2026-11-10T12:00:00Z',
  updated_at: null,
};

// A organização da sessão: a da CREED, onde estão os mentorandos (P-048).
const CREED_ID = 'org-creed';

// Dado sintético, no formato do `GET /organizations/{id}/members` (M-2).
const WILSON: MemberListItem = {
  link_id: 'link-wilson',
  name: 'Wilson Mathias',
  email: 'wilson@example.com',
  role: 'respondente',
  type: 'mentoria',
  department: null,
  updated_at: null,
  period: null,
};

// O que o back devolve no 201 do convite (sintético).
const CONVIDADA: UserResponse = {
  id: '6a1d2c3b-4e5f-4a6b-8c7d-9e0f1a2b3c4d',
  name: 'Ana Souza',
  email: 'ana@example.com',
  status: 'active',
  role: 'respondente',
  link_id: '7b2e3d4c-5f6a-4b7c-9d8e-0f1a2b3c4d5e',
  organization_id: '8f14e45f-ceea-467e-adde-3f81905dbc1c',
  created_at: '2026-11-12T12:00:00Z',
};

// O menu do topo lê o papel na sessão e marca o item da rota atual.
function renderizar() {
  const store = configureStore({
    reducer: {
      authentication: authenticationReducer,
      forms: formsReducer,
      organizations: organizationsReducer,
      users: usersReducer,
    },
    preloadedState: {
      authentication: {
        user: {
          id: 'usuario-1',
          email: 'dev@creed.example.com',
          role: 'admin',
          link_id: 'link-admin',
          organization_id: CREED_ID,
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
      <Toaster />
    </Provider>,
  );
}

describe('AdminControlPanelView', () => {
  beforeEach(async () => {
    // A seção de empresas lê o back: uma organização basta para a lista.
    stubFetch(200, {
      itens: [TECH_SOLUTIONS],
      total: 1,
      pagina: 1,
      tamanho_pagina: 200,
    });
    // Os mentorandos vêm do linksApi; o fetch acima fica para as empresas.
    vi.spyOn(linksApi, 'listMembers').mockResolvedValue([WILSON]);
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
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

  async function adicionar(user: ReturnType<typeof userEvent.setup>) {
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
  }

  it('should invite the mentee and reload the table after the 201', async () => {
    const inviteMember = vi
      .spyOn(usersApi, 'inviteMember')
      .mockResolvedValue(CONVIDADA);
    const user = userEvent.setup();
    renderizar();
    await screen.findAllByText('Wilson Mathias');

    // Sem seletor de função: o mentorando entra como respondente.
    expect(
      screen.queryByRole('combobox', {
        name: i18n.t('organizations:addMember.role.label'),
      }),
    ).not.toBeInTheDocument();
    await adicionar(user);

    expect(await screen.findByText('Convite enviado')).toBeInTheDocument();
    expect(
      screen.getByText('ana@exemplo.com vai receber o convite por e-mail.'),
    ).toBeInTheDocument();
    expect(inviteMember).toHaveBeenCalledWith(CREED_ID, {
      name: 'Ana Souza',
      email: 'ana@exemplo.com',
      role: 'respondente',
      type: 'mentoria',
    });
    // Uma carga ao abrir o painel e outra depois do convite.
    await waitFor(() => {
      expect(linksApi.listMembers).toHaveBeenCalledTimes(2);
    });
  });

  it('should show the 409 on the email field, with no toast', async () => {
    vi.spyOn(usersApi, 'inviteMember').mockRejectedValue(
      new ApiError('Já existe usuário com o e-mail ana@exemplo.com', 409),
    );
    const user = userEvent.setup();
    renderizar();

    await adicionar(user);

    expect(
      await screen.findByText(i18n.t('organizations:errors.emailTaken')),
    ).toBeInTheDocument();
    expect(screen.queryByText('Convite enviado')).not.toBeInTheDocument();
    expect(
      screen.getByRole('textbox', {
        name: i18n.t('organizations:addMember.email.label'),
      }),
    ).toHaveValue('ana@exemplo.com');
  });
});
