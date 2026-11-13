import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Toaster } from '@/components/ui/sonner';
import { MembersSection } from '@/features/users/MembersSection';
import usersReducer from '@/features/users/usersSlice';
import { usersApi } from '@/features/users/usersApi';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import type { MemberList } from '@/types/api';

const membrosMockFixture: MemberList = {
  itens: [
    {
      id: '1',
      name: 'Enner Valência',
      email: 'michael.mitc@example.com',
      status: 'ativo',
      tag: 'Marketing',
      updated_at: '2026-10-18T14:12:00.000Z',
    },
    {
      id: '2',
      name: 'Wilson Mathias',
      email: 'felicia.reid@example.com',
      status: 'ativo',
      tag: 'Financeiro',
      updated_at: '2026-10-17T09:40:00.000Z',
    },
    {
      id: '3',
      name: 'Volante Ronaldo',
      email: 'georgia.young@example.com',
      status: 'pendente',
      tag: 'RecursosHumanos',
      updated_at: '2026-10-16T18:05:00.000Z',
    },
    {
      id: '4',
      name: 'Maurides Cambalhota',
      email: 'alma.lawson@example.com',
      status: 'ativo',
      tag: 'TecnologiaInformacao',
      updated_at: '2026-10-15T11:22:00.000Z',
    },
    {
      id: '5',
      name: 'Clayton Sampaio',
      email: 'dolores.chambers@example.com',
      status: 'pendente',
      tag: 'Administrativo',
      updated_at: '2026-10-14T08:01:00.000Z',
    },
    {
      id: '6',
      name: 'Ana Souza',
      email: 'ana.souza@example.com',
      status: 'ativo',
      tag: 'Marketing',
      updated_at: '2026-10-13T16:47:00.000Z',
    },
    {
      id: '7',
      name: 'Bruno Lima',
      email: 'bruno.lima@example.com',
      status: 'pendente',
      tag: null,
      updated_at: '2026-10-12T10:18:00.000Z',
    },
    {
      id: '8',
      name: 'Carla Dias',
      email: 'carla.dias@example.com',
      status: 'ativo',
      tag: null,
      updated_at: '2026-10-11T13:33:00.000Z',
    },
  ],
  total: 8,
  pagina: 1,
  tamanho_pagina: 5,
  organization: 'Acme Inc.',
};

// Tabela e cartões do celular estão os dois no DOM (o jsdom não aplica o
// `md:hidden`): as buscas olham a tabela.
function tabela() {
  return screen.getByRole('table', { hidden: true });
}

