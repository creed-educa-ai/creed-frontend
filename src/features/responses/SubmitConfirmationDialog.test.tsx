import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubmitConfirmationDialog } from './SubmitConfirmationDialog';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

describe('SubmitConfirmationDialog', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('chama onConfirm ao confirmar o envio', async () => {
    const onConfirm = vi.fn();
    render(
      <SubmitConfirmationDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Confirmar envio' }),
    );

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('fecha pelo Cancelar', async () => {
    const onOpenChange = vi.fn();
    render(
      <SubmitConfirmationDialog
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('não fecha com Esc nem com clique fora: destaca o Confirmar envio', async () => {
    const onOpenChange = vi.fn();
    render(
      <SubmitConfirmationDialog
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={vi.fn()}
      />,
    );

    await userEvent.keyboard('{Escape}');
    const confirmar = screen.getByRole('button', { name: 'Confirmar envio' });
    expect(confirmar).toHaveFocus();

    const overlay = document.querySelector(
      '[data-slot="alert-dialog-overlay"]',
    );
    if (!overlay) throw new Error('overlay não encontrado');
    await userEvent.click(overlay);

    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(confirmar).toHaveFocus();
  });
});
