import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { PainelControleView } from './PainelControleView';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

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
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render the organization name and the translated title', () => {
    render(<PainelControleView />);

    expect(screen.getByText('ACME Inc.')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: i18n.t('painelControle:titulo'),
      }),
    ).toBeInTheDocument();
  });

  it('should show prompts instead of pre-filled dates and times', () => {
    render(<PainelControleView />);

    for (const col of [colunaInicio(), colunaTermino()]) {
      expect(botaoData(col)).toBeInTheDocument();
      expect(botaoHora(col)).toBeInTheDocument();
    }
  });

  it('should open the calendar when clicking the start date button', async () => {
    const user = userEvent.setup();
    render(<PainelControleView />);

    await user.click(botaoData(colunaInicio()));

    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('should block days before today in the start date calendar', async () => {
    const user = userEvent.setup();
    render(<PainelControleView />);

    await user.click(botaoData(colunaInicio()));

    expect(botaoDoDia(9)).toBeDisabled();
    expect(botaoDoDia(10)).toBeEnabled();

    // Clicar num dia bloqueado não seleciona nada: o botão continua com o aviso.
    await user.click(botaoDoDia(9));
    expect(botaoData(colunaInicio())).toBeInTheDocument();
  });

  it('should block days before the start date in the end date calendar', async () => {
    const user = userEvent.setup();
    render(<PainelControleView />);

    await escolherData(user, colunaInicio(), 17);
    await user.click(botaoData(colunaTermino()));

    expect(botaoDoDia(16)).toBeDisabled();
    expect(botaoDoDia(17)).toBeEnabled();
    expect(botaoDoDia(18)).toBeEnabled();
  });

  it('should show the calendar and the chosen date in Portuguese', async () => {
    const user = userEvent.setup();
    render(<PainelControleView />);

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
    render(<PainelControleView />);

    await user.click(botaoData(colunaInicio()));
    expect(screen.getByText(/january/i)).toBeInTheDocument();

    await user.click(botaoDoDia(17));
    expect(
      within(colunaInicio()).getByRole('button', { name: '01/17/2026' }),
    ).toBeInTheDocument();
  });

  it('should show the required errors and not save when the form is empty', async () => {
    const consoleSpy = vi
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);
    const user = userEvent.setup();
    render(<PainelControleView />);

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

  it('should show an error and not save when the end time is before the start time on the same day', async () => {
    const consoleSpy = vi
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);
    const user = userEvent.setup();
    render(<PainelControleView />);

    await escolherData(user, colunaInicio(), 17);
    await escolherHora(user, colunaInicio(), '15', '00');
    await escolherData(user, colunaTermino(), 17);
    await escolherHora(user, colunaTermino(), '09', '00');
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
    render(<PainelControleView />);

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
});
