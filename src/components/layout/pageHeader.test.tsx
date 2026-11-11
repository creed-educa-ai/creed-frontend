import { render, screen } from '@testing-library/react';
import { PageHeader } from '@/components/layout/pageHeader';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

vi.mock('@/components/layout/navMenu', () => ({
  NavMenu: () => <nav aria-label="Navegação" />,
}));

describe('PageHeader', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('shows the language menu with the shared navigation', () => {
    render(<PageHeader title="Dashboard" />);

    expect(screen.getByRole('navigation', { name: 'Navegação' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Idioma' })).toHaveTextContent(
      'Português',
    );
  });

  it('does not show the header language menu when navigation is hidden', () => {
    render(<PageHeader title="Sobre" showNavMenu={false} />);

    expect(screen.queryByRole('button', { name: 'Idioma' })).toBeNull();
  });
});
