import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { AlterarSenhaView } from '@/features/autenticacao/AlterarSenhaView';

describe('AlterarSenhaView', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('mostra as mensagens de erro ao enviar os campos vazios', async () => {
    render(<AlterarSenhaView />);

    await userEvent.click(screen.getByRole('button', { name: 'Avançar' }));

    expect(
      await screen.findByText('A senha precisa ter pelo menos 8 caracteres.'),
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Confirme a nova senha.'),
    ).toBeInTheDocument();
  });

  it('mostra erro quando as senhas não coincidem', async () => {
    render(<AlterarSenhaView />);

    await userEvent.type(
      screen.getByLabelText('Insira uma nova senha'),
      'senha1234',
    );
    await userEvent.type(
      screen.getByLabelText('Confirme sua nova senha'),
      'senha-diferente',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Avançar' }));

    expect(
      await screen.findByText('As senhas não coincidem.'),
    ).toBeInTheDocument();
  });

  it('valida e segue quando as duas senhas coincidem', async () => {
    const infoEspiao = vi
      .spyOn(console, 'info')
      .mockImplementation(() => undefined);
    render(<AlterarSenhaView />);

    await userEvent.type(
      screen.getByLabelText('Insira uma nova senha'),
      'senha1234',
    );
    await userEvent.type(
      screen.getByLabelText('Confirme sua nova senha'),
      'senha1234',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Avançar' }));

    expect(infoEspiao).toHaveBeenCalledWith(expect.any(String), {
      novaSenha: 'senha1234',
      confirmarSenha: 'senha1234',
    });
    expect(
      screen.queryByText('As senhas não coincidem.'),
    ).not.toBeInTheDocument();

    infoEspiao.mockRestore();
  });
});
