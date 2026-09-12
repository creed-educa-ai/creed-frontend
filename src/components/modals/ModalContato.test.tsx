import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModalContato } from './ModalContato';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

describe('ModalContato', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('should render email and phone when open', () => {
    render(<ModalContato open={true} onOpenChange={vi.fn()} />);

    expect(screen.getByText('naira.libermann@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('+55 (51) 9961.4494')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<ModalContato open={false} onOpenChange={vi.fn()} />);

    expect(
      screen.queryByText('naira.libermann@gmail.com'),
    ).not.toBeInTheDocument();
  });
});
