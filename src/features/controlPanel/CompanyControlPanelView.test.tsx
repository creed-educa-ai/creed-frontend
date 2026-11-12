import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { formatISO } from 'date-fns';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { CompanyControlPanelView } from './CompanyControlPanelView';
import authenticationReducer from '@/features/authentication/authenticationSlice';
import { formsApi } from '@/features/forms/formsApi';
import formsReducer from '@/features/forms/formsSlice';
import usersReducer from '@/features/users/usersSlice';
import { resetMembersMock } from '@/features/users/usersApi';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { ApiError } from '@/lib/apiClient';
import type { FormRead, PeriodRead } from '@/types/api';

const ORGANIZATION_ID = '00000000-0000-0000-0000-000000000001';

// Dado sintético, no formato do `POST /organizations/{id}/periods`.
const criado: FormRead = {
  id: '00000000-0000-0000-0000-000000000003',
  name: 'Questionário 2026-01-17 a 2026-01-17',
  organization_id: ORGANIZATION_ID,
  status: 'draft',
  opens_at: '2026-01-17T18:45:00Z',
  closes_at: '2026-01-17T21:30:00Z',
  link_id: null,
  created_at: '2026-01-10T13:00:00Z',
};

// Um período, como o `GET /organizations/{id}/periods` devolve. As
// datas são montadas no fuso local, como a tela as mostra.
function periodo(
  status: PeriodRead['period_status'],
  opens: Date,
  closes: Date,
): PeriodRead {
  return {
    ...criado,
    opens_at: opens.toISOString(),
    closes_at: closes.toISOString(),
    period_status: status,
  };
}

// A seção de membros lê e carrega a lista pelo slice de organizations; o menu
// do topo lê o papel na sessão (admin, o único que tem o painel).
async function renderizar() {
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
          email: 'dev@creed.example.com',
          role: 'gestor',
          link_id: null,
          organization_id: ORGANIZATION_ID,
          organization_name: null,
        },
        status: 'authenticated' as const,
        error: null,
        passwordReset: { status: 'idle' as const, error: null },
      },
    },
  });

  const result = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/control-panel']}>
        <CompanyControlPanelView />
      </MemoryRouter>
      <Toaster />
    </Provider>,
  );
  // O card do questionário espera a carga do período da organização.
  await waitFor(() => {
    expect(screen.queryByText(i18n.t('comum:carregando'))).toBeNull();
  });
  return result;
}

// A coluna é o contêiner do rótulo ("Início"/"Término") e dos dois botões dele.
function coluna(rotulo: string) {
  const elemento = screen.getByText(rotulo).parentElement;
  if (!elemento) {
    throw new Error(`Coluna "${rotulo}" não encontrada`);
  }
  return elemento;
}

const colunaInicio = () => coluna(i18n.t('painelControle:inicio'));
const colunaTermino = () => coluna(i18n.t('painelControle:termino'));

const botaoData = (col: HTMLElement) =>
  within(col).getByRole('button', {
    name: i18n.t('painelControle:selecionarData'),
  });

const botaoHora = (col: HTMLElement) =>
  within(col).getByRole('button', {
    name: i18n.t('painelControle:selecionarHora'),
  });

const botaoConfirmar = () =>
  screen.getByRole('button', { name: i18n.t('painelControle:confirmar') });

function botaoDoDia(dia: number) {
  const botao = screen.getByText(String(dia)).closest('button');
  if (!botao) {
    throw new Error(`Dia ${String(dia)} não encontrado no calendário`);
  }
  return botao;
}

async function escolherData(user: UserEvent, col: HTMLElement, dia: number) {
  await user.click(botaoData(col));
  await user.click(botaoDoDia(dia));
}

async function escolherHora(
  user: UserEvent,
  col: HTMLElement,
  hora: string,
  minuto: string,
) {
  await user.click(botaoHora(col));
  await user.click(screen.getByRole('button', { name: `${hora}h` }));
  await user.click(screen.getByRole('button', { name: minuto }));
}

let listPeriods: MockInstance<typeof formsApi.listPeriods>;
let createPeriod: MockInstance<typeof formsApi.createPeriod>;

