import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { LoginView } from '@/features/login/LoginView';
import authReducer from '@/features/login/loginSlice';

// 🟡 Premissa P-013 (creed-ai-context/decisoes/premissas.md) — store isolada
// por teste, só com o reducer que esta tela usa. Ver
// creed-ai-context/conventions/camadas-do-front.md § "Testando View
// conectada ao Redux".
function renderizar() {
  const store = configureStore({ reducer: { auth: authReducer } });
  return render(
    <MemoryRouter>
      <Provider store={store}>
        <LoginView />
      </Provider>
    </MemoryRouter>,
  );
}

describe('LoginView', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('renderiza os campos e as ações do login', () => {
    renderizar();

    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByText('Lembrar de mim')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Criar conta' })).toHaveAttribute(
      'href',
      '/cadastro',
    );
  });

  it('mostra erro nos campos obrigatórios ao submeter vazio', async () => {
    renderizar();

    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    // E-mail vazio não passa em z.email() e cai na mensagem de formato
    // inválido, não na de campo obrigatório — só a senha usa min(1).
    expect(screen.getByText('Digite um e-mail válido.')).toBeInTheDocument();
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
  });
});
