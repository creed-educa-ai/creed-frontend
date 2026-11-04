import { render, screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ManageQuestionnaireDialog } from '@/features/forms/ManageQuestionnaireDialog';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

function renderizar() {
  const onClose = vi.fn();
  const onSave = vi.fn();
  render(
    <ManageQuestionnaireDialog
      open={true}
      onClose={onClose}
      personName="Ana Souza"
      onSave={onSave}
    />,
  );
  return { onClose, onSave };
}

// Mesmos atalhos do teste do painel da empresa: o formulário é o mesmo.
function coluna(rotulo: string) {
  const elemento = screen.getByText(rotulo).parentElement;
  if (!elemento) throw new Error(`Coluna "${rotulo}" não encontrada`);
  return elemento;
}

async function escolherData(user: UserEvent, col: HTMLElement, dia: number) {
  await user.click(
    within(col).getByRole('button', {
      name: i18n.t('painelControle:selecionarData'),
    }),
  );
  const botao = screen.getByText(String(dia)).closest('button');
  if (!botao) throw new Error(`Dia ${String(dia)} não encontrado`);
  await user.click(botao);
}

async function escolherHora(
  user: UserEvent,
  col: HTMLElement,
  hora: string,
  minuto: string,
) {
  await user.click(
    within(col).getByRole('button', {
      name: i18n.t('painelControle:selecionarHora'),
    }),
  );
  await user.click(screen.getByRole('button', { name: `${hora}h` }));
  await user.click(screen.getByRole('button', { name: minuto }));
}

const botaoConfirmar = () =>
  screen.getByRole('button', { name: i18n.t('painelControle:confirmar') });

describe('ManageQuestionnaireDialog', () => {
  // "Hoje" fixo: sábado, 10/01/2026. Só o Date é falso; os timers seguem reais.
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 0, 10, 10, 0));
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('mostra para quem é o questionário, com um só Confirmar, no rodapé', () => {
    renderizar();

    expect(
      screen.getByRole('heading', { name: 'Questionário de Ana Souza' }),
    ).toBeInTheDocument();
    // O Confirmar de dentro do ManageQuestionnaire não aparece no modal.
    expect(
      screen.getAllByRole('button', {
        name: i18n.t('painelControle:confirmar'),
      }),
    ).toHaveLength(1);
  });

  it('não salva com o formulário vazio: mostra os erros', async () => {
    const user = userEvent.setup();
    const { onSave } = renderizar();

    await user.click(botaoConfirmar());

    expect(
      await screen.findByText(i18n.t('painelControle:erros.inicioObrigatorio')),
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('salva o período escolhido', async () => {
    const user = userEvent.setup();
    const { onSave } = renderizar();
    const inicio = () => coluna(i18n.t('painelControle:inicio'));
    const termino = () => coluna(i18n.t('painelControle:termino'));

    await escolherData(user, inicio(), 17);
    await escolherHora(user, inicio(), '15', '45');
    await escolherData(user, termino(), 17);
    await escolherHora(user, termino(), '18', '30');
    await user.click(botaoConfirmar());

    expect(onSave).toHaveBeenCalledWith({
      dataInicio: '2026-01-17',
      horaInicio: '15:45',
      dataLimite: '2026-01-17',
      horaLimite: '18:30',
    });
  });

  it('Cancelar fecha sem salvar', async () => {
    const user = userEvent.setup();
    const { onClose, onSave } = renderizar();

    await user.click(
      screen.getByRole('button', { name: i18n.t('comum:acoes.cancelar') }),
    );

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });
});
