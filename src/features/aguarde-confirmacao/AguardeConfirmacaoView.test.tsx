import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '@/i18n/config';
import { AguardeConfirmacaoView } from './AguardeConfirmacaoView';

beforeEach(async () => {
  await i18n.changeLanguage('pt-BR');
});

describe('AguardeConfirmacaoView', () => {
  it('mostra o título e a mensagem de espera', () => {
    render(
      <MemoryRouter>
        <AguardeConfirmacaoView />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'Aguarde confirmação' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/seus dados foram enviados e aguardam aprovação/i),
    ).toBeInTheDocument();
  });

  it('o botão Voltar aponta para a tela inicial', () => {
    render(
      <MemoryRouter>
        <AguardeConfirmacaoView />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Voltar' })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('o botão "saiba mais" aponta para a tela sobre o método', () => {
    render(
      <MemoryRouter>
        <AguardeConfirmacaoView />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('link', { name: 'O que é o método CREED?' }),
    ).toHaveAttribute('href', '/sobre');
  });
});
