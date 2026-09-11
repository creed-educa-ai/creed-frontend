import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { LoginView } from '@/features/login/LoginView';
import { store } from '@/app/store';

function renderizar() {
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

    expect(screen.getAllByText('Campo obrigatório')).toHaveLength(2);
  });
});
