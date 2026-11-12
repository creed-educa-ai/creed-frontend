import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Toaster } from '@/components/ui/sonner';
import { MembersSection } from '@/features/users/MembersSection';
import usersReducer from '@/features/users/usersSlice';
import { usersApi } from '@/features/users/usersApi';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

// Tabela e cartões do celular estão os dois no DOM (o jsdom não aplica o
// `md:hidden`): as buscas olham a tabela.
function tabela() {
  return screen.getByRole('table', { hidden: true });
}

function renderizar() {
  const store = configureStore({
    reducer: {
      users: usersReducer,
    },
  });

  return render(
    <Provider store={store}>
      <MembersSection />
      <Toaster />
    </Provider>,
  );
}

describe('MembersSection', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
  beforeEach(async () => {
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
