// Primeiro teste de componente do projeto — molde para os próximos: render da
// Testing Library + userEvent, sem tocar em detalhe de implementação.
import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n, { IDIOMA_PADRAO } from '@/i18n';
import { SeletorIdioma } from '@/components/SeletorIdioma';

describe('SeletorIdioma', () => {
  // Antes do render, não depois: trocar o idioma com o componente ainda
  // montado dispara update fora de act() e polui a saída do teste.
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('troca o idioma da interface no clique', async () => {
    render(<SeletorIdioma />);

    await userEvent.click(screen.getByRole('button', { name: 'Inglês' }));

    expect(i18n.resolvedLanguage).toBe('en');
    // Os próprios rótulos do seletor mudam de idioma junto.
    expect(
      await screen.findByRole('button', { name: 'Portuguese' }),
    ).toBeInTheDocument();
  });

  it('marca o idioma ativo para leitores de tela', () => {
    render(<SeletorIdioma />);

    expect(screen.getByRole('button', { name: 'Português' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Inglês' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});
