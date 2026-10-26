import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { OrganizationsAdminView } from './OrganizationsAdminView';

describe('OrganizationsAdminView', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('renderiza o cabeçalho e a lista de empresas', () => {
    render(<OrganizationsAdminView />);

    expect(
      screen.getByRole('heading', { name: 'Painel de controle' }),
    ).toBeInTheDocument();

    expect(screen.getByText('Administradora')).toBeInTheDocument();

    expect(
      screen.getByText('Aqui está o panorama do CREED hoje.'),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: 'Empresas' }),
    ).toBeInTheDocument();

    expect(screen.getByText('Acme Inc.')).toBeInTheDocument();
    expect(screen.getByText('Tech Solutions')).toBeInTheDocument();
    expect(screen.getByText('Inova Tech')).toBeInTheDocument();
  });

  it('recolhe e expande a seção de empresas', async () => {
    const user = userEvent.setup();
    render(<OrganizationsAdminView />);

    const botaoEmpresas = screen.getByRole('button', {
      name: /Empresas/,
    });

    expect(botaoEmpresas).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Acme Inc.')).toBeInTheDocument();

    await user.click(botaoEmpresas);

    expect(botaoEmpresas).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Acme Inc.')).not.toBeInTheDocument();

    await user.click(botaoEmpresas);

    expect(botaoEmpresas).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Acme Inc.')).toBeInTheDocument();
  });

  it('altera o status da empresa para Ativo quando a aprovação é confirmada', async () => {
    const user = userEvent.setup();
    render(<OrganizationsAdminView />);

    await user.click(
      screen.getByRole('checkbox', { name: 'Selecionar Acme Inc.' }),
    );

    await user.click(screen.getByRole('button', { name: 'Aprovar' }));

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

    expect(
      within(linhaAcme).getByRole('button', {
        name: 'Ver Resultados',
      }),
    ).toBeEnabled();
  });

  it('remove a empresa da lista quando a solicitação é rejeitada', async () => {
    const user = userEvent.setup();
    render(<OrganizationsAdminView />);

    await user.click(
      screen.getByRole('checkbox', { name: 'Selecionar Acme Inc.' }),
    );

    await user.click(screen.getByRole('button', { name: 'Aprovar' }));

    expect(
      await screen.findByRole('heading', {
        name: 'Solicitação de cadastro',
      }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Rejeitar' }));

    expect(screen.queryByText('Acme Inc.')).not.toBeInTheDocument();
    expect(screen.getByText('Tech Solutions')).toBeInTheDocument();
    expect(screen.getByText('Inova Tech')).toBeInTheDocument();
  });

  it('remove a empresa da lista quando ela é excluída', async () => {
    const user = userEvent.setup();
    render(<OrganizationsAdminView />);

    await user.click(
      screen.getByRole('button', { name: 'Excluir Tech Solutions' }),
    );

    expect(screen.queryByText('Tech Solutions')).not.toBeInTheDocument();
    expect(screen.getByText('Acme Inc.')).toBeInTheDocument();
    expect(screen.getByText('Inova Tech')).toBeInTheDocument();
  });

  it('mantém as demais empresas quando uma delas é excluída', async () => {
    const user = userEvent.setup();
    render(<OrganizationsAdminView />);

    await user.click(screen.getByRole('button', { name: 'Excluir Acme Inc.' }));

    expect(screen.queryByText('Acme Inc.')).not.toBeInTheDocument();
    expect(screen.getByText('Tech Solutions')).toBeInTheDocument();
    expect(screen.getByText('Inova Tech')).toBeInTheDocument();
  });
});
