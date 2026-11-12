import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '@/i18n/config';
import { AwaitingConfirmationView } from './AwaitingConfirmationView';

beforeEach(async () => {
  await i18n.changeLanguage('pt-BR');
});

describe('AwaitingConfirmationView', () => {
  it('mostra o título e a mensagem de espera', () => {
    render(
      <MemoryRouter>
        <AwaitingConfirmationView />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'Aguarde confirmação' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/recebemos o cadastro da sua empresa/i),
    ).toBeInTheDocument();
  });

  // Quem cadastrou ainda não tem senha: o texto diz que o link chega por
  // e-mail e aponta o "Esqueci minha senha", com o rótulo que o link tem na
  // tela de login do mesmo idioma.
  it.each([
    { idioma: 'pt-BR', email: 'e-mail' },
    { idioma: 'en', email: 'email' },
    { idioma: 'es', email: 'correo electrónico' },
  ])(
    'em $idioma, cita o e-mail e o "Esqueci minha senha" do login',
    async ({ idioma, email }) => {
      await i18n.changeLanguage(idioma);
      render(
        <MemoryRouter>
          <AwaitingConfirmationView />
        </MemoryRouter>,
      );

      const mensagem = screen.getByText(i18n.t('aguardeConfirmacao:mensagem'));
      expect(mensagem).toHaveTextContent(email);
      expect(mensagem).toHaveTextContent(
        i18n.t('autenticacao:login.esqueciSenha'),
      );
    },
  );

  it('o botão Voltar aponta para a tela inicial', () => {
    render(
      <MemoryRouter>
        <AwaitingConfirmationView />
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
        <AwaitingConfirmationView />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('link', { name: 'O que é o método CREED?' }),
    ).toHaveAttribute('href', '/about');
  });
});
