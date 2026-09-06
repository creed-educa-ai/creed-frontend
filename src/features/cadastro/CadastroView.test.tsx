import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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
  });

  it('mostra erro nos campos obrigatórios ao submeter vazio', async () => {
    renderizar();

    await userEvent.click(screen.getByRole('button', { name: 'Avançar' }));

    expect(screen.getAllByText('Campo obrigatório')).toHaveLength(5);
  });
});
