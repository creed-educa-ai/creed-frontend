import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { CompanyTable, type Empresa } from './CompanyTable';

const empresasTeste: Empresa[] = [
  {
    id: '1',
    nomeEmpresa: 'Acme Inc.',
    email: 'contato@acme.com',
    status: 'pendente',
    documento: '345645678',
    nomeResponsavel: 'Ana Silva',
    telefone: '11987654321',
  },
  {
    id: '2',
    nomeEmpresa: 'Tech Solutions',
    email: 'contato@techsolutions.com',
    status: 'ativo',
    documento: '34567890',
    nomeResponsavel: 'Carlos Oliveira',
    telefone: '11987654321',
  },
  {
    id: '3',
    nomeEmpresa: 'Inova Tech',
    email: 'contato@inovatech.com',
    status: 'pendente',
    documento: '34567891',
    nomeResponsavel: 'Maria Santos',
    telefone: '11987654321',
  },
];

function renderTabela(empresas = empresasTeste) {
  const onVerResultados = vi.fn();
  const onExcluir = vi.fn();
  const onAceitar = vi.fn();
  const onRejeitar = vi.fn();

  render(
    <CompanyTable
      empresas={empresas}
      onVerResultados={onVerResultados}
      onExcluir={onExcluir}
      onAceitar={onAceitar}
      onRejeitar={onRejeitar}
    />,
  );

  return {
    onVerResultados,
    onExcluir,
    onAceitar,
    onRejeitar,
  };
}

describe('CompanyTable', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('renderiza as empresas, seus status e os controles da tabela', () => {
    renderTabela();

    expect(screen.getByText('Acme Inc.')).toBeInTheDocument();
    expect(screen.getByText('Tech Solutions')).toBeInTheDocument();
    expect(screen.getByText('Inova Tech')).toBeInTheDocument();

    expect(screen.getAllByText('Pendente')).toHaveLength(2);
    expect(screen.getByText('Ativo')).toBeInTheDocument();

    expect(
      screen.getByRole('textbox', { name: 'Pesquise' }),
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Colunas' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Aprovar' })).toBeInTheDocument();
  });

  it('filtra as empresas pelo campo de pesquisa', async () => {
    const user = userEvent.setup();
    renderTabela();

    await user.type(screen.getByRole('textbox', { name: 'Pesquise' }), 'Acme');

    expect(screen.getByText('Acme Inc.')).toBeInTheDocument();
    expect(screen.queryByText('Tech Solutions')).not.toBeInTheDocument();
    expect(screen.queryByText('Inova Tech')).not.toBeInTheDocument();
  });

  it('chama onVerResultados com o ID da empresa ativa', async () => {
    const user = userEvent.setup();
    const { onVerResultados } = renderTabela();

    const linha = screen.getByRole('row', {
      name: /Tech Solutions/,
    });

    await user.click(
      within(linha).getByRole('button', { name: 'Ver Resultados' }),
    );

    expect(onVerResultados).toHaveBeenCalledWith('2');
  });

  it('desabilita Ver Resultados para empresas pendentes', () => {
    renderTabela();

    const linha = screen.getByRole('row', {
      name: /Acme Inc\./,
    });

    expect(
      within(linha).getByRole('button', { name: 'Ver Resultados' }),
    ).toBeDisabled();
  });

  it('chama onExcluir com o ID da empresa selecionada', async () => {
    const user = userEvent.setup();
    const { onExcluir } = renderTabela();

    await user.click(screen.getByRole('button', { name: 'Excluir Acme Inc.' }));

    expect(onExcluir).toHaveBeenCalledWith('1');
  });

  it('abre o modal com os dados da empresa selecionada para aprovação', async () => {
    const user = userEvent.setup();
    const { onAceitar } = renderTabela();

    await user.click(
      screen.getByRole('checkbox', { name: 'Selecionar Acme Inc.' }),
    );

    await user.click(screen.getByRole('button', { name: 'Aprovar' }));

    const tituloModal = await screen.findByRole('heading', {
      name: 'Solicitação de cadastro',
    });

    expect(tituloModal).toBeInTheDocument();

    // Localiza o conteúdo do modal para evitar conflitos com a tabela.
    const modal = tituloModal.closest('[role="dialog"]');

    expect(modal).not.toBeNull();

    const conteudoModal = within(modal as HTMLElement);

    expect(conteudoModal.getByText('Acme Inc.')).toBeInTheDocument();
    expect(conteudoModal.getByText('Ana Silva')).toBeInTheDocument();
    expect(conteudoModal.getByText('contato@acme.com')).toBeInTheDocument();

    expect(
      conteudoModal.getByRole('button', { name: 'Aceitar' }),
    ).toBeInTheDocument();

    expect(onAceitar).not.toHaveBeenCalled();
  });

  it('chama onAceitar com a empresa quando a aprovação é confirmada', async () => {
    const user = userEvent.setup();
    const { onAceitar } = renderTabela();

    await user.click(
      screen.getByRole('checkbox', { name: 'Selecionar Acme Inc.' }),
    );

    await user.click(screen.getByRole('button', { name: 'Aprovar' }));

    await user.click(await screen.findByRole('button', { name: 'Aceitar' }));

    expect(onAceitar).toHaveBeenCalledWith(empresasTeste[0]);
  });

  it('chama onRejeitar com a empresa quando a rejeição é confirmada', async () => {
    const user = userEvent.setup();
    const { onRejeitar } = renderTabela();

    await user.click(
      screen.getByRole('checkbox', { name: 'Selecionar Acme Inc.' }),
    );

    await user.click(screen.getByRole('button', { name: 'Aprovar' }));

    await user.click(await screen.findByRole('button', { name: 'Rejeitar' }));

    expect(onRejeitar).toHaveBeenCalledWith(empresasTeste[0]);
  });
});
