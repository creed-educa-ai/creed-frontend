import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
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

  // As telas de destino viram só um texto: o que se testa aqui é para onde o
  // botão leva, não a tela que abre.
  it.each([
    ['Entrar', 'tela de login'],
    ['Criar Conta', 'tela de cadastro'],
    ['Saiba mais sobre a plataforma', 'tela sobre'],
  ])('o botão "%s" leva à %s', async (botao, destino) => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<BoasVindasView />} />
          <Route path="/login" element={<p>tela de login</p>} />
          <Route path="/cadastro" element={<p>tela de cadastro</p>} />
          <Route path="/sobre" element={<p>tela sobre</p>} />
        </Routes>
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole('button', { name: botao }));

    expect(screen.getByText(destino)).toBeInTheDocument();
  });
});
