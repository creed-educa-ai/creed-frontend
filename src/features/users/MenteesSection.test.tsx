import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import authenticationReducer from '@/features/authentication/authenticationSlice';
import { formsApi } from '@/features/forms/formsApi';
import formsReducer from '@/features/forms/formsSlice';
import { linksApi } from '@/features/links/linksApi';
import { MenteesSection } from '@/features/users/MenteesSection';
import usersReducer from '@/features/users/usersSlice';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { ApiError } from '@/lib/apiClient';
import { formatISO } from 'date-fns';
import type { FormRead, MemberListItem, PeriodRead } from '@/types/api';

const ORGANIZATION_ID = '8f14e45f-ceea-467e-adde-3f81905dbc1c';

// Dado sintético, no formato do `GET /organizations/{id}/members` (M-2). As
// datas são montadas no fuso local, como o diálogo as mostra.
const comPeriodo: MemberListItem = {
  link_id: 'd40b7a55-b9cc-4b78-ae5d-ab325fd655e2',
  name: 'Enner Valência',
  email: 'enner@example.com',
  role: 'respondente',
  type: 'mentoria',
  department: null,
  updated_at: null,
  period: {
    form_id: '5b1f0a7e-4c2d-4f7a-9d3e-2a6b8c0d1e2f',
    opens_at: new Date(2099, 0, 17, 15, 45).toISOString(),
    closes_at: new Date(2099, 0, 20, 18, 30).toISOString(),
    period_status: 'scheduled',
    has_answered: false,
  },
};

function renderizar(organizationId: string | null = ORGANIZATION_ID) {
  const store = configureStore({
    reducer: {
      authentication: authenticationReducer,
      forms: formsReducer,
      users: usersReducer,
    },
    preloadedState: {
      authentication: {
        user: {
          id: 'usuario-1',
          email: 'admin@creed.example.com',
          role: 'admin',
          link_id: '3f2b8c1e-7a4d-4e9b-9c0a-5d6e7f8a9b0c',
          organization_id: organizationId,
          organization_name: null,
        },
        status: 'authenticated' as const,
        error: null,
        passwordReset: { status: 'idle' as const, error: null },
      },
    },
  });
  return render(
    <Provider store={store}>
      <MenteesSection />
    </Provider>,
  );
}

