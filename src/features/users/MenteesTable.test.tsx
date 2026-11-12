import type { ComponentProps } from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { MenteesTable } from '@/features/users/MenteesTable';
import type { MemberListItem, MemberPeriod } from '@/types/api';

// Dado sintético, no formato do `GET /organizations/{id}/members` (M-2).
function period(hasAnswered: boolean): MemberPeriod {
  return {
    form_id: '5b1f0a7e-4c2d-4f7a-9d3e-2a6b8c0d1e2f',
    opens_at: '2026-11-01T12:00:00Z',
    closes_at: '2026-11-30T12:00:00Z',
    period_status: 'open',
    has_answered: hasAnswered,
  };
}

function mentee(
  linkId: string,
  name: string,
  email: string | null,
  menteePeriod: MemberPeriod | null,
): MemberListItem {
  return {
    link_id: linkId,
    name,
    email,
    role: 'respondente',
    type: 'mentoria',
    department: null,
    updated_at: null,
    period: menteePeriod,
  };
}

const mentees: MemberListItem[] = [
  mentee('1', 'Enner Valência', 'enner@example.com', period(true)),
  mentee('2', 'Volante Ronaldo', 'volante@example.com', period(false)),
  mentee('3', 'José Maurides', 'jose@example.com', period(true)),
];

function renderTable(
  overrides: Partial<ComponentProps<typeof MenteesTable>> = {},
) {
  const props = {
    mentees,
    onViewResults: vi.fn(),
    onEditQuestionnaire: vi.fn(),
    onDelete: vi.fn(),
    ...overrides,
  };
  render(<MenteesTable {...props} />);
  return props;
}

