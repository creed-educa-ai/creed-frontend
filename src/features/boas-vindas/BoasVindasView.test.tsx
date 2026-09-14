import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BoasVindasView } from '@/features/boas-vindas/BoasVindasView';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

describe('BoasVindasView', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('renderiza o título de boas-vindas', () => {
    render(
      <MemoryRouter>
        <BoasVindasView />
      </MemoryRouter>,
    );
    expect(screen.getByText('Bem vindo!')).toBeInTheDocument();
  });

  it('traduz os textos da tela ao trocar de idioma', async () => {
    await i18n.changeLanguage('en');
    render(
      <MemoryRouter>
        <BoasVindasView />
      </MemoryRouter>,
    );

    expect(screen.getByText('Welcome!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });
});
