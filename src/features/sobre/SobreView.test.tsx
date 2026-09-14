import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SobreView } from '@/features/sobre/SobreView';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

describe('SobreView', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  function renderizar() {
    return render(
      <MemoryRouter>
        <SobreView />
      </MemoryRouter>,
    );
  }

  it('renderiza o título e o texto da tela', () => {
    renderizar();

    expect(screen.getByText('Sobre')).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('Lorem ipsum')),
    ).toBeInTheDocument();
  });

  it('traduz os textos da tela ao trocar de idioma', async () => {
    await i18n.changeLanguage('en');
    renderizar();

    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
  });
});
