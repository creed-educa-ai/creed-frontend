import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { vi } from 'vitest';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { AddMemberForm } from '@/features/organizations/AddMemberForm';

function renderForm(onSubmit = vi.fn()) {
  render(<AddMemberForm onSubmit={onSubmit} />);
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

    expect(screen.getByLabelText('Nome do membro')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Insira um nome')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail do membro')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Insira um e-mail')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Função' })).toHaveTextContent(
      'Respondente',
    );
    expect(
      screen.getByRole('button', { name: 'Adicionar membro' }),
    ).toBeInTheDocument();
  });

  it('mostra o erro de cada campo ao enviar vazio, sem entregar nada', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.click(screen.getByRole('button', { name: 'Adicionar membro' }));

    expect(
      await screen.findByText('Digite um nome de 2 a 200 caracteres.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Digite um e-mail válido.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('bloqueia nome com um caractere e mostra o erro no campo', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await preencher(user, 'Nome do membro', 'A');
    await preencher(user, 'E-mail do membro', 'ana@empresa.com.br');
    await user.click(screen.getByRole('button', { name: 'Adicionar membro' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Digite um nome de 2 a 200 caracteres.',
    );
    expect(screen.getByLabelText('Nome do membro')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('bloqueia e-mail inválido e mostra o erro', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await preencher(user, 'Nome do membro', 'Ana Souza');
    await preencher(user, 'E-mail do membro', 'isso-nao-e-email');
    await user.click(screen.getByRole('button', { name: 'Adicionar membro' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Digite um e-mail válido.',
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('entrega nome, e-mail e função e limpa os campos quando é válido', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await preencher(user, 'Nome do membro', '  Ana Souza ');
    await preencher(user, 'E-mail do membro', 'ana@empresa.com.br');
    await user.click(screen.getByRole('button', { name: 'Adicionar membro' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Ana Souza',
      email: 'ana@empresa.com.br',
      role: 'respondente',
    });
    await waitFor(() => {
      expect(screen.getByLabelText('E-mail do membro')).toHaveValue('');
    });
    expect(screen.getByLabelText('Nome do membro')).toHaveValue('');
  });

  it('mantém o que foi digitado quando quem recebeu os dados falha', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error('falhou'));
    renderForm(onSubmit);

    await preencher(user, 'Nome do membro', 'Ana Souza');
    await preencher(user, 'E-mail do membro', 'ana@empresa.com.br');
    await user.click(screen.getByRole('button', { name: 'Adicionar membro' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
    expect(screen.getByLabelText('Nome do membro')).toHaveValue('Ana Souza');
    expect(screen.getByLabelText('E-mail do membro')).toHaveValue(
      'ana@empresa.com.br',
    );
  });

  it('troca os textos quando o idioma muda', async () => {
    await i18n.changeLanguage('en');
    renderForm();

    expect(screen.getByLabelText('Member name')).toBeInTheDocument();
    expect(screen.getByLabelText('Member email')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Role' })).toHaveTextContent(
      'Respondent',
    );
    expect(
      screen.getByRole('button', { name: 'Add member' }),
    ).toBeInTheDocument();
  });
});
