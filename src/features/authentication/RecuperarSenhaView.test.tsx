import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { RecuperarSenhaView } from '@/features/authentication/RecuperarSenhaView';
import authenticationReducer from '@/features/authentication/authenticationSlice';
import { authenticationApi } from '@/features/authentication/authenticationApi';
import { ApiError } from '@/lib/apiClient';

const MENSAGEM_NEUTRA =
  'Se este e-mail tiver acesso, enviamos um link para definir uma nova senha.';
const TENTE_DE_NOVO = 'Não foi possível enviar o link agora. Tente novamente.';

// Store só com o reducer que esta tela usa (como no LoginView.test.tsx). O
// layout com navegação usa o roteador.
function criarStore(passwordReset?: {
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
}) {
  return configureStore({
    reducer: { authentication: authenticationReducer },
    preloadedState: passwordReset && {
      authentication: {
        user: null,
        status: 'idle',
        error: null,
        passwordReset,
      },
    },
  });
}

// Uma store nova por teste, salvo quando o teste passa a dele: é assim que se
// reproduz o app, onde o store é um só e sobrevive à troca de tela.
function renderizar(store = criarStore()) {
  return render(
    <MemoryRouter>
      <Provider store={store}>
        <RecuperarSenhaView />
      </Provider>
    </MemoryRouter>,
  );
}

async function pedirLink(email: string) {
  await userEvent.type(screen.getByLabelText('E-mail'), email);
  await userEvent.click(screen.getByRole('button', { name: 'Enviar link' }));
}

describe('RecuperarSenhaView', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('pede só o e-mail: não há campo de senha', () => {
    const { container } = renderizar();

    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Enviar link' }),
    ).toBeInTheDocument();
    expect(container.querySelector('input[type="password"]')).toBeNull();
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeInTheDocument();
  });

  it('mostra o erro no campo e não chama a API quando o e-mail é inválido', async () => {
    const pedido = vi.spyOn(authenticationApi, 'requestPasswordReset');
    renderizar();

    await pedirLink('isso-nao-e-email');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Digite um e-mail válido.',
    );
    expect(screen.getByLabelText('E-mail')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(pedido).not.toHaveBeenCalled();
  });

  it('pede o link com o e-mail e mostra a mensagem neutra no 204', async () => {
    const pedido = vi
      .spyOn(authenticationApi, 'requestPasswordReset')
      .mockResolvedValue(undefined);
    renderizar();

    await pedirLink('ana@empresa.com.br');

    expect(await screen.findByRole('status')).toHaveTextContent(
      MENSAGEM_NEUTRA,
    );
    expect(pedido).toHaveBeenCalledTimes(1);
    expect(pedido).toHaveBeenCalledWith({ email: 'ana@empresa.com.br' });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('mostra "tente de novo", e não a mensagem neutra, no 503', async () => {
    vi.spyOn(authenticationApi, 'requestPasswordReset').mockRejectedValue(
      new ApiError('Serviço indisponível', 503),
    );
    renderizar();

    await pedirLink('ana@empresa.com.br');

    expect(await screen.findByRole('alert')).toHaveTextContent(TENTE_DE_NOVO);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('mostra "tente de novo" quando a rede falha antes de chegar ao back', async () => {
    vi.spyOn(authenticationApi, 'requestPasswordReset').mockRejectedValue(
      new TypeError('Failed to fetch'),
    );
    renderizar();

    await pedirLink('ana@empresa.com.br');

    expect(await screen.findByRole('alert')).toHaveTextContent(TENTE_DE_NOVO);
  });

  it('põe no campo o 422 de um e-mail que o back recusou', async () => {
    vi.spyOn(authenticationApi, 'requestPasswordReset').mockRejectedValue(
      new ApiError('value is not a valid email address', 422),
    );
    renderizar();

    await pedirLink('ana@empresa.local');

    // Um alerta só, o do campo: o 422 não se repete no aviso do formulário.
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Digite um e-mail válido.',
    );
    expect(screen.getByLabelText('E-mail')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.queryByText(TENTE_DE_NOVO)).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('troca os textos quando o idioma muda', async () => {
    await i18n.changeLanguage('es');
    vi.spyOn(authenticationApi, 'requestPasswordReset').mockResolvedValue(
      undefined,
    );
    renderizar();

    expect(
      screen.getByRole('heading', { name: '¿Olvidaste tu contraseña?' }),
    ).toBeInTheDocument();
    await userEvent.type(
      screen.getByLabelText('Correo electrónico'),
      'ana@empresa.com.br',
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Enviar enlace' }),
    );

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Si este correo electrónico tiene acceso, enviamos un enlace para definir una nueva contraseña.',
    );
  });

  // O store do app é um só: o resultado de um pedido não pode reaparecer
  // quando a pessoa volta à tela sem ter enviado nada.
  describe('ao voltar à tela', () => {
    it('não mostra o resultado de um pedido anterior que ficou no store', () => {
      renderizar(criarStore({ status: 'ready', error: null }));

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('abre limpa depois de um envio com sucesso, na mesma store', async () => {
      vi.spyOn(authenticationApi, 'requestPasswordReset').mockResolvedValue(
        undefined,
      );
      const store = criarStore();
      const primeiraVisita = renderizar(store);
      await pedirLink('ana@empresa.com.br');
      expect(await screen.findByRole('status')).toHaveTextContent(
        MENSAGEM_NEUTRA,
      );

      primeiraVisita.unmount();
      renderizar(store);

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(screen.getByLabelText('E-mail')).toHaveValue('');
    });

    it('abre limpa depois de um 503, na mesma store', async () => {
      vi.spyOn(authenticationApi, 'requestPasswordReset').mockRejectedValue(
        new ApiError('Serviço indisponível', 503),
      );
      const store = criarStore();
      const primeiraVisita = renderizar(store);
      await pedirLink('ana@empresa.com.br');
      expect(await screen.findByRole('alert')).toHaveTextContent(TENTE_DE_NOVO);

      primeiraVisita.unmount();
      renderizar(store);

      expect(screen.queryByText(TENTE_DE_NOVO)).not.toBeInTheDocument();
    });
  });

  it('tira a mensagem neutra quando o envio seguinte é barrado pelo zod', async () => {
    const pedido = vi
      .spyOn(authenticationApi, 'requestPasswordReset')
      .mockResolvedValue(undefined);
    renderizar();
    await pedirLink('ana@empresa.com.br');
    expect(await screen.findByRole('status')).toHaveTextContent(
      MENSAGEM_NEUTRA,
    );

    await userEvent.clear(screen.getByLabelText('E-mail'));
    await pedirLink('isso-nao-e-email');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Digite um e-mail válido.',
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(pedido).toHaveBeenCalledTimes(1);
  });
});
