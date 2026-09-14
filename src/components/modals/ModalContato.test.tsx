import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalContato } from './ModalContato';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

describe('ModalContato', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('mostra e-mail e telefone quando aberto', () => {
    render(<ModalContato open={true} onOpenChange={vi.fn()} />);

    expect(screen.getByText('naira.libermann@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('+55 (51) 9961.4494')).toBeInTheDocument();
  });

  it('não renderiza quando fechado', () => {
    render(<ModalContato open={false} onOpenChange={vi.fn()} />);

    expect(
      screen.queryByText('naira.libermann@gmail.com'),
    ).not.toBeInTheDocument();
  });

  it('traduz os rótulos ao trocar de idioma', async () => {
    await i18n.changeLanguage('en');
    render(<ModalContato open={true} onOpenChange={vi.fn()} />);

    expect(screen.getByText('Contact us')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
  });

  it('pede o fechamento ao apertar Escape', async () => {
    const aoMudarAbertura = vi.fn();
    render(<ModalContato open={true} onOpenChange={aoMudarAbertura} />);

    await userEvent.keyboard('{Escape}');

    expect(aoMudarAbertura).toHaveBeenCalledWith(false);
  });
});