function renderizar(route = '/organizations/org-1/members') {
  const store = configureStore({
    reducer: {
      users: usersReducer,
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route
            path="/organizations/:id/members"
            element={<MembersSection />}
          />
        </Routes>
      </MemoryRouter>
      <Toaster />
    </Provider>,
  );
}

describe('MembersSection', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(async () => {
    vi.spyOn(usersApi, 'listMembers').mockResolvedValue(membrosMockFixture);
    vi.spyOn(usersApi, 'setMemberTag').mockResolvedValue(undefined);
    vi.spyOn(usersApi, 'removeMember').mockResolvedValue(undefined);
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('lista os membros da empresa', async () => {
    renderizar();

    expect(
      within(await screen.findByRole('table')).getByText('Enner Valência'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Membros' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Ativo').length).toBeGreaterThan(0);
  });

  it('traduz falhas de carregamento sem exibir mensagens técnicas', async () => {
    vi.spyOn(usersApi, 'listMembers').mockRejectedValueOnce(
      new Error('Internal server error'),
    );
    await i18n.changeLanguage('es');
    renderizar();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudieron cargar los miembros de la empresa.',
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Intenta recargar la página.',
    );
    expect(screen.queryByText(/Internal server error/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Cargando/)).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Miembros' }),
    ).toBeInTheDocument();
  });

  it('filtra a lista pelo e-mail', async () => {
    renderizar();
    await screen.findByRole('table');

    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Pesquisar membros por email' }),
      'felicia.reid',
    );

    expect(within(tabela()).getByText('Wilson Mathias')).toBeInTheDocument();
    expect(screen.queryByText('Enner Valência')).not.toBeInTheDocument();
  });

  it('avança a paginação', async () => {
    renderizar();
    await screen.findByRole('table');

    expect(within(tabela()).getByText('Enner Valência')).toBeInTheDocument();
    expect(screen.queryByText('Ana Souza')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Próximo' }));

    expect(within(tabela()).getByText('Ana Souza')).toBeInTheDocument();
    expect(screen.queryByText('Enner Valência')).not.toBeInTheDocument();
  });

  it('troca a tag de um membro', async () => {
    renderizar();
    await screen.findByRole('table');

    await userEvent.click(
      within(tabela()).getByRole('button', {
        name: 'Marketing: alterar a tag de Enner Valência',
      }),
    );
    await userEvent.click(screen.getByRole('menuitemradio', { name: 'TI' }));

    expect(
      await within(tabela()).findByRole('button', {
        name: 'TI: alterar a tag de Enner Valência',
      }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Tag atualizada')).toBeInTheDocument();
    expect(
      screen.getByText('Enner Valência agora está em TI.'),
    ).toBeInTheDocument();
  });

  it('avisa por toast quando a troca de tag falha', async () => {
    vi.spyOn(usersApi, 'setMemberTag').mockRejectedValueOnce(
      new Error('falhou'),
    );
    renderizar();
    await screen.findByRole('table');

    await userEvent.click(
      within(tabela()).getByRole('button', {
        name: 'Marketing: alterar a tag de Enner Valência',
      }),
    );
    await userEvent.click(screen.getByRole('menuitemradio', { name: 'TI' }));

    expect(
      await screen.findByText('Não foi possível alterar a tag'),
    ).toBeInTheDocument();
    expect(
      within(tabela()).getByRole('button', {
        name: 'Marketing: alterar a tag de Enner Valência',
      }),
    ).toBeInTheDocument();
  });

  it('exclui um membro após confirmar', async () => {
    renderizar();
    await screen.findByRole('table');

    await userEvent.click(
      within(tabela()).getByRole('button', {
        name: 'Excluir Enner Valência',
      }),
    );

    const dialogo = screen.getByRole('alertdialog');
    expect(within(dialogo).getByText('Excluir membro')).toBeInTheDocument();

    await userEvent.click(
      within(dialogo).getByRole('button', { name: 'Excluir' }),
    );

    expect(await screen.findByText('Membro excluído')).toBeInTheDocument();
    expect(
      screen.getByText('Enner Valência não tem mais acesso à plataforma.'),
    ).toBeInTheDocument();
    expect(within(tabela()).queryByText('Enner Valência')).toBeNull();
    expect(within(tabela()).getByText('Wilson Mathias')).toBeInTheDocument();
  });

  it('não confirma a exclusão quando ela falha', async () => {
    vi.spyOn(usersApi, 'removeMember').mockRejectedValueOnce(
      new Error('falhou'),
    );
    renderizar();
    await screen.findByRole('table');

    await userEvent.click(
      within(tabela()).getByRole('button', {
        name: 'Excluir Enner Valência',
      }),
    );
    const dialogo = screen.getByRole('alertdialog');
    await userEvent.click(
      within(dialogo).getByRole('button', { name: 'Excluir' }),
    );

    // Quem avisa da falha é o diálogo, que continua aberto; toast, nenhum.
    expect(await within(dialogo).findByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('Membro excluído')).toBeNull();
  });

  it('traduz a tabela e a confirmação de exclusão para espanhol', async () => {
    renderizar();
    await screen.findByRole('table');
    await act(async () => {
      await i18n.changeLanguage('es');
    });

    expect(
      screen.getByRole('heading', { level: 3, name: 'Miembros' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('searchbox', { name: 'Buscar miembros por correo' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
    expect(screen.getAllByText('Activo').length).toBeGreaterThan(0);
    expect(within(tabela()).getByText('18/10/26')).toBeInTheDocument();
    expect(
      screen.getByRole('table', { name: 'Miembros de la empresa' }),
    ).toBeInTheDocument();
    await userEvent.click(
      within(tabela()).getByRole('button', {
        name: 'Eliminar Enner Valência',
      }),
    );
    const dialogo = screen.getByRole('alertdialog');
    expect(within(dialogo).getByText('Eliminar miembro')).toBeInTheDocument();
    expect(
      within(dialogo).getByText(
        '¿Quieres eliminar a Enner Valência de la lista de miembros de la empresa? Esta acción no se puede deshacer.',
      ),
    ).toBeInTheDocument();
    await userEvent.click(
      within(dialogo).getByRole('button', { name: 'Cancelar' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(screen.getByText('Página 2 de 2')).toBeInTheDocument();
    expect(within(tabela()).getByText('Ana Souza')).toBeInTheDocument();
  });
});
