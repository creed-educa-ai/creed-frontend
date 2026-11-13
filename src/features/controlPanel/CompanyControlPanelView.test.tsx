import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { CompanyControlPanelView } from './CompanyControlPanelView';
import authenticationReducer from '@/features/authentication/authenticationSlice';
import usersReducer from '@/features/users/usersSlice';
import { usersApi } from '@/features/users/usersApi';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import type { MemberList } from '@/types/api';

const membrosMockFixture: MemberList = {
  itens: [
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
  ],
  total: 8,
  pagina: 1,
  tamanho_pagina: 5,
  organization: 'Acme Inc.',
};

function renderizar(route = '/control-panel') {
  const store = configureStore({
    reducer: {
      authentication: authenticationReducer,
      users: usersReducer,
    },
    preloadedState: {
      authentication: {
        user: {
          id: 'usuario-1',
          email: 'dev@creed.example.com',
          role: 'gestor',
          link_id: null,
          organization_id: 'org-1',
          organization_name: 'Acme Inc.',
        },
        status: 'authenticated' as const,
        error: null,
        passwordReset: { status: 'idle' as const, error: null },
      },
      users: {
        ...usersReducer(undefined, { type: '@INIT' }),
        members: membrosMockFixture.itens,
        organization: membrosMockFixture.organization,
      },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/control-panel" element={<CompanyControlPanelView />} />
          <Route
            path="/organizations/:id/control-panel"
            element={<CompanyControlPanelView />}
          />
        </Routes>
      </MemoryRouter>
      <Toaster />
    </Provider>,
  );
}

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

describe('CompanyControlPanelView', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 0, 10, 10, 0));
    vi.spyOn(usersApi, 'listMembers').mockResolvedValue(membrosMockFixture);
    vi.spyOn(usersApi, 'setMemberTag').mockResolvedValue(undefined);
    vi.spyOn(usersApi, 'removeMember').mockResolvedValue(undefined);
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should render the organization name and the translated title', () => {
    renderizar();

    expect(screen.getAllByText('Acme Inc.')).toHaveLength(2);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: i18n.t('painelControle:titulo'),
      }),
    ).toBeInTheDocument();
  });

  it('should show prompts instead of pre-filled dates and times', () => {
    renderizar();

    for (const col of [colunaInicio(), colunaTermino()]) {
      expect(botaoData(col)).toBeInTheDocument();
      expect(botaoHora(col)).toBeInTheDocument();
    }
  });

  it('should open the calendar when clicking the start date button', async () => {
    const user = userEvent.setup();
    renderizar();

    await user.click(botaoData(colunaInicio()));

    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('should block days before today in the start date calendar', async () => {
    const user = userEvent.setup();
    renderizar();

    await user.click(botaoData(colunaInicio()));

    expect(botaoDoDia(9)).toBeDisabled();
    expect(botaoDoDia(10)).toBeEnabled();

    await user.click(botaoDoDia(9));
    expect(botaoData(colunaInicio())).toBeInTheDocument();
  });

  it('should block days before the start date in the end date calendar', async () => {
    const user = userEvent.setup();
    renderizar();

    await escolherData(user, colunaInicio(), 17);
    await user.click(botaoData(colunaTermino()));

    expect(botaoDoDia(16)).toBeDisabled();
    expect(botaoDoDia(17)).toBeEnabled();
    expect(botaoDoDia(18)).toBeEnabled();
  });

  it('should show the calendar and the chosen date in Portuguese', async () => {
    const user = userEvent.setup();
    renderizar();

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
    renderizar();

    await user.click(botaoData(colunaInicio()));
    expect(screen.getByText(/january/i)).toBeInTheDocument();

    await user.click(botaoDoDia(17));
    expect(
      within(colunaInicio()).getByRole('button', { name: '01/17/2026' }),
    ).toBeInTheDocument();
  });

  it('should show the chosen time in the Portuguese format', async () => {
    const user = userEvent.setup();
    renderizar();

    await escolherHora(user, colunaInicio(), '15', '45');

    expect(
      within(colunaInicio()).getByRole('button', { name: '15h45' }),
    ).toBeInTheDocument();
  });

  it('should show the time picker and the chosen time in English', async () => {
    await i18n.changeLanguage('en');
    const user = userEvent.setup();
    renderizar();

    await user.click(botaoHora(colunaInicio()));
    expect(screen.getByText('Hour')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '09' }));
    await user.click(screen.getByRole('button', { name: '45' }));

    expect(
      within(colunaInicio()).getByRole('button', { name: '09:45' }),
    ).toBeInTheDocument();
  });

  it('should show the required errors and not save when the form is empty', async () => {
    const consoleSpy = vi
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);
    const user = userEvent.setup();
    renderizar();

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
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should announce each error and link it to its field', async () => {
    const user = userEvent.setup();
    renderizar();

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
    const consoleSpy = vi
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);
    const user = userEvent.setup();
    renderizar();

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
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should accept a start time later today', async () => {
    const consoleSpy = vi
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);
    const user = userEvent.setup();
    renderizar();

    await escolherData(user, colunaInicio(), 10);
    await escolherHora(user, colunaInicio(), '10', '15');
    await escolherData(user, colunaTermino(), 11);
    await escolherHora(user, colunaTermino(), '12', '00');
    await user.click(botaoConfirmar());

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledOnce();
    });

    consoleSpy.mockRestore();
  });

  it('should show an error and not save when the end time is before the start time on the same day', async () => {
    const consoleSpy = vi
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);
    const user = userEvent.setup();
    renderizar();

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
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should show an error and not save when the start date is moved past the end date', async () => {
    const consoleSpy = vi
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);
    const user = userEvent.setup();
    renderizar();

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
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should save the chosen period when confirming', async () => {
    const consoleSpy = vi
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);
    const user = userEvent.setup();
    renderizar();

    await escolherData(user, colunaInicio(), 17);
    await escolherHora(user, colunaInicio(), '15', '45');
    await escolherData(user, colunaTermino(), 17);
    await escolherHora(user, colunaTermino(), '18', '30');
    await user.click(botaoConfirmar());

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Dados salvos:', {
        dataInicio: '2026-01-17',
        horaInicio: '15:45',
        dataLimite: '2026-01-17',
        horaLimite: '18:30',
      });
    });
    expect(
      await screen.findByText('O questionário está no ar'),
    ).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('should render the three section titles, without collapsing', () => {
    renderizar();

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

    expect(
      screen.getByRole('heading', { level: 2, name: 'Acme Inc.' }),
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

  it('should highlight the control panel in the menu', () => {
    renderizar();

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
