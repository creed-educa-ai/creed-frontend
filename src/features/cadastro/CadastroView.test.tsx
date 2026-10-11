import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CadastroView } from '@/features/cadastro/CadastroView';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import userEvent from '@testing-library/user-event';

function renderizar() {
  return render(
    <MemoryRouter>
      <CadastroView />
    </MemoryRouter>,
  );
}

describe('CadastroView', () => {
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
    const infoEspiao = vi
      .spyOn(console, 'info')
      .mockImplementation(() => undefined);
    render(
      <MemoryRouter initialEntries={['/cadastro']}>
        <Routes>
          <Route path="/cadastro" element={<CadastroView />} />
          <Route path="/aguarde-confirmacao" element={<p>tela de aguarde</p>} />
        </Routes>
      </MemoryRouter>,
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

    // O timeout cobre a espera simulada de 1,5s do envio (provisória).
    expect(
      await screen.findByText('tela de aguarde', {}, { timeout: 3000 }),
    ).toBeInTheDocument();

    infoEspiao.mockRestore();
  });
});
