import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BoasVindasView } from '@/features/boas-vindas/BoasVindasView';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

describe('BoasVindasView', () => {
  // Antes do render, não depois: no jsdom o detector resolve o idioma do
  // `navigator` (en), então o teste fixa o padrão em vez de depender dele.
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('renderiza o título de boas-vindas', () => {
    render(<BoasVindasView />);
    expect(screen.getByText('Bem vindo!')).toBeInTheDocument();
  });

  it('traduz os textos da tela ao trocar de idioma', async () => {
    await i18n.changeLanguage('en');
    render(<BoasVindasView />);

    expect(screen.getByText('Welcome!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });
});
