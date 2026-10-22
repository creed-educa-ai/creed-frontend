import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { AddMemberForm } from '@/features/organizations/AddMemberForm';

function renderForm(onSubmit = vi.fn()) {
  render(<AddMemberForm onSubmit={onSubmit} />);
  return { onSubmit };
}

describe('AddMemberForm', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('renderiza e-mail, função e o botão de adicionar', () => {
    renderForm();

    expect(screen.getByLabelText('E-mail do membro')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Insira um e-mail')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Função' })).toHaveTextContent(
      'Respondente',
    );
    expect(
      screen.getByRole('button', { name: 'Adicionar membro' }),
    ).toBeInTheDocument();
  });

  it('bloqueia e-mail inválido e mostra o erro', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.click(screen.getByLabelText('E-mail do membro'));
    await user.paste('isso-nao-e-email');
    await user.click(screen.getByRole('button', { name: 'Adicionar membro' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Digite um e-mail válido.',
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('entrega e-mail e função e limpa o campo quando é válido', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();
    const campoEmail = screen.getByLabelText('E-mail do membro');

    await user.click(campoEmail);
    await user.paste('ana@empresa.com.br');
    await user.click(screen.getByRole('button', { name: 'Adicionar membro' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'ana@empresa.com.br',
        role: 'respondente',
      });
    });
    await waitFor(() => {
      expect(campoEmail).toHaveValue('');
    });
  });

  it('mantém o e-mail digitado quando quem recebeu os dados falha', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error('falhou'));
    renderForm(onSubmit);
    const campoEmail = screen.getByLabelText('E-mail do membro');

    await user.click(campoEmail);
    await user.paste('ana@empresa.com.br');
    await user.click(screen.getByRole('button', { name: 'Adicionar membro' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
    expect(campoEmail).toHaveValue('ana@empresa.com.br');
  });

  it('troca os textos quando o idioma muda', async () => {
    await i18n.changeLanguage('en');
    renderForm();

    expect(screen.getByLabelText('Member email')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Role' })).toHaveTextContent(
      'Respondent',
    );
    expect(
      screen.getByRole('button', { name: 'Add member' }),
    ).toBeInTheDocument();
  });
});
