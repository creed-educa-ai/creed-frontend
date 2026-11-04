import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import type { Company } from '@/types/api';
import { CompanyTable } from './CompanyTable';

const empresasTeste: Company[] = [
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

    const tabela = screen.getByRole('table');
    expect(within(tabela).getByText('Acme Inc.')).toBeInTheDocument();
    expect(within(tabela).getByText('Tech Solutions')).toBeInTheDocument();
    expect(within(tabela).getByText('Inova Tech')).toBeInTheDocument();

    expect(within(tabela).getAllByText('Pendente')).toHaveLength(2);
    expect(within(tabela).getByText('Ativo')).toBeInTheDocument();

    expect(
      screen.getByRole('searchbox', { name: 'Pesquisar empresas por nome' }),
    ).toBeInTheDocument();

    // A aprovação é pelo botão "Pendente": a tabela não tem caixas de seleção.
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });

  it('filtra as empresas pelo campo de pesquisa', async () => {
    const user = userEvent.setup();
    renderTabela();

    await user.type(
      screen.getByRole('searchbox', { name: 'Pesquisar empresas por nome' }),
      'Acme',
    );

    expect(
      within(screen.getByRole('table')).getByText('Acme Inc.'),
    ).toBeInTheDocument();
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

    await user.click(
      within(screen.getByRole('table')).getByRole('button', {
        name: 'Excluir Acme Inc.',
      }),
    );
    // Só exclui depois de confirmar, como nas outras tabelas.
    expect(onExcluir).not.toHaveBeenCalled();
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Excluir',
      }),
    );

    expect(onExcluir).toHaveBeenCalledWith('1');
  });

  it('abre o modal de aceite ao clicar no botão Pendente', async () => {
    const user = userEvent.setup();
    const { onAceitar } = renderTabela();

    await user.click(
      within(screen.getByRole('table')).getByRole('button', {
        name: 'Pendente: analisar o cadastro de Acme Inc.',
      }),
    );

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

  it('só as pendentes têm o botão de aceite; as ativas têm o selo', () => {
    renderTabela();

    expect(
      within(screen.getByRole('table')).getByRole('button', {
        name: 'Pendente: analisar o cadastro de Inova Tech',
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: 'Pendente: analisar o cadastro de Tech Solutions',
      }),
    ).not.toBeInTheDocument();
    const linhaTech = screen.getByRole('row', { name: /Tech Solutions/ });
    expect(within(linhaTech).getByText('Ativo').tagName).toBe('SPAN');
  });

  it('filtra pelo email, separado do nome', async () => {
    const user = userEvent.setup();
    renderTabela();
    const tabela = screen.getByRole('table');

    expect(
      screen.getByRole('searchbox', { name: 'Pesquisar empresas por email' }),
    ).toBeInTheDocument();

    await user.type(
      screen.getByRole('searchbox', { name: 'Pesquisar empresas por email' }),
      'techsolutions',
    );
    expect(within(tabela).getByText('Tech Solutions')).toBeInTheDocument();
    expect(within(tabela).queryByText('Acme Inc.')).not.toBeInTheDocument();

    // O nome não é procurado no campo de email.
    await user.clear(
      screen.getByRole('searchbox', { name: 'Pesquisar empresas por email' }),
    );
    await user.type(
      screen.getByRole('searchbox', { name: 'Pesquisar empresas por email' }),
      'Inova Tech',
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Nenhuma empresa encontrada.',
    );
  });

  it('ordena pelo status: pendentes no crescente, ativas no decrescente', async () => {
    const user = userEvent.setup();
    renderTabela();
    const nomes = () =>
      within(screen.getByRole('table'))
        .getAllByRole('row')
        .slice(1)
        .map((linha) => linha.querySelector('td')?.textContent);

    const ordenar = screen.getByRole('button', { name: 'Ordenar por status' });
    await user.click(ordenar);
    expect(nomes()).toEqual(['Acme Inc.', 'Inova Tech', 'Tech Solutions']);
    await user.click(ordenar);
    expect(nomes()).toEqual(['Tech Solutions', 'Acme Inc.', 'Inova Tech']);
  });

  it('mostra cada empresa também como cartão, para o celular', async () => {
    const user = userEvent.setup();
    const { onVerResultados } = renderTabela();

    const [cartaoAcme, , cartaoTech] = within(
      screen.getByRole('list'),
    ).getAllByRole('listitem');
    if (!cartaoAcme || !cartaoTech) throw new Error('faltam cartões');

    // Mesma ordem da tabela: pendentes no topo.
    expect(within(cartaoTech).getByText('Tech Solutions')).toBeInTheDocument();
    expect(
      within(cartaoTech).getByText('contato@techsolutions.com'),
    ).toBeInTheDocument();

    await user.click(
      within(cartaoTech).getByRole('button', { name: 'Ver Resultados' }),
    );
    expect(onVerResultados).toHaveBeenCalledWith('2');

    expect(
      within(cartaoAcme).getByRole('button', {
        name: 'Pendente: analisar o cadastro de Acme Inc.',
      }),
    ).toBeInTheDocument();
  });

  it('mostra o aviso de vazio quando nenhuma empresa bate com a pesquisa', async () => {
    const user = userEvent.setup();
    renderTabela();

    await user.type(
      screen.getByRole('searchbox', { name: 'Pesquisar empresas por nome' }),
      'nada disso',
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'Nenhuma empresa encontrada.',
    );
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('mostra as pendentes primeiro', () => {
    renderTabela();

    const nomes = within(screen.getByRole('table'))
      .getAllByRole('row')
      .slice(1)
      .map((linha) => linha.querySelector('td')?.textContent);
    expect(nomes).toEqual(['Acme Inc.', 'Inova Tech', 'Tech Solutions']);
  });

  it('ordena por nome sem tirar as pendentes do topo', async () => {
    const user = userEvent.setup();
    renderTabela();

    const ordenar = screen.getByRole('button', { name: 'Ordenar por nome' });
    await user.click(ordenar);
    await user.click(ordenar);

    const nomes = within(screen.getByRole('table'))
      .getAllByRole('row')
      .slice(1)
      .map((linha) => linha.querySelector('td')?.textContent);
    expect(nomes).toEqual(['Inova Tech', 'Acme Inc.', 'Tech Solutions']);
  });

  it('chama onAceitar com a empresa quando a aprovação é confirmada', async () => {
    const user = userEvent.setup();
    const { onAceitar } = renderTabela();

    await user.click(
      within(screen.getByRole('table')).getByRole('button', {
        name: 'Pendente: analisar o cadastro de Acme Inc.',
      }),
    );

    await user.click(await screen.findByRole('button', { name: 'Aceitar' }));

    expect(onAceitar).toHaveBeenCalledWith(empresasTeste[0]);
  });

  it('chama onRejeitar com a empresa quando a rejeição é confirmada', async () => {
    const user = userEvent.setup();
    const { onRejeitar } = renderTabela();

    await user.click(
      within(screen.getByRole('table')).getByRole('button', {
        name: 'Pendente: analisar o cadastro de Acme Inc.',
      }),
    );

    await user.click(await screen.findByRole('button', { name: 'Rejeitar' }));
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Rejeitar',
      }),
    );

    expect(onRejeitar).toHaveBeenCalledWith(empresasTeste[0]);
  });
});
