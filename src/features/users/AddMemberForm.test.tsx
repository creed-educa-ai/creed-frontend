import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { vi } from 'vitest';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { AddMemberForm } from '@/features/users/AddMemberForm';
import {
  INVITE_EMAIL_TAKEN,
  INVITE_FAILED,
} from '@/features/users/addMemberSchema';

function renderForm(onSubmit = vi.fn(), withRole = true) {
  render(<AddMemberForm onSubmit={onSubmit} withRole={withRole} />);
  return { onSubmit };
}

async function preencher(user: UserEvent, campo: string, valor: string) {
  await user.click(screen.getByLabelText(campo));
  await user.paste(valor);
}

describe('AddMemberForm', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('renderiza nome, e-mail, função e o botão de adicionar', () => {
    renderForm();

    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Insira um nome')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Insira um e-mail')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Função' })).toHaveTextContent(
      'Respondente',
    );
    expect(
      screen.getByRole('button', { name: 'Adicionar' }),
    ).toBeInTheDocument();
  });

  it('mostra o erro de cada campo ao enviar vazio, sem entregar nada', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(
      await screen.findByText('Digite um nome de 2 a 200 caracteres.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Digite um e-mail válido.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('bloqueia nome com um caractere e mostra o erro no campo', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await preencher(user, 'Nome', 'A');
    await preencher(user, 'E-mail', 'ana@empresa.com.br');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Digite um nome de 2 a 200 caracteres.',
    );
    expect(screen.getByLabelText('Nome')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('bloqueia e-mail inválido e mostra o erro', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await preencher(user, 'Nome', 'Ana Souza');
    await preencher(user, 'E-mail', 'isso-nao-e-email');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Digite um e-mail válido.',
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('sem a função, entrega respondente e deixa só o Adicionar na linha', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm(vi.fn(), false);

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    await preencher(user, 'Nome', 'Ana Souza');
    await preencher(user, 'E-mail', 'ana@exemplo.com');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Ana Souza',
        email: 'ana@exemplo.com',
        role: 'respondente',
      });
    });
  });

  it('entrega nome, e-mail e função e limpa os campos quando é válido', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await preencher(user, 'Nome', '  Ana Souza ');
    await preencher(user, 'E-mail', 'ana@empresa.com.br');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Ana Souza',
      email: 'ana@empresa.com.br',
      role: 'respondente',
    });
    await waitFor(() => {
      expect(screen.getByLabelText('E-mail')).toHaveValue('');
    });
    expect(screen.getByLabelText('Nome')).toHaveValue('');
  });

  it('mantém o que foi digitado quando quem recebeu os dados falha', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error('falhou'));
    renderForm(onSubmit);

    await preencher(user, 'Nome', 'Ana Souza');
    await preencher(user, 'E-mail', 'ana@empresa.com.br');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
    expect(screen.getByLabelText('Nome')).toHaveValue('Ana Souza');
    expect(screen.getByLabelText('E-mail')).toHaveValue('ana@empresa.com.br');
    // Erro que não é do convite não mostra mensagem: é de quem chamou.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('e-mail que já tem acesso: o erro vai para o campo e-mail', async () => {
    const user = userEvent.setup();
    renderForm(vi.fn().mockRejectedValue(INVITE_EMAIL_TAKEN), false);

    await preencher(user, 'Nome', 'Ana Souza');
    await preencher(user, 'E-mail', 'ana@empresa.com.br');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(
      await screen.findByText('Este e-mail já tem acesso à plataforma.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByLabelText('E-mail')).toHaveValue('ana@empresa.com.br');
  });

  it('convite que não saiu: a mensagem fica embaixo do formulário', async () => {
    const user = userEvent.setup();
    renderForm(vi.fn().mockRejectedValue(INVITE_FAILED), false);

    await preencher(user, 'Nome', 'Ana Souza');
    await preencher(user, 'E-mail', 'ana@empresa.com.br');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível enviar o convite. Tente de novo.',
    );
    expect(screen.getByLabelText('E-mail')).not.toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByLabelText('Nome')).toHaveValue('Ana Souza');
  });

  it('troca os textos quando o idioma muda', async () => {
    await i18n.changeLanguage('en');
    renderForm();

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Role' })).toHaveTextContent(
      'Respondent',
    );
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });
});
