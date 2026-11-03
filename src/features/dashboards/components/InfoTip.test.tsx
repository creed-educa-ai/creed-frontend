import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { InfoTip } from './InfoTip';

describe('InfoTip', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('nomeia o botão pelo título do card', () => {
    render(<InfoTip title="Variação por prisma" text="Explicação." />);

    expect(
      screen.getByRole('button', { name: 'Sobre: Variação por prisma' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('abre no toque, para funcionar no celular, e fecha com Esc', async () => {
    const user = userEvent.setup();
    render(<InfoTip title="Variação por prisma" text="Explicação." />);

    await user.click(
      screen.getByRole('button', { name: 'Sobre: Variação por prisma' }),
    );
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Explicação.');

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
