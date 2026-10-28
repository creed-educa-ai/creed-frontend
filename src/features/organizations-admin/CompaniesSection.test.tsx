import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { CompaniesSection } from './CompaniesSection';

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
  beforeEach(async () => {
    window.localStorage.clear();
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('renderiza o título da seção e a lista de empresas', () => {
    render(<CompaniesSection />);

    expect(
      screen.getByRole('heading', { name: 'Empresas' }),
    ).toBeInTheDocument();

    expect(screen.getByText('Acme Inc.')).toBeInTheDocument();
    expect(screen.getByText('Tech Solutions')).toBeInTheDocument();
    expect(screen.getByText('Inova Tech')).toBeInTheDocument();
  });

  it('altera o status da empresa para Ativo quando a aprovação é confirmada', async () => {
    const user = userEvent.setup();
    render(<CompaniesSection />);

    await user.click(
      screen.getByRole('button', { name: 'Analisar o cadastro de Acme Inc.' }),
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

    expect(
      within(linhaAcme).getByRole('button', {
        name: 'Ver Resultados',
      }),
    ).toBeEnabled();
  });

  it('remove a empresa da lista quando a solicitação é rejeitada', async () => {
    const user = userEvent.setup();
    render(<CompaniesSection />);

    await user.click(
      screen.getByRole('button', { name: 'Analisar o cadastro de Acme Inc.' }),
    );

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
    render(<CompaniesSection />);

    await user.click(
      screen.getByRole('button', { name: 'Excluir Tech Solutions' }),
    );
    await confirmarExclusao(user);

    expect(screen.queryByText('Tech Solutions')).not.toBeInTheDocument();
    expect(screen.getByText('Acme Inc.')).toBeInTheDocument();
    expect(screen.getByText('Inova Tech')).toBeInTheDocument();
  });

  it('mantém as demais empresas quando uma delas é excluída', async () => {
    const user = userEvent.setup();
    render(<CompaniesSection />);

    await user.click(screen.getByRole('button', { name: 'Excluir Acme Inc.' }));
    await confirmarExclusao(user);

    expect(screen.queryByText('Acme Inc.')).not.toBeInTheDocument();
    expect(screen.getByText('Tech Solutions')).toBeInTheDocument();
    expect(screen.getByText('Inova Tech')).toBeInTheDocument();
  });
});
