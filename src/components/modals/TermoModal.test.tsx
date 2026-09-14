import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TermoModal } from '@/components/modals/TermoModal';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

describe('TermoModal', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('renderiza o título e o corpo do termo quando aberto', () => {
    render(
      <TermoModal open={true} onOpenChange={vi.fn()} onAccept={vi.fn()} />,
    );

    expect(screen.getByRole('heading')).toHaveTextContent(/consentimento/i);
    expect(screen.getByText(/termo/i)).toBeInTheDocument();
  });

  it('chama onAccept e fecha o modal ao aceitar', () => {
    const onOpenChange = vi.fn();
    const onAccept = vi.fn();

    render(
      <TermoModal
        open={true}
        onOpenChange={onOpenChange}
        onAccept={onAccept}
      />,
    );

    screen.getByRole('button', { name: 'Aceitar' }).click();

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it('fecha o modal sem chamar onAccept ao recusar', () => {
    const onOpenChange = vi.fn();
    const onAccept = vi.fn();

    render(
      <TermoModal
        open={true}
        onOpenChange={onOpenChange}
        onAccept={onAccept}
      />,
    );

    screen.getByRole('button', { name: 'Recusar' }).click();

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onAccept).not.toHaveBeenCalled();
  });

  it('chama onDecline só ao recusar', () => {
    const onDecline = vi.fn();

    render(
      <TermoModal
        open={true}
        onOpenChange={vi.fn()}
        onAccept={vi.fn()}
        onDecline={onDecline}
      />,
    );

    screen.getByRole('button', { name: 'Aceitar' }).click();
    expect(onDecline).not.toHaveBeenCalled();

    screen.getByRole('button', { name: 'Recusar' }).click();
    expect(onDecline).toHaveBeenCalledTimes(1);
  });

  it('associa o modal ao texto do termo para acessibilidade', () => {
    render(
      <TermoModal open={true} onOpenChange={vi.fn()} onAccept={vi.fn()} />,
    );

    const dialog = screen.getByRole('alertdialog');
    const descriptionId = dialog.getAttribute('aria-describedby');

    expect(descriptionId).toBeTruthy();
    expect(document.getElementById(descriptionId!)).toBeInTheDocument();
  });
});
