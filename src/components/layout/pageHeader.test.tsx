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

  // Ao lado do menu, mas fora dele: o idioma abre uma lista, o menu troca de
  // tela.
  it('shows the language menu next to the navigation, outside it', () => {
    render(<PageHeader title="Dashboard" />);

    const navegacao = screen.getByRole('navigation', { name: 'Navegação' });
    const idioma = screen.getByRole('button', { name: 'Idioma' });
    expect(navegacao).toBeVisible();
    expect(navegacao).not.toContainElement(idioma);
    expect(
      idioma.compareDocumentPosition(navegacao) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('does not show the header language menu when navigation is hidden', () => {
    render(<PageHeader title="Sobre" showNavMenu={false} />);

    expect(screen.queryByRole('button', { name: 'Idioma' })).toBeNull();
  });
});