describe('MenteesTable', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('mostra busca, colunas e uma linha por mentorando', () => {
    renderTable();
    const table = screen.getByRole('table');

    expect(
      screen.getByRole('searchbox', {
        name: 'Pesquisar mentorandos por nome',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('searchbox', {
        name: 'Pesquisar mentorandos por email',
      }),
    ).toBeInTheDocument();
    for (const coluna of [
      'Nome',
      'Email',
      'Questionário',
      'Resultados',
      'Excluir',
    ]) {
      expect(
        within(table).getByRole('columnheader', { name: coluna }),
      ).toBeInTheDocument();
    }
    // Sem coluna de status (CREED-69): a pessoa estar na tabela já basta.
    expect(
      within(table).queryByRole('columnheader', { name: 'Status' }),
    ).not.toBeInTheDocument();
    expect(within(table).getAllByRole('columnheader')).toHaveLength(5);
    for (const { name } of mentees) {
      expect(within(table).getByText(name)).toBeInTheDocument();
    }
    expect(
      within(screen.getByRole('list')).getAllByRole('listitem'),
    ).toHaveLength(3);
  });

  it('desabilita só Ver Resultados de quem ainda não respondeu', () => {
    renderTable();
    const table = screen.getByRole('table');

    // Editar continua habilitado: é por ele que se cria o questionário.
    expect(
      within(table).getByRole('button', {
        name: 'Editar questionário de Volante Ronaldo',
      }),
    ).toBeEnabled();
    expect(
      within(table).getByRole('button', {
        name: 'Ver resultados de Volante Ronaldo',
      }),
    ).toBeDisabled();
    expect(
      within(table).getByRole('button', {
        name: 'Editar questionário de Enner Valência',
      }),
    ).toBeEnabled();
    expect(
      within(table).getByRole('button', {
        name: 'Ver resultados de Enner Valência',
      }),
    ).toBeEnabled();
  });

  it('desabilita Ver Resultados de quem ainda não tem período', () => {
    renderTable({
      mentees: [mentee('9', 'Ana Souza', 'ana@example.com', null)],
    });
    const table = screen.getByRole('table');

    expect(
      within(table).getByRole('button', {
        name: 'Ver resultados de Ana Souza',
      }),
    ).toBeDisabled();
    expect(
      within(table).getByRole('button', {
        name: 'Editar questionário de Ana Souza',
      }),
    ).toBeEnabled();
  });

  it('mostra quem não tem e-mail, e a busca por e-mail não quebra', async () => {
    const user = userEvent.setup();
    renderTable({
      mentees: [
        mentee('9', 'Ana Souza', null, null),
        mentee('1', 'Enner Valência', 'enner@example.com', period(true)),
      ],
    });
    const table = screen.getByRole('table');
    expect(within(table).getByText('Ana Souza')).toBeInTheDocument();

    await user.type(
      screen.getByRole('searchbox', {
        name: 'Pesquisar mentorandos por email',
      }),
      'enner',
    );

    expect(within(table).getByText('Enner Valência')).toBeInTheDocument();
    expect(within(table).queryByText('Ana Souza')).not.toBeInTheDocument();
  });

  it('chama onEditQuestionnaire e onViewResults com o mentorando da linha', async () => {
    const user = userEvent.setup();
    const props = renderTable();
    const table = screen.getByRole('table');

    await user.click(
      within(table).getByRole('button', {
        name: 'Editar questionário de Enner Valência',
      }),
    );
    await user.click(
      within(table).getByRole('button', {
        name: 'Ver resultados de Enner Valência',
      }),
    );

    expect(props.onEditQuestionnaire).toHaveBeenCalledWith(mentees[0]);
    expect(props.onViewResults).toHaveBeenCalledWith(mentees[0]);
  });

  it('filtra pelo nome sem diferenciar acento nem maiúscula', async () => {
    const user = userEvent.setup();
    renderTable();
    const table = screen.getByRole('table');

    await user.click(
      screen.getByRole('searchbox', {
        name: 'Pesquisar mentorandos por nome',
      }),
    );
    await user.paste('JOSE');

    expect(within(table).getByText('José Maurides')).toBeInTheDocument();
    expect(within(table).queryByText('Enner Valência')).not.toBeInTheDocument();
    expect(
      within(table).queryByText('Volante Ronaldo'),
    ).not.toBeInTheDocument();
  });

  it('avisa quando a busca não encontra ninguém', async () => {
    const user = userEvent.setup();
    renderTable();

    await user.click(
      screen.getByRole('searchbox', {
        name: 'Pesquisar mentorandos por nome',
      }),
    );
    await user.paste('zzz');

    expect(
      screen.getByText('Nenhum mentorando encontrado para essa pesquisa.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('avisa quando ainda não há mentorandos', () => {
    renderTable({ mentees: [] });

    expect(
      screen.getByText('Nenhum mentorando cadastrado ainda.'),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole('searchbox')).toHaveLength(0);
  });

  it('filtra pelo email e combina com a busca por nome', async () => {
    const user = userEvent.setup();
    renderTable();
    const table = screen.getByRole('table');

    await user.type(
      screen.getByRole('searchbox', {
        name: 'Pesquisar mentorandos por email',
      }),
      'example.com',
    );
    expect(within(table).getAllByRole('row')).toHaveLength(4);

    await user.type(
      screen.getByRole('searchbox', { name: 'Pesquisar mentorandos por nome' }),
      'enner',
    );
    expect(within(table).getByText('Enner Valência')).toBeInTheDocument();
    expect(within(table).queryByText('José Maurides')).not.toBeInTheDocument();

    await user.clear(
      screen.getByRole('searchbox', {
        name: 'Pesquisar mentorandos por email',
      }),
    );
    await user.type(
      screen.getByRole('searchbox', {
        name: 'Pesquisar mentorandos por email',
      }),
      'volante',
    );
    expect(
      screen.getByText('Nenhum mentorando encontrado para essa pesquisa.'),
    ).toBeInTheDocument();
  });

  it('ordena pelo nome, e não por status', async () => {
    const user = userEvent.setup();
    renderTable();
    const primeiraLinha = () =>
      within(screen.getByRole('table')).getAllByRole('row')[1];

    expect(
      screen.queryByRole('button', { name: 'Ordenar por status' }),
    ).not.toBeInTheDocument();
    const ordenar = screen.getByRole('button', { name: 'Ordenar por nome' });
    await user.click(ordenar);
    expect(primeiraLinha()).toHaveTextContent('Enner Valência');
    await user.click(ordenar);
    expect(primeiraLinha()).toHaveTextContent('Volante Ronaldo');
  });

  it('só exclui depois de confirmar', async () => {
    const user = userEvent.setup();
    const props = renderTable();

    await user.click(
      within(screen.getByRole('table')).getByRole('button', {
        name: 'Excluir Enner Valência',
      }),
    );
    const dialogo = screen.getByRole('alertdialog');

    // Deixa claro que a exclusão leva os resultados e é para sempre.
    expect(
      within(dialogo).getByText(
        'Enner Valência e todos os seus resultados serão apagados para sempre. Esta ação não pode ser desfeita.',
      ),
    ).toBeInTheDocument();
    expect(props.onDelete).not.toHaveBeenCalled();

    await user.click(within(dialogo).getByRole('button', { name: 'Excluir' }));

    await waitFor(() => {
      expect(props.onDelete).toHaveBeenCalledWith(mentees[0]);
    });
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });

  it('não exclui quando a pessoa cancela', async () => {
    const user = userEvent.setup();
    const props = renderTable();

    await user.click(
      within(screen.getByRole('table')).getByRole('button', {
        name: 'Excluir Enner Valência',
      }),
    );
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Cancelar',
      }),
    );

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
    expect(props.onDelete).not.toHaveBeenCalled();
  });

  it('mantém o diálogo aberto quando a exclusão falha', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockRejectedValue(new Error('falhou'));
    renderTable({ onDelete });

    await user.click(
      within(screen.getByRole('table')).getByRole('button', {
        name: 'Excluir Enner Valência',
      }),
    );
    const dialogo = screen.getByRole('alertdialog');
    await user.click(within(dialogo).getByRole('button', { name: 'Excluir' }));

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(
        within(dialogo).getByRole('button', { name: 'Excluir' }),
      ).toBeEnabled();
    });
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('mostra dentro do diálogo a mensagem de erro que recebeu', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockRejectedValue(new Error('falhou'));
    renderTable({
      onDelete,
      deleteErrorMessage: 'Não foi possível excluir agora. Tente de novo.',
    });

    await user.click(
      within(screen.getByRole('table')).getByRole('button', {
        name: 'Excluir Enner Valência',
      }),
    );
    const dialogo = screen.getByRole('alertdialog');
    expect(
      within(dialogo).getByText(
        'Enner Valência e todos os seus resultados serão apagados para sempre. Esta ação não pode ser desfeita.',
      ),
    ).toBeInTheDocument();
    await user.click(within(dialogo).getByRole('button', { name: 'Excluir' }));

    expect(await within(dialogo).findByRole('alert')).toHaveTextContent(
      'Não foi possível excluir agora. Tente de novo.',
    );
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('não mostra caixas de seleção por padrão', () => {
    renderTable();
    expect(
      within(screen.getByRole('table')).queryAllByRole('checkbox'),
    ).toHaveLength(0);
  });

  it('marca e desmarca linhas, e a caixa do cabeçalho marca todas', async () => {
    const user = userEvent.setup();
    renderTable({ selectable: true });
    const table = screen.getByRole('table');
    const todas = within(table).getByRole('checkbox', {
      name: 'Selecionar todos',
    });
    const enner = within(table).getByRole('checkbox', {
      name: 'Selecionar Enner Valência',
    });

    await user.click(enner);
    expect(enner).toBeChecked();
    expect(todas).not.toBeChecked();

    await user.click(todas);
    for (const caixa of within(table).getAllByRole('checkbox')) {
      expect(caixa).toBeChecked();
    }

    await user.click(todas);
    for (const caixa of within(table).getAllByRole('checkbox')) {
      expect(caixa).not.toBeChecked();
    }
  });

  it('a caixa do cabeçalho marca só as linhas que a busca deixa visíveis', async () => {
    const user = userEvent.setup();
    renderTable({ selectable: true });
    const busca = screen.getByRole('searchbox', {
      name: 'Pesquisar mentorandos por nome',
    });

    await user.type(busca, 'jose');
    const table = screen.getByRole('table');
    await user.click(
      within(table).getByRole('checkbox', { name: 'Selecionar todos' }),
    );

    await user.clear(busca);
    expect(
      within(table).getByRole('checkbox', { name: 'Selecionar José Maurides' }),
    ).toBeChecked();
    expect(
      within(table).getByRole('checkbox', {
        name: 'Selecionar Enner Valência',
      }),
    ).not.toBeChecked();
  });

  it('troca os textos quando o idioma muda', async () => {
    await i18n.changeLanguage('en');
    renderTable();
    const table = screen.getByRole('table');

    expect(
      within(table).getByRole('button', {
        name: 'Edit questionnaire for Enner Valência',
      }),
    ).toBeInTheDocument();
    expect(
      within(table).getByRole('columnheader', { name: 'Results' }),
    ).toBeInTheDocument();
  });

  it('Esc e clique fora não fecham o diálogo: destacam o Cancelar', async () => {
    const user = userEvent.setup();
    const props = renderTable();

    await user.click(
      within(screen.getByRole('table')).getByRole('button', {
        name: 'Excluir Enner Valência',
      }),
    );
    const dialogo = screen.getByRole('alertdialog');
    const cancelar = within(dialogo).getByRole('button', { name: 'Cancelar' });

    // Tira o foco do Cancelar, para provar que é o destaque que o devolve.
    await user.tab();
    expect(cancelar).not.toHaveFocus();
    await user.keyboard('{Escape}');

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(cancelar).toHaveFocus();
    expect(cancelar).toHaveClass('border-ring');

    await user.tab();
    expect(cancelar).not.toHaveFocus();
    expect(cancelar).not.toHaveClass('border-ring');

    const overlay = document.querySelector(
      '[data-slot="alert-dialog-overlay"]',
    );
    if (!overlay) throw new Error('overlay do diálogo não encontrado');
    fireEvent.click(overlay);

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(cancelar).toHaveFocus();
    expect(props.onDelete).not.toHaveBeenCalled();
  });
});
