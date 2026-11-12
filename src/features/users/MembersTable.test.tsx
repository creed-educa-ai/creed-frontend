import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MembersTable } from '@/features/users/MembersTable';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import type { Member } from '@/types/api';

const membrosMock: Member[] = [
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
];

let itens: Member[];

// Tabela e cartões do celular estão os dois no DOM (o jsdom não aplica o
// `md:hidden`): as buscas olham a tabela. `hidden` acha a tabela mesmo com um
// diálogo aberto, que a tira da árvore acessível.
function tabela() {
  return screen.getByRole('table', { hidden: true });
}

function linhas() {
  return within(screen.getByRole('table')).getAllByRole('row').slice(1);
}

describe('MembersTable', () => {
  beforeEach(async () => {
    itens = membrosMock.map((membro) => ({ ...membro }));
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('exibe cinco membros por página e permite voltar', async () => {
    render(
      <MembersTable members={itens} onDelete={vi.fn()} onChangeTag={vi.fn()} />,
    );

    expect(linhas()).toHaveLength(5);
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Próximo' }));
    expect(linhas()).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Próximo' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Anterior' }));
    expect(within(tabela()).getByText('Enner Valência')).toBeInTheDocument();
  });

  it('reinicia a página ao filtrar e ignora espaços e caixa no e-mail', async () => {
    render(
      <MembersTable members={itens} onDelete={vi.fn()} onChangeTag={vi.fn()} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Próximo' }));
    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Pesquisar membros por email' }),
      ' FELICIA.REID ',
    );

    expect(linhas()).toHaveLength(1);
    expect(within(tabela()).getByText('Wilson Mathias')).toBeInTheDocument();
    expect(screen.getByText('Página 1 de 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Próximo' })).toBeDisabled();
  });

  it('distingue uma lista vazia de uma busca sem resultados', async () => {
    const { rerender } = render(
      <MembersTable members={[]} onDelete={vi.fn()} onChangeTag={vi.fn()} />,
    );
    expect(
      screen.getByText('Nenhum membro associado à empresa.'),
    ).toBeInTheDocument();
    rerender(
      <MembersTable members={itens} onDelete={vi.fn()} onChangeTag={vi.fn()} />,
    );
    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Pesquisar membros por nome' }),
      'inexistente',
    );
    expect(
      screen.getByText('Nenhum membro encontrado para essa pesquisa.'),
    ).toBeInTheDocument();
  });

  it('ordena nomes nos dois sentidos e restaura a ordem original', async () => {
    render(
      <MembersTable members={itens} onDelete={vi.fn()} onChangeTag={vi.fn()} />,
    );
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

  it('filtra por nome e por email ao mesmo tempo', async () => {
    render(
      <MembersTable members={itens} onDelete={vi.fn()} onChangeTag={vi.fn()} />,
    );
    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Pesquisar membros por nome' }),
      'a',
    );
    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Pesquisar membros por email' }),
      'felicia',
    );
    expect(linhas()).toHaveLength(1);
    expect(linhas()[0]).toHaveTextContent('Wilson Mathias');
  });

  it('ordena pelo status: pendentes no crescente, ativos no decrescente', async () => {
    render(
      <MembersTable members={itens} onDelete={vi.fn()} onChangeTag={vi.fn()} />,
    );
    const ordenar = screen.getByRole('button', { name: 'Ordenar por status' });
    await userEvent.click(ordenar);
    expect(linhas()[0]).toHaveTextContent('Pendente');
    await userEvent.click(ordenar);
    expect(linhas()[0]).toHaveTextContent('Ativo');
  });

  it('mostra cada membro também como cartão, para o celular', () => {
    render(
      <MembersTable members={itens} onDelete={vi.fn()} onChangeTag={vi.fn()} />,
    );
    const cartoes = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(cartoes).toHaveLength(5);
    const [primeiro] = cartoes;
    if (!primeiro) throw new Error('falta o cartão');
    expect(within(primeiro).getByText('Enner Valência')).toBeInTheDocument();
    expect(
      within(primeiro).getByRole('button', { name: 'Excluir Enner Valência' }),
    ).toBeInTheDocument();
  });

  it('escolhe a tag do membro pelo dropdown da própria tag', async () => {
    const onChangeTag = vi.fn();
    render(
      <MembersTable
        members={itens}
        onDelete={vi.fn()}
        onChangeTag={onChangeTag}
      />,
    );
    await userEvent.click(
      within(tabela()).getByRole('button', {
        name: 'Marketing: alterar a tag de Enner Valência',
      }),
    );
    const opcoes = screen.getAllByRole('menuitemradio');
    // Os cinco setores e "Sem tag".
    expect(opcoes).toHaveLength(6);
    expect(
      screen.getByRole('menuitemradio', { name: 'Marketing' }),
    ).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(screen.getByRole('menuitemradio', { name: 'TI' }));
    expect(onChangeTag).toHaveBeenCalledWith('1', 'TecnologiaInformacao');
  });

  it('mostra "Sem tag" para quem ainda não tem e deixa escolher', async () => {
    const onChangeTag = vi.fn();
    render(
      <MembersTable
        members={itens}
        onDelete={vi.fn()}
        onChangeTag={onChangeTag}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Próximo' }));
    await userEvent.click(
      within(tabela()).getByRole('button', {
        name: 'Sem tag: alterar a tag de Bruno Lima',
      }),
    );
    expect(
      screen.getByRole('menuitemradio', { name: 'Sem tag' }),
    ).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(screen.getByRole('menuitemradio', { name: 'RH' }));
    expect(onChangeTag).toHaveBeenCalledWith('7', 'RecursosHumanos');
  });

  it('ordena pela tag, em ordem alfabética, com quem está sem tag no fim', async () => {
    render(
      <MembersTable members={itens} onDelete={vi.fn()} onChangeTag={vi.fn()} />,
    );
    const nomes = () =>
      linhas().map((linha) => linha.querySelector('td')?.textContent);
    const ordenar = screen.getByRole('button', { name: 'Ordenar por tag' });

    await userEvent.click(ordenar);
    expect(ordenar.closest('th')).toHaveAttribute('aria-sort', 'ascending');
    expect(nomes()).toEqual([
      'Clayton Sampaio',
      'Wilson Mathias',
      'Enner Valência',
      'Ana Souza',
      'Volante Ronaldo',
    ]);
    await userEvent.click(screen.getByRole('button', { name: 'Próximo' }));
    expect(nomes()).toEqual([
      'Maurides Cambalhota',
      'Bruno Lima',
      'Carla Dias',
    ]);

    await userEvent.click(ordenar);
    expect(nomes()).toEqual([
      'Maurides Cambalhota',
      'Volante Ronaldo',
      'Enner Valência',
      'Ana Souza',
      'Wilson Mathias',
    ]);
    await userEvent.click(screen.getByRole('button', { name: 'Próximo' }));
    expect(nomes()).toEqual(['Clayton Sampaio', 'Bruno Lima', 'Carla Dias']);
  });

  it('ordena datas e as formata no idioma selecionado', async () => {
    render(
      <MembersTable members={itens} onDelete={vi.fn()} onChangeTag={vi.fn()} />,
    );
    expect(within(tabela()).getByText('18/10/2026')).toBeInTheDocument();
    const ordenar = screen.getByRole('button', {
      name: 'Ordenar por data recente',
    });
    await userEvent.click(ordenar);
    expect(linhas()[0]).toHaveTextContent('Carla Dias');
    await userEvent.click(ordenar);
    expect(linhas()[0]).toHaveTextContent('Enner Valência');
    expect(ordenar.closest('th')).toHaveAttribute('aria-sort', 'descending');
    await act(() => i18n.changeLanguage('en'));
    expect(within(tabela()).getByText('10/18/26')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
  });

  it('não mostra caixas de seleção nem o texto de seleção por padrão', () => {
    render(
      <MembersTable members={itens} onDelete={vi.fn()} onChangeTag={vi.fn()} />,
    );
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    expect(screen.queryByText(/selecionada\(s\)/)).not.toBeInTheDocument();
  });

  it('seleciona apenas a página atual e mantém a seleção ao navegar', async () => {
    render(
      <MembersTable
        members={itens}
        onDelete={vi.fn()}
        onChangeTag={vi.fn()}
        selectable
      />,
    );
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
    render(
      <MembersTable
        members={comFusos}
        onDelete={vi.fn()}
        onChangeTag={vi.fn()}
      />,
    );
    const ordenar = screen.getByRole('button', {
      name: 'Ordenar por data recente',
    });
    await userEvent.click(ordenar);
    expect(linhas()[0]).toHaveTextContent('Wilson Mathias');
    await userEvent.click(ordenar);
    expect(linhas()[0]).toHaveTextContent('Enner Valência');
  });

  it('não tem a coluna Ação nem o botão Ver', () => {
    render(
      <MembersTable members={itens} onDelete={vi.fn()} onChangeTag={vi.fn()} />,
    );
    expect(
      within(tabela()).queryByRole('columnheader', { name: 'Ação' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Ver' }),
    ).not.toBeInTheDocument();
  });

  it('cancela a exclusão sem remover o membro', async () => {
    const onExcluir = vi.fn();
    render(
      <MembersTable
        members={itens}
        onDelete={onExcluir}
        onChangeTag={vi.fn()}
      />,
    );
    await userEvent.click(
      within(tabela()).getByRole('button', {
        name: 'Excluir Volante Ronaldo',
      }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(onExcluir).not.toHaveBeenCalled();
    expect(within(tabela()).getByText('Volante Ronaldo')).toBeInTheDocument();
  });

  it('mostra falhas de exclusão no diálogo e permite tentar novamente', async () => {
    const onExcluir = vi
      .fn()
      .mockRejectedValueOnce(new Error('Falha de rede'))
      .mockResolvedValueOnce(undefined);
    render(
      <MembersTable
        members={itens}
        onDelete={onExcluir}
        onChangeTag={vi.fn()}
      />,
    );
    await userEvent.click(
      within(tabela()).getByRole('button', {
        name: 'Excluir Enner Valência',
      }),
    );
    const confirmar = () =>
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Excluir',
      });
    await userEvent.click(confirmar());
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível excluir o membro. Tente novamente.',
    );
    expect(within(tabela()).getByText('Enner Valência')).toBeInTheDocument();
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
    render(
      <MembersTable
        members={itens}
        onDelete={onExcluir}
        onChangeTag={vi.fn()}
      />,
    );
    await userEvent.click(
      within(tabela()).getByRole('button', {
        name: 'Excluir Enner Valência',
      }),
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
      <MembersTable members={itens} onDelete={vi.fn()} onChangeTag={vi.fn()} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Próximo' }));
    rerender(
      <MembersTable
        members={itens.slice(0, 5)}
        onDelete={vi.fn()}
        onChangeTag={vi.fn()}
      />,
    );
    expect(screen.getByText('Página 1 de 1')).toBeInTheDocument();
    rerender(
      <MembersTable members={itens} onDelete={vi.fn()} onChangeTag={vi.fn()} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Anterior' }));
    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
  });
});
