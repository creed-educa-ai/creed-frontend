import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { PainelControleView } from './PainelControleView';
import organizationsReducer from '@/features/organizations/organizationsSlice';
import { resetMembersMock } from '@/features/organizations/organizationsApi';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

// A seção de membros lê e carrega a lista pelo slice de organizations.
function renderizar() {
  const store = configureStore({
    reducer: { organizations: organizationsReducer },
  });

  return render(
    <Provider store={store}>
      <PainelControleView />
    </Provider>,
  );
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

describe('PainelControleView', () => {
  // "Hoje" fixo: sábado, 10/01/2026. Só o Date é falso; os timers seguem reais.
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 0, 10, 10, 0));
    resetMembersMock();
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render the organization name and the translated title', async () => {
    renderizar();

    expect(await screen.findByText('Acme Inc.')).toBeInTheDocument();
    expect(
      screen.getByText(i18n.t('painelControle:subtitulo')),
    ).toBeInTheDocument();
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

    // Clicar num dia bloqueado não seleciona nada: o botão continua com o aviso.
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
    // "09": em inglês a hora 15 teria o mesmo nome do minuto 15.
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

    consoleSpy.mockRestore();
  });

  it('should render the three section titles, without collapsing', async () => {
    renderizar();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: i18n.t('painelControle:adicionarMembro'),
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: i18n.t('painelControle:gerenciar'),
      }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: 'Membros de Acme Inc.',
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: i18n.t('painelControle:gerenciar'),
      }),
    ).not.toBeInTheDocument();
  });

  it('should list the organization members', async () => {
    renderizar();

    expect(await screen.findByText('Enner Valência')).toBeInTheDocument();
  });

  it('should highlight the control panel in the menu', () => {
    renderizar();

    expect(
      screen.getByRole('button', {
        name: i18n.t('formulario:menuPainelControle'),
      }),
    ).toHaveAttribute('aria-current', 'page');
    expect(
      screen.getByRole('button', { name: i18n.t('formulario:menuPainel') }),
    ).not.toHaveAttribute('aria-current');
  });
});
