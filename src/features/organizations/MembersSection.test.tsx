import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MembersSection } from '@/features/organizations/MembersSection';
import organizationsReducer from '@/features/organizations/organizationsSlice';
import respondentesReducer from '@/features/respondentes/respondentesSlice';
import {
  organizationsApi,
  resetMembersMock,
} from '@/features/organizations/organizationsApi';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

function renderizar() {
  const store = configureStore({
    reducer: {
      organizations: organizationsReducer,
      respondentes: respondentesReducer,
    },
  });

  return render(
    <Provider store={store}>
      <MembersSection />
    </Provider>,
  );
}

describe('MembersSection', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
  beforeEach(async () => {
    resetMembersMock();
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('lista os membros da empresa', async () => {
    renderizar();

    expect(await screen.findByText('Enner Valência')).toBeInTheDocument();
    expect(screen.getByText('Membros de Acme Inc.')).toBeInTheDocument();
    expect(screen.getAllByText('Ativo').length).toBeGreaterThan(0);
  });

  it('traduz falhas de carregamento sem exibir mensagens técnicas', async () => {
    vi.spyOn(organizationsApi, 'listMembers').mockRejectedValueOnce(
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
      screen.getByRole('heading', {
        name: 'Miembros de la empresa',
      }),
    ).toBeInTheDocument();
  });

  it('filtra a lista pelo e-mail', async () => {
    renderizar();
    await screen.findByText('Enner Valência');

    await userEvent.type(
      screen.getByLabelText('Insira um Email'),
      'felicia.reid',
    );

    expect(screen.getByText('Wilson Mathias')).toBeInTheDocument();
    expect(screen.queryByText('Enner Valência')).not.toBeInTheDocument();
  });

  it('avança a paginação', async () => {
    renderizar();
    await screen.findByText('Enner Valência');

    expect(screen.getByText('Enner Valência')).toBeInTheDocument();
    expect(screen.queryByText('Ana Souza')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Próximo' }));

    expect(screen.getByText('Ana Souza')).toBeInTheDocument();
    expect(screen.queryByText('Enner Valência')).not.toBeInTheDocument();
  });

  it('exclui um membro após confirmar', async () => {
    renderizar();
    await screen.findByText('Enner Valência');

    await userEvent.click(
      screen.getByRole('button', { name: 'Excluir Enner Valência' }),
    );

    const dialogo = screen.getByRole('alertdialog');
    expect(within(dialogo).getByText('Excluir membro')).toBeInTheDocument();

    await userEvent.click(
      within(dialogo).getByRole('button', { name: 'Excluir' }),
    );

    expect(screen.queryByText('Enner Valência')).not.toBeInTheDocument();
    expect(screen.getByText('Wilson Mathias')).toBeInTheDocument();
  });

  it('traduz a tabela, detalhes e confirmação de exclusão para espanhol', async () => {
    renderizar();
    await screen.findByText('Enner Valência');
    await act(async () => {
      await i18n.changeLanguage('es');
    });

    expect(screen.getByText('Miembros de Acme Inc.')).toBeInTheDocument();
    expect(
      screen.getByRole('searchbox', {
        name: 'Introduce un correo electrónico',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
    expect(screen.getAllByText('Activo').length).toBeGreaterThan(0);
    expect(screen.getByText('18/10/26')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Columnas' }));
    expect(
      within(screen.getByRole('menu')).getAllByRole('menuitemcheckbox'),
    ).toHaveLength(5);
    await userEvent.keyboard('{Escape}');
    const tabela = screen.getByRole('table', {
      name: 'Miembros de la empresa',
    });
    await userEvent.click(
      within(
        within(tabela).getByRole('row', { name: /Enner Valência/ }),
      ).getByRole('button', { name: 'Ver' }),
    );
    expect(
      screen.getByRole('dialog', { name: 'Datos del miembro' }),
    ).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await userEvent.click(
      screen.getByRole('button', { name: 'Eliminar Enner Valência' }),
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
    expect(screen.getByText('Ana Souza')).toBeInTheDocument();
  });
});
