import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { Toaster, toast } from '@/components/ui/sonner';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

describe('Toaster', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('mostra título e descrição, só com o botão de fechar', async () => {
    render(<Toaster />);

    act(() => {
      toast.success('Convite enviado', {
        description: 'ana@exemplo.com vai receber o convite por e-mail.',
      });
    });

    expect(await screen.findByText('Convite enviado')).toBeInTheDocument();
    expect(
      screen.getByText('ana@exemplo.com vai receber o convite por e-mail.'),
    ).toBeInTheDocument();
    // Sem "desfazer": o X é o único botão do toast.
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Fechar' })).toBeInTheDocument();
  });
});
