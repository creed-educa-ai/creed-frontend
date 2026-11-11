import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HeaderLanguageMenu } from '@/components/HeaderLanguageMenu';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

describe('HeaderLanguageMenu', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('shows the current language and lets the user change it', async () => {
    const user = userEvent.setup();
    render(<HeaderLanguageMenu />);

    expect(screen.getByRole('button', { name: 'Idioma' })).toHaveTextContent(
      'Português',
    );

    await user.click(screen.getByRole('button', { name: 'Idioma' }));
    await user.click(screen.getByRole('menuitemradio', { name: 'Inglês' }));

    expect(i18n.resolvedLanguage).toBe('en');
    expect(
      await screen.findByRole('button', { name: 'Language' }),
    ).toHaveTextContent('English');
  });
});
