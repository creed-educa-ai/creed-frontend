import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import organizationsReducer from '@/features/organizations/organizationsSlice';
import { SignUpView } from '@/features/organizations/SignUpView';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import userEvent from '@testing-library/user-event';

function novoStore() {
  return configureStore({ reducer: { organizations: organizationsReducer } });
}

function renderizar() {
  return render(
    <Provider store={novoStore()}>
      <MemoryRouter>
        <SignUpView />
      </MemoryRouter>
    </Provider>,
  );
}

describe('SignUpView', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
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

  it('mostra erro nos campos obrigatórios ao submeter vazio', async () => {
    renderizar();

    await userEvent.click(screen.getByRole('button', { name: 'Avançar' }));

    expect(screen.getAllByText('Campo obrigatório')).toHaveLength(5);
  });

  it('leva à tela de aguarde confirmação depois de enviar', async () => {
    render(
      <Provider store={novoStore()}>
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

    await userEvent.type(screen.getByLabelText('Nome da empresa'), 'Empresa');
    await userEvent.type(
      screen.getByLabelText('Documento (CPF/CNPJ)'),
      '12345678000190',
    );
    // O campo é type="email": o próprio navegador barra o envio sem um e-mail
    // de formato válido, antes mesmo da validação do zod.
    await userEvent.type(
      screen.getByLabelText('E-mail da empresa'),
      'contato@empresa.com',
    );
    await userEvent.type(screen.getByLabelText('Seu nome completo'), 'Pessoa');
    await userEvent.type(screen.getByLabelText('Telefone'), '51999999999');
    await userEvent.click(screen.getByRole('button', { name: 'Avançar' }));

    // O timeout cobre a espera simulada de 1,5s do mock (organizationsApi).
    expect(
      await screen.findByText('tela de aguarde', {}, { timeout: 3000 }),
    ).toBeInTheDocument();
  });
});
