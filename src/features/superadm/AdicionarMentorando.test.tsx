import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdicionarMentorando } from './AdicionarMentorando';
import type { AdicionarMentorandoValues } from './adicionarMentorandoSchema';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

type Enviar = (values: AdicionarMentorandoValues) => Promise<void>;

const campoEmail = () =>
  screen.getByRole('textbox', {
    name: i18n.t('adicionarMentorando:email.label'),
  });

const botaoAdicionar = () =>
  screen.getByRole('button', {
    name: i18n.t('adicionarMentorando:adicionar'),
  });

describe('AdicionarMentorando', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('should render the email field with its prompt', () => {
    render(<AdicionarMentorando onSubmit={vi.fn()} />);

    expect(campoEmail()).toHaveAttribute(
      'placeholder',
      i18n.t('adicionarMentorando:email.placeholder'),
    );
    expect(botaoAdicionar()).toBeInTheDocument();
  });

  it('should send the typed email when clicking the add button', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn<Enviar>().mockResolvedValue(undefined);
    render(<AdicionarMentorando onSubmit={onSubmit} />);

    await user.type(campoEmail(), 'ana@exemplo.com');
    await user.click(botaoAdicionar());

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ email: 'ana@exemplo.com' });
    });
  });

  it('should send the email when pressing Enter', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn<Enviar>().mockResolvedValue(undefined);
    render(<AdicionarMentorando onSubmit={onSubmit} />);

    await user.type(campoEmail(), 'ana@exemplo.com{Enter}');

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ email: 'ana@exemplo.com' });
    });
  });

  it('should show the required error and not send when the field is empty', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn<Enviar>().mockResolvedValue(undefined);
    render(<AdicionarMentorando onSubmit={onSubmit} />);

    await user.click(botaoAdicionar());

    expect(
      await screen.findByText(
        i18n.t('adicionarMentorando:erros.emailObrigatorio'),
      ),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should show the invalid email error and not send a malformed email', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn<Enviar>().mockResolvedValue(undefined);
    render(<AdicionarMentorando onSubmit={onSubmit} />);

    await user.type(campoEmail(), 'ana@');
    await user.click(botaoAdicionar());

    expect(
      await screen.findByText(
        i18n.t('adicionarMentorando:erros.emailInvalido'),
      ),
    ).toBeInTheDocument();
    expect(campoEmail()).toHaveAttribute('aria-invalid', 'true');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should clear the field after a successful send', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn<Enviar>().mockResolvedValue(undefined);
    render(<AdicionarMentorando onSubmit={onSubmit} />);

    await user.type(campoEmail(), 'ana@exemplo.com');
    await user.click(botaoAdicionar());

    await waitFor(() => {
      expect(campoEmail()).toHaveValue('');
    });
  });

  it('should keep the typed email when the send fails', async () => {
    const user = userEvent.setup();
    const onSubmit = vi
      .fn<Enviar>()
      .mockRejectedValue(new Error('falha de rede'));
    render(<AdicionarMentorando onSubmit={onSubmit} />);

    await user.type(campoEmail(), 'ana@exemplo.com');
    await user.click(botaoAdicionar());

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    // O botão só volta a ficar ativo quando o envio terminou de vez.
    await waitFor(() => {
      expect(botaoAdicionar()).toBeEnabled();
    });
    expect(campoEmail()).toHaveValue('ana@exemplo.com');
  });

  it('should translate the field and the errors to English', async () => {
    await i18n.changeLanguage('en');
    const user = userEvent.setup();
    render(<AdicionarMentorando onSubmit={vi.fn()} />);

    expect(campoEmail()).toHaveAttribute('placeholder', 'Enter an email');

    await user.click(botaoAdicionar());

    expect(
      await screen.findByText("Enter the mentee's email."),
    ).toBeInTheDocument();
  });
});
