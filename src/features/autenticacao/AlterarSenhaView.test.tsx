import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { AlterarSenhaView } from '@/features/autenticacao/AlterarSenhaView';

// O layout com navegação (voltar e logo) usa o roteador.
function renderizar() {
  return render(
    <MemoryRouter>
      <AlterarSenhaView />
    </MemoryRouter>,
  );
}

describe('AlterarSenhaView', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  // O que cada controle faz está coberto em authLayout.test.tsx.
  it('mostra a seta de voltar e o logo que leva ao início', () => {
    renderizar();

    expect(screen.getByRole('button', { name: 'Voltar' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Ir para a tela de boas-vindas' }),
    ).toBeInTheDocument();
  });

  it('mostra as mensagens de erro ao enviar os campos vazios', async () => {
    renderizar();

    await userEvent.click(screen.getByRole('button', { name: 'Avançar' }));

    expect(
      await screen.findByText('A senha precisa ter pelo menos 8 caracteres.'),
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Confirme a nova senha.'),
    ).toBeInTheDocument();
  });

  it('mostra erro quando as senhas não coincidem', async () => {
    renderizar();

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
    renderizar();

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