describe('CompanyControlPanelView', () => {
  // "Hoje" fixo: sábado, 10/01/2026. Só o Date é falso; os timers seguem reais.
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 0, 10, 10, 0));
    resetMembersMock();
    listPeriods = vi.spyOn(formsApi, 'listPeriods').mockResolvedValue([]);
    createPeriod = vi.spyOn(formsApi, 'createPeriod').mockResolvedValue(criado);
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should render the organization name and the translated title', async () => {
    await renderizar();

    // No cabeçalho, acima do título, e no separador do card "Membros".
    expect(await screen.findAllByText('Acme Inc.')).toHaveLength(2);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: i18n.t('painelControle:titulo'),
      }),
    ).toBeInTheDocument();
  });

  it('should show prompts instead of pre-filled dates and times', async () => {
    await renderizar();

    for (const col of [colunaInicio(), colunaTermino()]) {
      expect(botaoData(col)).toBeInTheDocument();
      expect(botaoHora(col)).toBeInTheDocument();
    }
  });

  it('should open the calendar when clicking the start date button', async () => {
    const user = userEvent.setup();
    await renderizar();

    await user.click(botaoData(colunaInicio()));

    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('should block days before today in the start date calendar', async () => {
    const user = userEvent.setup();
    await renderizar();

    await user.click(botaoData(colunaInicio()));

    expect(botaoDoDia(9)).toBeDisabled();
    expect(botaoDoDia(10)).toBeEnabled();

    // Clicar num dia bloqueado não seleciona nada: o botão continua com o aviso.
    await user.click(botaoDoDia(9));
    expect(botaoData(colunaInicio())).toBeInTheDocument();
  });

  it('should block days before the start date in the end date calendar', async () => {
    const user = userEvent.setup();
    await renderizar();

    await escolherData(user, colunaInicio(), 17);
    await user.click(botaoData(colunaTermino()));

    expect(botaoDoDia(16)).toBeDisabled();
    expect(botaoDoDia(17)).toBeEnabled();
    expect(botaoDoDia(18)).toBeEnabled();
  });

  it('should show the calendar and the chosen date in Portuguese', async () => {
    const user = userEvent.setup();
    await renderizar();

    await user.click(botaoData(colunaInicio()));
    expect(screen.getByText(/janeiro/i)).toBeInTheDocument();

    await user.click(botaoDoDia(17));
    expect(
      within(colunaInicio()).getByRole('button', { name: '17/01/2026' }),
    ).toBeInTheDocument();
  });

  it('should show the calendar and the chosen date in English', async () => {
    await i18n.changeLanguage('en');
    const user = userEvent.setup();
    await renderizar();

    await user.click(botaoData(colunaInicio()));
    expect(screen.getByText(/january/i)).toBeInTheDocument();

    await user.click(botaoDoDia(17));
    expect(
      within(colunaInicio()).getByRole('button', { name: '01/17/2026' }),
    ).toBeInTheDocument();
  });

  it('should show the chosen time in the Portuguese format', async () => {
    const user = userEvent.setup();
    await renderizar();

    await escolherHora(user, colunaInicio(), '15', '45');

    expect(
      within(colunaInicio()).getByRole('button', { name: '15h45' }),
    ).toBeInTheDocument();
  });

  it('should show the time picker and the chosen time in English', async () => {
    await i18n.changeLanguage('en');
    const user = userEvent.setup();
    await renderizar();

    await user.click(botaoHora(colunaInicio()));
    expect(screen.getByText('Hour')).toBeInTheDocument();
    // "09": em inglês a hora 15 teria o mesmo nome do minuto 15.
    await user.click(screen.getByRole('button', { name: '09' }));
    await user.click(screen.getByRole('button', { name: '45' }));

    expect(
      within(colunaInicio()).getByRole('button', { name: '09:45' }),
    ).toBeInTheDocument();
  });

  it('should show the required errors and not save when the form is empty', async () => {
    const user = userEvent.setup();
    await renderizar();

    await user.click(botaoConfirmar());

    expect(
      await screen.findByText(i18n.t('painelControle:erros.inicioObrigatorio')),
    ).toBeInTheDocument();
    expect(
      screen.getByText(i18n.t('painelControle:erros.horaInicioObrigatoria')),
    ).toBeInTheDocument();
    expect(
      screen.getByText(i18n.t('painelControle:erros.terminoObrigatorio')),
    ).toBeInTheDocument();
    expect(
      screen.getByText(i18n.t('painelControle:erros.horaTerminoObrigatoria')),
    ).toBeInTheDocument();
    expect(createPeriod).not.toHaveBeenCalled();
  });

  it('should announce each error and link it to its field', async () => {
    const user = userEvent.setup();
    await renderizar();

    await user.click(botaoConfirmar());

    expect(await screen.findAllByRole('alert')).toHaveLength(4);
    expect(botaoData(colunaInicio())).toHaveAttribute('aria-invalid', 'true');
    expect(botaoData(colunaInicio())).toHaveAccessibleDescription(
      i18n.t('painelControle:erros.inicioObrigatorio'),
    );
    expect(botaoHora(colunaTermino())).toHaveAccessibleDescription(
      i18n.t('painelControle:erros.horaTerminoObrigatoria'),
    );
  });

  it('should show an error and not save when the start time today has already passed', async () => {
    const user = userEvent.setup();
    await renderizar();

    // "Agora" é 10/01/2026 às 10:00.
    await escolherData(user, colunaInicio(), 10);
    await escolherHora(user, colunaInicio(), '09', '00');
    await escolherData(user, colunaTermino(), 11);
    await escolherHora(user, colunaTermino(), '12', '00');
    await user.click(botaoConfirmar());

    expect(
      await screen.findByText(
        i18n.t('painelControle:erros.horaInicioNoPassado'),
      ),
    ).toBeInTheDocument();
    expect(createPeriod).not.toHaveBeenCalled();
  });

  it('should accept a start time later today', async () => {
    const user = userEvent.setup();
    await renderizar();

    await escolherData(user, colunaInicio(), 10);
    await escolherHora(user, colunaInicio(), '10', '15');
    await escolherData(user, colunaTermino(), 11);
    await escolherHora(user, colunaTermino(), '12', '00');
    await user.click(botaoConfirmar());

    await waitFor(() => {
      expect(createPeriod).toHaveBeenCalledOnce();
    });
  });

  it('should show an error and not save when the end time is before the start time on the same day', async () => {
    const user = userEvent.setup();
    await renderizar();

    await escolherData(user, colunaInicio(), 17);
    await escolherHora(user, colunaInicio(), '15', '00');
    await escolherData(user, colunaTermino(), 17);
    await escolherHora(user, colunaTermino(), '09', '00');
    await user.click(botaoConfirmar());

    expect(
      await screen.findByText(
        i18n.t('painelControle:erros.horaTerminoAntesInicio'),
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(i18n.t('painelControle:erros.terminoAntesInicio')),
    ).not.toBeInTheDocument();
    expect(createPeriod).not.toHaveBeenCalled();
  });

  it('should show an error and not save when the start date is moved past the end date', async () => {
    const user = userEvent.setup();
    await renderizar();

    // O calendário do início não olha o término: só o schema pega este caso.
    await escolherData(user, colunaInicio(), 17);
    await escolherHora(user, colunaInicio(), '09', '00');
    await escolherData(user, colunaTermino(), 17);
    await escolherHora(user, colunaTermino(), '18', '00');
    await user.click(
      within(colunaInicio()).getByRole('button', { name: '17/01/2026' }),
    );
    await user.click(botaoDoDia(20));
    await user.click(botaoConfirmar());

    expect(
      await screen.findByText(
        i18n.t('painelControle:erros.terminoAntesInicio'),
      ),
    ).toBeInTheDocument();
    expect(createPeriod).not.toHaveBeenCalled();
  });

  it('should save the chosen period when confirming', async () => {
    const user = userEvent.setup();
    await renderizar();

    await escolherData(user, colunaInicio(), 17);
    await escolherHora(user, colunaInicio(), '15', '45');
    await escolherData(user, colunaTermino(), 17);
    await escolherHora(user, colunaTermino(), '18', '30');
    await user.click(botaoConfirmar());

    expect(
      await screen.findByText('O questionário está no ar'),
    ).toBeInTheDocument();
    // Na organização da sessão, sem `link_id` (é o da organização inteira),
    // com o fuso de quem marcou.
    expect(createPeriod).toHaveBeenCalledWith(ORGANIZATION_ID, {
      opens_at: formatISO(new Date(2026, 0, 17, 15, 45)),
      closes_at: formatISO(new Date(2026, 0, 17, 18, 30)),
    });
    // Depois de criar, recarrega: a tela passa a mostrar o período novo.
    expect(listPeriods).toHaveBeenCalledTimes(2);
  });

  it('should show the period just created, read-only', async () => {
    const user = userEvent.setup();
    await renderizar();
    listPeriods.mockResolvedValue([
      periodo(
        'scheduled',
        new Date(2026, 0, 17, 15, 45),
        new Date(2026, 0, 17, 18, 30),
      ),
    ]);

    await escolherData(user, colunaInicio(), 17);
    await escolherHora(user, colunaInicio(), '15', '45');
    await escolherData(user, colunaTermino(), 17);
    await escolherHora(user, colunaTermino(), '18', '30');
    await user.click(botaoConfirmar());

    expect(
      await screen.findByText(i18n.t('painelControle:periodo.agendado')),
    ).toBeInTheDocument();
    expect(screen.getAllByText('17/01/2026')[0]).toBeInTheDocument();
    expect(screen.getByText('15h45')).toBeInTheDocument();
    expect(screen.getByText('18h30')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: i18n.t('painelControle:confirmar'),
      }),
    ).not.toBeInTheDocument();
  });

  it('should show an open period read-only, as soon as the screen opens', async () => {
    listPeriods.mockResolvedValue([
      periodo('open', new Date(2026, 0, 9, 8, 0), new Date(2026, 0, 20, 18, 0)),
    ]);
    await renderizar();

    expect(
      screen.getByText(i18n.t('painelControle:periodo.aberto')),
    ).toBeInTheDocument();
    expect(screen.getByText('09/01/2026')).toBeInTheDocument();
    expect(screen.getByText('20/01/2026')).toBeInTheDocument();
    expect(
      screen.getByText(i18n.t('painelControle:periodo.somenteLeitura')),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: i18n.t('painelControle:selecionarData'),
      }),
    ).not.toBeInTheDocument();
    expect(listPeriods).toHaveBeenCalledWith(ORGANIZATION_ID, undefined);
  });

  it('should ignore past periods and let a new one be set', async () => {
    listPeriods.mockResolvedValue([
      periodo('past', new Date(2025, 11, 1, 8, 0), new Date(2025, 11, 5, 8, 0)),
    ]);
    await renderizar();

    expect(botaoConfirmar()).toBeEnabled();
    expect(
      screen.queryByText(i18n.t('painelControle:periodo.aberto')),
    ).not.toBeInTheDocument();
  });

  it('should show the conflict message, not the generic one, on 409', async () => {
    createPeriod.mockRejectedValue(
      new ApiError('Já existe período para este público nesse intervalo', 409),
    );
    const user = userEvent.setup();
    await renderizar();

    await escolherData(user, colunaInicio(), 17);
    await escolherHora(user, colunaInicio(), '15', '45');
    await escolherData(user, colunaTermino(), 17);
    await escolherHora(user, colunaTermino(), '18', '30');
    await user.click(botaoConfirmar());

    expect(
      await screen.findByText(i18n.t('painelControle:erros.periodoConflito')),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(i18n.t('painelControle:erros.periodoFalhou')),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('O questionário está no ar'),
    ).not.toBeInTheDocument();
  });

  it('should show the generic message when opening the period fails', async () => {
    createPeriod.mockRejectedValue(new ApiError('Erro interno', 500));
    const user = userEvent.setup();
    await renderizar();

    await escolherData(user, colunaInicio(), 17);
    await escolherHora(user, colunaInicio(), '15', '45');
    await escolherData(user, colunaTermino(), 17);
    await escolherHora(user, colunaTermino(), '18', '30');
    await user.click(botaoConfirmar());

    expect(
      await screen.findByText(i18n.t('painelControle:erros.periodoFalhou')),
    ).toBeInTheDocument();
  });

  it('should render the three section titles, without collapsing', async () => {
    await renderizar();

    // "Controles" agrupa os dois cards de ação, cada um com o título dentro.
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: i18n.t('painelControle:controles'),
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: i18n.t('painelControle:adicionarMembro'),
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: i18n.t('painelControle:gerenciar'),
      }),
    ).toBeInTheDocument();
    // O separador leva o nome da empresa; "Membros" é o título do card.
    expect(
      await screen.findByRole('heading', { level: 2, name: 'Acme Inc.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Membros' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: i18n.t('painelControle:gerenciar'),
      }),
    ).not.toBeInTheDocument();
  });

  it('should list the organization members', async () => {
    await renderizar();

    expect(
      within(await screen.findByRole('table')).getByText('Enner Valência'),
    ).toBeInTheDocument();
  });

  it('should highlight the control panel in the menu', async () => {
    await renderizar();

    expect(
      screen.getByRole('link', {
        name: i18n.t('formulario:menuPainelControle'),
      }),
    ).toHaveAttribute('aria-current', 'page');
    expect(
      screen.getByRole('link', { name: i18n.t('formulario:menuPainel') }),
    ).not.toHaveAttribute('aria-current');
  });
});
