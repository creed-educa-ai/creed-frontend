import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MembersTable } from '@/features/organizations/MembersTable';
import {
  organizationsApi,
  resetMembersMock,
} from '@/features/organizations/organizationsApi';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import type { Member } from '@/types/api';

let itens: Member[];

function linhas() {
  return within(screen.getByRole('table')).getAllByRole('row').slice(1);
}

describe('MembersTable', () => {
  beforeEach(async () => {
    resetMembersMock();
    itens = (await organizationsApi.listMembers()).itens;
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('exibe cinco membros por página e permite voltar', async () => {
    render(<MembersTable members={itens} onDelete={vi.fn()} />);

    expect(linhas()).toHaveLength(5);
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Próximo' }));
    expect(linhas()).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Próximo' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Anterior' }));
    expect(screen.getByText('Enner Valência')).toBeInTheDocument();
  });

  it('reinicia a página ao filtrar e ignora espaços e caixa no e-mail', async () => {
    render(<MembersTable members={itens} onDelete={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Próximo' }));
    await userEvent.type(screen.getByRole('searchbox'), ' FELICIA.REID ');

    expect(linhas()).toHaveLength(1);
    expect(screen.getByText('Wilson Mathias')).toBeInTheDocument();
    expect(screen.getByText('Página 1 de 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Próximo' })).toBeDisabled();
  });

  it('distingue uma lista vazia de uma busca sem resultados', async () => {
    const { rerender } = render(
      <MembersTable members={[]} onDelete={vi.fn()} />,
    );
    expect(
      screen.getByText('Nenhum membro associado à empresa.'),
    ).toBeInTheDocument();
    rerender(<MembersTable members={itens} onDelete={vi.fn()} />);
    await userEvent.type(screen.getByRole('searchbox'), 'inexistente');
    expect(
      screen.getByText('Nenhum membro encontrado para este e-mail.'),
    ).toBeInTheDocument();
  });

  it('ordena nomes nos dois sentidos e restaura a ordem original', async () => {
    render(<MembersTable members={itens} onDelete={vi.fn()} />);
    const ordenar = screen.getByRole('button', { name: 'Ordenar por nome' });
    await userEvent.click(ordenar);
    expect(linhas()[0]).toHaveTextContent('Ana Souza');
    expect(ordenar.closest('th')).toHaveAttribute('aria-sort', 'ascending');
    await userEvent.click(ordenar);
    expect(linhas()[0]).toHaveTextContent('Wilson Mathias');
    expect(ordenar.closest('th')).toHaveAttribute('aria-sort', 'descending');
    await userEvent.click(ordenar);
    expect(linhas()[0]).toHaveTextContent('Enner Valência');
    expect(ordenar.closest('th')).toHaveAttribute('aria-sort', 'none');
  });

  it('ordena datas e as formata no idioma selecionado', async () => {
    render(<MembersTable members={itens} onDelete={vi.fn()} />);
    expect(screen.getByText('18/10/2026')).toBeInTheDocument();
    const ordenar = screen.getByRole('button', {
      name: 'Ordenar por data recente',
    });
    await userEvent.click(ordenar);
    expect(linhas()[0]).toHaveTextContent('Carla Dias');
    await userEvent.click(ordenar);
    expect(linhas()[0]).toHaveTextContent('Enner Valência');
    expect(ordenar.closest('th')).toHaveAttribute('aria-sort', 'descending');
    await act(() => i18n.changeLanguage('en'));
    expect(screen.getByText('10/18/26')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
  });

  it('não mostra caixas de seleção nem o texto de seleção por padrão', () => {
    render(<MembersTable members={itens} onDelete={vi.fn()} />);
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    expect(screen.queryByText(/selecionada\(s\)/)).not.toBeInTheDocument();
  });

  it('seleciona apenas a página atual e mantém a seleção ao navegar', async () => {
    render(<MembersTable members={itens} onDelete={vi.fn()} selectable />);
    const selecionar = () =>
      screen.getByRole('checkbox', {
        name: 'Selecionar todos os membros desta página',
      });

    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Enner Valência' }),
    );
    expect(selecionar()).toBePartiallyChecked();
    await userEvent.click(selecionar());
    expect(
      screen.getByText('5 de 5 linha(s) selecionada(s).'),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Próximo' }));
    expect(
      screen.getByText('0 de 3 linha(s) selecionada(s).'),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Anterior' }));
    expect(selecionar()).toBeChecked();
    await userEvent.click(selecionar());
    expect(
      screen.getByText('0 de 5 linha(s) selecionada(s).'),
    ).toBeInTheDocument();
  });

  it('ordena datas pelo instante mesmo com fusos diferentes', async () => {
    const comFusos = itens.slice(0, 2).map((membro, indice) => ({
      ...membro,
      updated_at:
        indice === 0 ? '2026-10-18T10:00:00-03:00' : '2026-10-18T12:00:00Z',
    }));
    render(<MembersTable members={comFusos} onDelete={vi.fn()} />);
    const ordenar = screen.getByRole('button', {
      name: 'Ordenar por data recente',
    });
    await userEvent.click(ordenar);
    expect(linhas()[0]).toHaveTextContent('Wilson Mathias');
    await userEvent.click(ordenar);
    expect(linhas()[0]).toHaveTextContent('Enner Valência');
  });

  it('permite ocultar todas as colunas opcionais e fechar o seletor com Escape', async () => {
    render(<MembersTable members={itens} onDelete={vi.fn()} />);
    const botao = screen.getByRole('button', { name: 'Colunas' });
    await userEvent.click(botao);
    const seletor = screen.getByRole('menu');
    for (const opcao of within(seletor).getAllByRole('menuitemcheckbox')) {
      await userEvent.click(opcao);
    }
    // O menu é modal: com ele aberto, a tabela fica fora da árvore acessível.
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(
      within(screen.getByRole('table')).getAllByRole('columnheader'),
    ).toHaveLength(2);
    expect(botao).toHaveFocus();
  });

  it('abre detalhes de membros pendentes e cancela a exclusão sem removê-los', async () => {
    const onExcluir = vi.fn();
    render(<MembersTable members={itens} onDelete={onExcluir} />);
    const linha = screen.getByText('Volante Ronaldo').closest('tr')!;
    await userEvent.click(within(linha).getByRole('button', { name: 'Ver' }));
    const detalhes = screen.getByRole('dialog');
    expect(
      within(detalhes).getByText('georgia.young@example.com'),
    ).toBeInTheDocument();
    expect(within(detalhes).getByText('Pendente')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await userEvent.click(
      screen.getByRole('button', { name: 'Excluir Volante Ronaldo' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(onExcluir).not.toHaveBeenCalled();
    expect(screen.getByText('Volante Ronaldo')).toBeInTheDocument();
  });

  it('mostra falhas de exclusão no diálogo e permite tentar novamente', async () => {
    const onExcluir = vi
      .fn()
      .mockRejectedValueOnce(new Error('Falha de rede'))
      .mockResolvedValueOnce(undefined);
    render(<MembersTable members={itens} onDelete={onExcluir} />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Excluir Enner Valência' }),
    );
    const confirmar = () =>
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Excluir',
      });
    await userEvent.click(confirmar());
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível excluir o membro. Tente novamente.',
    );
    expect(screen.getByText('Enner Valência')).toBeInTheDocument();
    await userEvent.click(confirmar());
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
    expect(onExcluir).toHaveBeenCalledTimes(2);
    expect(onExcluir).toHaveBeenLastCalledWith('1');
  });

  it('bloqueia ações enquanto a exclusão está em andamento', async () => {
    let concluir!: () => void;
    const exclusao = new Promise<void>((resolve) => {
      concluir = resolve;
    });
    const onExcluir = vi.fn(() => exclusao);
    render(<MembersTable members={itens} onDelete={onExcluir} />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Excluir Enner Valência' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    expect(screen.getByRole('button', { name: 'Excluindo…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await act(async () => {
      concluir();
      await exclusao;
    });
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(onExcluir).toHaveBeenCalledTimes(1);
  });

  it('ajusta a página quando a lista diminui e não deixa a navegação travada', async () => {
    const { rerender } = render(
      <MembersTable members={itens} onDelete={vi.fn()} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Próximo' }));
    rerender(<MembersTable members={itens.slice(0, 5)} onDelete={vi.fn()} />);
    expect(screen.getByText('Página 1 de 1')).toBeInTheDocument();
    rerender(<MembersTable members={itens} onDelete={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Anterior' }));
    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
  });
});