describe('MenteesSection', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lista os mentorandos da organização da sessão', async () => {
    const listMembers = vi
      .spyOn(linksApi, 'listMembers')
      .mockResolvedValue([comPeriodo]);
    renderizar();

    expect(
      (await screen.findAllByText('Enner Valência')).length,
    ).toBeGreaterThan(0);
    expect(listMembers).toHaveBeenCalledWith(ORGANIZATION_ID, 'mentoria');
  });

  it('sem organização na sessão, mostra o erro e não chama o back', () => {
    const listMembers = vi.spyOn(linksApi, 'listMembers');
    renderizar(null);

    // O ErrorState junta a mensagem e o "tente recarregar" num parágrafo só.
    expect(screen.getByRole('alert')).toHaveTextContent(
      i18n.t('mentees:loadError'),
    );
    expect(listMembers).not.toHaveBeenCalled();
  });

  it('mostra o erro quando a carga falha', async () => {
    vi.spyOn(linksApi, 'listMembers').mockRejectedValue(new Error('falhou'));
    renderizar();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      i18n.t('mentees:loadError'),
    );
  });

  // Dado sintético, no formato do `GET /organizations/{id}/periods?link_id=`.
  const periodoAgendado: PeriodRead = {
    id: '5b1f0a7e-4c2d-4f7a-9d3e-2a6b8c0d1e2f',
    name: 'Questionário 2099-01-17 a 2099-01-20',
    organization_id: ORGANIZATION_ID,
    status: 'draft',
    opens_at: new Date(2099, 0, 17, 15, 45).toISOString(),
    closes_at: new Date(2099, 0, 20, 18, 30).toISOString(),
    link_id: comPeriodo.link_id,
    created_at: '2026-01-01T00:00:00Z',
    period_status: 'scheduled',
  };

  async function abrirQuestionario(user: ReturnType<typeof userEvent.setup>) {
    await screen.findByRole('table', { hidden: true });
    // Tabela e cartões do celular estão os dois no DOM: o primeiro basta.
    const [editar] = screen.getAllByRole('button', {
      name: 'Editar questionário de Enner Valência',
    });
    if (!editar) throw new Error('botão Editar não encontrado');
    await user.click(editar);
  }

  it('Editar abre o questionário com o período agendado do mentorando, só para leitura', async () => {
    vi.spyOn(linksApi, 'listMembers').mockResolvedValue([comPeriodo]);
    const listPeriods = vi
      .spyOn(formsApi, 'listPeriods')
      .mockResolvedValue([periodoAgendado]);
    const user = userEvent.setup();
    renderizar();

    await abrirQuestionario(user);

    expect(
      screen.getByRole('heading', { name: 'Questionário de Enner Valência' }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(i18n.t('painelControle:periodo.agendado')),
    ).toBeInTheDocument();
    expect(screen.getByText('17/01/2099')).toBeInTheDocument();
    expect(screen.getByText('20/01/2099')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: i18n.t('painelControle:confirmar'),
      }),
    ).not.toBeInTheDocument();
    // Na organização da sessão (a da CREED), só os períodos dele.
    expect(listPeriods).toHaveBeenCalledWith(
      ORGANIZATION_ID,
      comPeriodo.link_id,
    );
  });

  // Escolhe 17/01 às 15h45 a 20/01 às 18h30 do mês que o calendário abre.
  async function preencherPeriodo(user: ReturnType<typeof userEvent.setup>) {
    const coluna = (rotulo: string) => {
      const elemento = screen.getByText(rotulo).parentElement;
      if (!elemento) throw new Error(`Coluna "${rotulo}" não encontrada`);
      return elemento;
    };
    const escolher = async (
      rotulo: string,
      dia: number,
      h: string,
      m: string,
    ) => {
      const col = coluna(rotulo);
      await user.click(
        within(col).getByRole('button', {
          name: i18n.t('painelControle:selecionarData'),
        }),
      );
      const botaoDia = screen.getByText(String(dia)).closest('button');
      if (!botaoDia) throw new Error(`Dia ${String(dia)} não encontrado`);
      await user.click(botaoDia);
      await user.click(
        within(coluna(rotulo)).getByRole('button', {
          name: i18n.t('painelControle:selecionarHora'),
        }),
      );
      await user.click(screen.getByRole('button', { name: `${h}h` }));
      await user.click(screen.getByRole('button', { name: m }));
    };
    await escolher(i18n.t('painelControle:inicio'), 17, '15', '45');
    await escolher(i18n.t('painelControle:termino'), 20, '18', '30');
  }

  describe('abrindo um período', () => {
    // "Hoje" fixo: sábado, 10/01/2026. Só o Date é falso.
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, 0, 10, 10, 0));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('grava no back com o link_id do mentorando e fecha o modal', async () => {
      vi.spyOn(linksApi, 'listMembers').mockResolvedValue([comPeriodo]);
      vi.spyOn(formsApi, 'listPeriods').mockResolvedValue([]);
      const createPeriod = vi
        .spyOn(formsApi, 'createPeriod')
        .mockResolvedValue({} as FormRead);
      const user = userEvent.setup();
      renderizar();

      await abrirQuestionario(user);
      await screen.findByRole('button', {
        name: i18n.t('painelControle:confirmar'),
      });
      await preencherPeriodo(user);
      await user.click(
        screen.getByRole('button', {
          name: i18n.t('painelControle:confirmar'),
        }),
      );

      await waitFor(() => {
        expect(
          screen.queryByRole('heading', {
            name: 'Questionário de Enner Valência',
          }),
        ).not.toBeInTheDocument();
      });
      expect(createPeriod).toHaveBeenCalledWith(ORGANIZATION_ID, {
        opens_at: formatISO(new Date(2026, 0, 17, 15, 45)),
        closes_at: formatISO(new Date(2026, 0, 20, 18, 30)),
        link_id: comPeriodo.link_id,
      });
    });

    it('período sobreposto mostra a mensagem de conflito, com o modal aberto', async () => {
      vi.spyOn(linksApi, 'listMembers').mockResolvedValue([comPeriodo]);
      vi.spyOn(formsApi, 'listPeriods').mockResolvedValue([]);
      vi.spyOn(formsApi, 'createPeriod').mockRejectedValue(
        new ApiError(
          'Já existe período para este público nesse intervalo',
          409,
        ),
      );
      const user = userEvent.setup();
      renderizar();

      await abrirQuestionario(user);
      await screen.findByRole('button', {
        name: i18n.t('painelControle:confirmar'),
      });
      await preencherPeriodo(user);
      await user.click(
        screen.getByRole('button', {
          name: i18n.t('painelControle:confirmar'),
        }),
      );

      expect(
        await screen.findByText(i18n.t('painelControle:erros.periodoConflito')),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: 'Questionário de Enner Valência' }),
      ).toBeInTheDocument();
    });
  });

  async function pedirExclusao(user: ReturnType<typeof userEvent.setup>) {
    const table = await screen.findByRole('table', { hidden: true });
    await user.click(
      within(table).getByRole('button', { name: 'Excluir Enner Valência' }),
    );
    const dialogo = screen.getByRole('alertdialog');
    await user.click(within(dialogo).getByRole('button', { name: 'Excluir' }));
    return { table, dialogo };
  }

  it('excluir chama a M-3 e tira a linha', async () => {
    vi.spyOn(linksApi, 'listMembers').mockResolvedValue([comPeriodo]);
    const deleteMember = vi
      .spyOn(linksApi, 'deleteMember')
      .mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderizar();

    const { table } = await pedirExclusao(user);

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
    expect(deleteMember).toHaveBeenCalledWith(
      ORGANIZATION_ID,
      comPeriodo.link_id,
    );
    expect(within(table).queryByText('Enner Valência')).not.toBeInTheDocument();
  });

  it('503 na exclusão: o aviso fica no modal, aberto, e a linha fica', async () => {
    vi.spyOn(linksApi, 'listMembers').mockResolvedValue([comPeriodo]);
    vi.spyOn(linksApi, 'deleteMember').mockRejectedValue(
      new ApiError('Keycloak fora do ar', 503),
    );
    const user = userEvent.setup();
    renderizar();

    const { table, dialogo } = await pedirExclusao(user);

    expect(await within(dialogo).findByRole('alert')).toHaveTextContent(
      i18n.t('mentees:errors.deleteUnavailable'),
    );
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(within(table).getByText('Enner Valência')).toBeInTheDocument();
  });
});
