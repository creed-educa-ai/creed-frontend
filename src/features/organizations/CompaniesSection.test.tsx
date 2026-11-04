import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import {
  organizationsApi,
  resetCompaniesMock,
} from '@/features/organizations/organizationsApi';
import organizationsReducer from '@/features/organizations/organizationsSlice';
import { CompaniesSection } from './CompaniesSection';

// Renderiza e espera a lista do mock chegar: a seção carrega pelo slice.
async function renderizar() {
  const store = configureStore({
    reducer: { organizations: organizationsReducer },
  });
  render(
    <Provider store={store}>
      <CompaniesSection />
    </Provider>,
  );
  await screen.findByRole('table');
}

async function confirmarExclusao(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    within(screen.getByRole('alertdialog')).getByRole('button', {
      name: 'Excluir',
    }),
  );
  await waitFor(() => {
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
}

describe('CompaniesSection', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(async () => {
    resetCompaniesMock();
    window.localStorage.clear();
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('renderiza o título da seção e a lista de empresas', async () => {
    await renderizar();

    expect(
      screen.getByRole('heading', { name: 'Empresas' }),
    ).toBeInTheDocument();

    expect(
      within(screen.getByRole('table')).getByText('Acme Inc.'),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('table')).getByText('Tech Solutions'),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('table')).getByText('Inova Tech'),
    ).toBeInTheDocument();
  });

  it('altera o status da empresa para Ativo quando a aprovação é confirmada', async () => {
    const user = userEvent.setup();
    await renderizar();

    await user.click(
      within(screen.getByRole('table')).getByRole('button', {
        name: 'Pendente: analisar o cadastro de Acme Inc.',
      }),
    );

    expect(
      await screen.findByRole('heading', {
        name: 'Solicitação de cadastro',
      }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Aceitar' }));

    const linhaAcme = screen.getByRole('row', {
      name: /Acme Inc\./,
    });

    expect(within(linhaAcme).getByText('Ativo')).toBeInTheDocument();
    // Aceita, vira o selo "Ativo": o botão de análise some.
    expect(
      within(linhaAcme).queryByRole('button', {
        name: 'Pendente: analisar o cadastro de Acme Inc.',
      }),
    ).not.toBeInTheDocument();

    expect(
      within(linhaAcme).getByRole('button', {
        name: 'Ver Resultados',
      }),
    ).toBeEnabled();
  });

  it('remove a empresa da lista quando a solicitação é rejeitada', async () => {
    const user = userEvent.setup();
    await renderizar();

    await user.click(
      within(screen.getByRole('table')).getByRole('button', {
        name: 'Pendente: analisar o cadastro de Acme Inc.',
      }),
    );

    expect(
      await screen.findByRole('heading', {
        name: 'Solicitação de cadastro',
      }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Rejeitar' }));

    expect(screen.queryByText('Acme Inc.')).not.toBeInTheDocument();
    expect(
      within(screen.getByRole('table')).getByText('Tech Solutions'),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('table')).getByText('Inova Tech'),
    ).toBeInTheDocument();
  });

  it('remove a empresa da lista quando ela é excluída', async () => {
    const user = userEvent.setup();
    await renderizar();

    await user.click(
      within(screen.getByRole('table')).getByRole('button', {
        name: 'Excluir Tech Solutions',
      }),
    );
    await confirmarExclusao(user);

    expect(screen.queryByText('Tech Solutions')).not.toBeInTheDocument();
    expect(
      within(screen.getByRole('table')).getByText('Acme Inc.'),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('table')).getByText('Inova Tech'),
    ).toBeInTheDocument();
  });

  it('mantém as demais empresas quando uma delas é excluída', async () => {
    const user = userEvent.setup();
    await renderizar();

    await user.click(
      within(screen.getByRole('table')).getByRole('button', {
        name: 'Excluir Acme Inc.',
      }),
    );
    await confirmarExclusao(user);

    expect(screen.queryByText('Acme Inc.')).not.toBeInTheDocument();
    expect(
      within(screen.getByRole('table')).getByText('Tech Solutions'),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('table')).getByText('Inova Tech'),
    ).toBeInTheDocument();
  });

  it('mostra o erro traduzido quando a lista não carrega', async () => {
    vi.spyOn(organizationsApi, 'listCompanies').mockRejectedValue(
      new Error('Falha técnica'),
    );
    const store = configureStore({
      reducer: { organizations: organizationsReducer },
    });
    render(
      <Provider store={store}>
        <CompaniesSection />
      </Provider>,
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar as empresas.',
    );
  });
});
