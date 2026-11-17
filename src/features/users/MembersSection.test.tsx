import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Toaster } from '@/components/ui/sonner';
import authenticationReducer from '@/features/authentication/authenticationSlice';
import { linksApi } from '@/features/links/linksApi';
import { organizationsApi } from '@/features/organizations/organizationsApi';
import { MembersSection } from '@/features/users/MembersSection';
import usersReducer from '@/features/users/usersSlice';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import type {
  DepartmentType,
  MemberListItem,
  OrganizationResponse,
} from '@/types/api';

// Os membros como o `GET /organizations/{id}/members` devolve. Quem
// respondeu o período aparece como "Respondeu"; quem não, "Pendente".
function membro(
  id: string,
  name: string,
  email: string,
  department: DepartmentType | null,
  updated_at: string,
  has_answered: boolean,
): MemberListItem {
  return {
    link_id: id,
    name,
    email,
    role: 'respondente',
    type: 'emprego',
    department,
    updated_at,
    period: {
      form_id: 'form-1',
      opens_at: '2026-11-01T12:00:00Z',
      closes_at: '2026-12-01T12:00:00Z',
      period_status: 'open',
      has_answered,
    },
  };
}

const ORGANIZATION_ID = 'org-1';

const membrosDoBack: MemberListItem[] = [
  membro(
    '1',
    'Enner Valência',
    'michael.mitc@example.com',
    'Marketing',
    '2026-10-18T14:12:00.000Z',
    true,
  ),
  membro(
    '2',
    'Wilson Mathias',
    'felicia.reid@example.com',
    'Financeiro',
    '2026-10-17T09:40:00.000Z',
    true,
  ),
  membro(
    '3',
    'Volante Ronaldo',
    'georgia.young@example.com',
    'RecursosHumanos',
    '2026-10-16T18:05:00.000Z',
    false,
  ),
  membro(
    '4',
    'Maurides Cambalhota',
    'alma.lawson@example.com',
    'TecnologiaInformacao',
    '2026-10-15T11:22:00.000Z',
    true,
  ),
  membro(
    '5',
    'Clayton Sampaio',
    'dolores.chambers@example.com',
    'Administrativo',
    '2026-10-14T08:01:00.000Z',
    false,
  ),
  membro(
    '6',
    'Ana Souza',
    'ana.souza@example.com',
    'Marketing',
    '2026-10-13T16:47:00.000Z',
    true,
  ),
  membro(
    '7',
    'Bruno Lima',
    'bruno.lima@example.com',
    null,
    '2026-10-12T10:18:00.000Z',
    false,
  ),
  membro(
    '8',
    'Carla Dias',
    'carla.dias@example.com',
    null,
    '2026-10-11T13:33:00.000Z',
    true,
  ),
];

const ACME = { id: ORGANIZATION_ID, name: 'Acme Inc.' } as OrganizationResponse;

// Tabela e cartões do celular estão os dois no DOM (o jsdom não aplica o
// `md:hidden`): as buscas olham a tabela.
function tabela() {
  return screen.getByRole('table', { hidden: true });
}

// A seção lê a organização na sessão de quem está logado (o gestor).
function renderizar() {
  const store = configureStore({
    reducer: {
      authentication: authenticationReducer,
      users: usersReducer,
    },
    preloadedState: {
      authentication: {
        user: {
          id: 'usuario-1',
          email: 'gestora@example.com',
          role: 'gestor',
          link_id: null,
          organization_id: ORGANIZATION_ID,
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
      <MemoryRouter>
        <MembersSection />
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
    vi.spyOn(linksApi, 'listMembers').mockResolvedValue(membrosDoBack);
    vi.spyOn(organizationsApi, 'getOrganization').mockResolvedValue(ACME);
    vi.spyOn(linksApi, 'updateMemberDepartment').mockResolvedValue(
      membrosDoBack[0]!,
    );
    vi.spyOn(linksApi, 'deleteMember').mockResolvedValue(undefined);
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
    expect(screen.getAllByText('Respondeu').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pendente').length).toBeGreaterThan(0);
  });

  it('traduz falhas de carregamento sem exibir mensagens técnicas', async () => {
    vi.spyOn(linksApi, 'listMembers').mockRejectedValueOnce(
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
    vi.spyOn(linksApi, 'updateMemberDepartment').mockRejectedValueOnce(
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
    vi.spyOn(linksApi, 'deleteMember').mockRejectedValueOnce(
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
    expect(screen.getAllByText('Respondió').length).toBeGreaterThan(0);
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
