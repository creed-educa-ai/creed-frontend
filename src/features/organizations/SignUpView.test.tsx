import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import organizationsReducer from '@/features/organizations/organizationsSlice';
import { SignUpView } from '@/features/organizations/SignUpView';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import userEvent from '@testing-library/user-event';
import { lastCall, stubFetch } from '@/test/stubFetch';

const DOCUMENTO_JA_CADASTRADO = 'Já existe um cadastro com este documento.';
const TENTE_DE_NOVO =
  'Não foi possível enviar o cadastro agora. Tente novamente.';

const RESPOSTA_201 = {
  id: '5a1e9c3b-2f7d-4b8a-9e6c-0d4f1b2a3c5e',
  name: 'Empresa Teste',
  address: '[A informar]',
  document_id: '3b2f8c1a-6d4e-4f7a-9c5b-1e0d2a8f6b94',
  status: 'pending',
  email: 'gestora@empresa.com.br',
  contact_name: 'Gestora Teste',
  phone: '51 99999-0000',
  document: { type: 'cnpj', value: '12345678000190' },
  created_at: '2026-11-10T14:30:00Z',
  updated_at: null,
};

function novoStore() {
  return configureStore({ reducer: { organizations: organizationsReducer } });
}

// Com a rota de aguarde ao lado: é assim que se vê se a tela saiu do lugar.
function renderizar(store = novoStore()) {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/sign-up']}>
        <Routes>
          <Route path="/sign-up" element={<SignUpView />} />
          <Route
            path="/awaiting-confirmation"
            element={<p>tela de aguarde</p>}
          />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

async function preencher({
  nomeEmpresa = 'Empresa Teste',
  documento = '12.345.678/0001-90',
  email = 'gestora@empresa.com.br',
  nomeCompleto = 'Gestora Teste',
  telefone = '51 99999-0000',
} = {}) {
  await userEvent.type(screen.getByLabelText('Nome da empresa'), nomeEmpresa);
  await userEvent.type(
    screen.getByLabelText('Documento (CPF/CNPJ)'),
    documento,
  );
  await userEvent.type(screen.getByLabelText('E-mail da empresa'), email);
  await userEvent.type(
    screen.getByLabelText('Seu nome completo'),
    nomeCompleto,
  );
  await userEvent.type(screen.getByLabelText('Telefone'), telefone);
}

async function avancar() {
  await userEvent.click(screen.getByRole('button', { name: 'Avançar' }));
}

describe('SignUpView', () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renderiza os cinco campos do formulário', () => {
    renderizar();

    expect(screen.getByLabelText('Nome da empresa')).toBeInTheDocument();
    expect(screen.getByLabelText('Documento (CPF/CNPJ)')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail da empresa')).toBeInTheDocument();
    expect(screen.getByLabelText('Seu nome completo')).toBeInTheDocument();
    expect(screen.getByLabelText('Telefone')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Ir para a tela de boas-vindas' }),
    ).toHaveAttribute('href', '/');
  });

  it('mostra erro nos campos obrigatórios ao submeter vazio, sem chamar o back', async () => {
    const fetchMock = stubFetch(201, RESPOSTA_201);
    renderizar();

    await avancar();

    // O e-mail vazio cai na regra de formato, como no login.
    expect(await screen.findAllByText('Campo obrigatório')).toHaveLength(4);
    expect(screen.getByText('Digite um e-mail válido.')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('manda o cadastro com os nomes do back e vai para a tela de aguarde no 201', async () => {
    const fetchMock = stubFetch(201, RESPOSTA_201);
    renderizar();

    await preencher();
    await avancar();

    expect(await screen.findByText('tela de aguarde')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(lastCall(fetchMock)).toEqual({
      url: '/api/v1/organizations/sign-up',
      method: 'POST',
      // O documento vai como foi digitado: quem guarda só os dígitos é o back.
      body: {
        name: 'Empresa Teste',
        document: '12.345.678/0001-90',
        email: 'gestora@empresa.com.br',
        contact_name: 'Gestora Teste',
        phone: '51 99999-0000',
      },
    });
  });

  it('põe no campo "Documento" o 409 de documento já cadastrado e não sai da tela', async () => {
    stubFetch(409, { detail: 'Já existe um cadastro com este documento' });
    renderizar();

    await preencher();
    await avancar();

    // Um alerta só, o do campo: o 409 não se repete no aviso do formulário.
    expect(await screen.findByRole('alert')).toHaveTextContent(
      DOCUMENTO_JA_CADASTRADO,
    );
    expect(screen.getByLabelText('Documento (CPF/CNPJ)')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.queryByText(TENTE_DE_NOVO)).not.toBeInTheDocument();
    expect(screen.queryByText('tela de aguarde')).not.toBeInTheDocument();
  });

  it.each([
    { caso: '503', status: 503 },
    { caso: '422', status: 422 },
  ])(
    'mostra "tente de novo" abaixo do botão no $caso, com o formulário preenchido',
    async ({ status }) => {
      stubFetch(status, { detail: 'erro' });
      renderizar();

      await preencher();
      await avancar();

      expect(await screen.findByRole('alert')).toHaveTextContent(TENTE_DE_NOVO);
      expect(screen.getByLabelText('Nome da empresa')).toHaveValue(
        'Empresa Teste',
      );
      expect(screen.getByLabelText('Documento (CPF/CNPJ)')).toHaveValue(
        '12.345.678/0001-90',
      );
      expect(screen.queryByText('tela de aguarde')).not.toBeInTheDocument();
    },
  );

  it('mostra "tente de novo" quando a rede falha antes de chegar ao back', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    );
    renderizar();

    await preencher();
    await avancar();

    expect(await screen.findByRole('alert')).toHaveTextContent(TENTE_DE_NOVO);
  });

  it('barra o documento "123" e o e-mail "abc" sem chamar o back', async () => {
    const fetchMock = stubFetch(201, RESPOSTA_201);
    renderizar();

    await preencher({ documento: '123', email: 'abc' });
    await avancar();

    expect(
      await screen.findByText(
        'Digite um CPF (11 dígitos) ou um CNPJ (14 dígitos).',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Digite um e-mail válido.')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('não mostra o aviso de um envio anterior ao voltar à tela, na mesma store', async () => {
    stubFetch(503, { detail: 'erro' });
    const store = novoStore();
    const primeiraVisita = renderizar(store);
    await preencher();
    await avancar();
    expect(await screen.findByRole('alert')).toHaveTextContent(TENTE_DE_NOVO);

    primeiraVisita.unmount();
    renderizar(store);

    expect(screen.queryByText(TENTE_DE_NOVO)).not.toBeInTheDocument();
  });
});
