import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalInfo } from './ModalInfo';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

describe('ModalInfo', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('should render title and message when open', () => {
    render(
      <ModalInfo
        open={true}
        onOpenChange={vi.fn()}
        onReview={vi.fn()}
        onStart={vi.fn()}
      />,
    );

    expect(screen.getByText('Atualizar Informações')).toBeInTheDocument();
    expect(
      screen.getByText(/Você gostaria de revisar seus dados pessoais/),
    ).toBeInTheDocument();
  });

  it('should render both buttons with correct labels', () => {
    render(
      <ModalInfo
        open={true}
        onOpenChange={vi.fn()}
        onReview={vi.fn()}
        onStart={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Revisar dados' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Iniciar questionário' }),
    ).toBeInTheDocument();
  });

  it('should call onReview when "Revisar dados" button is clicked', async () => {
    const mockOnReview = vi.fn();
    render(
      <ModalInfo
        open={true}
        onOpenChange={vi.fn()}
        onReview={mockOnReview}
        onStart={vi.fn()}
      />,
    );

    const revisarButton = screen.getByRole('button', { name: 'Revisar dados' });
    await userEvent.click(revisarButton);

    expect(mockOnReview).toHaveBeenCalled();
  });

  it('should call onStart when "Iniciar questionário" button is clicked', async () => {
    const mockOnStart = vi.fn();
    render(
      <ModalInfo
        open={true}
        onOpenChange={vi.fn()}
        onReview={vi.fn()}
        onStart={mockOnStart}
      />,
    );

    const iniciarButton = screen.getByRole('button', {
      name: 'Iniciar questionário',
    });
    await userEvent.click(iniciarButton);

    expect(mockOnStart).toHaveBeenCalled();
  });

  it('should not close when Escape is pressed', async () => {
    const mockOnOpenChange = vi.fn();
    render(
      <ModalInfo
        open={true}
        onOpenChange={mockOnOpenChange}
        onReview={vi.fn()}
        onStart={vi.fn()}
      />,
    );

    await userEvent.keyboard('{Escape}');

    expect(mockOnOpenChange).not.toHaveBeenCalledWith(false);
    expect(screen.getByText('Atualizar Informações')).toBeInTheDocument();
  });

  it('should focus "Iniciar questionário" when Escape is pressed', async () => {
    render(
      <ModalInfo
        open={true}
        onOpenChange={vi.fn()}
        onReview={vi.fn()}
        onStart={vi.fn()}
      />,
    );

    await userEvent.keyboard('{Escape}');

    expect(
      screen.getByRole('button', { name: 'Iniciar questionário' }),
    ).toHaveFocus();
  });

  it('should focus "Iniciar questionário" when clicking outside', async () => {
    const mockOnOpenChange = vi.fn();
    render(
      <ModalInfo
        open={true}
        onOpenChange={mockOnOpenChange}
        onReview={vi.fn()}
        onStart={vi.fn()}
      />,
    );

    const overlay = document.querySelector(
      '[data-slot="alert-dialog-overlay"]',
    );
    if (!overlay) throw new Error('overlay não encontrado');
    await userEvent.click(overlay);

    expect(mockOnOpenChange).not.toHaveBeenCalledWith(false);
    expect(
      screen.getByRole('button', { name: 'Iniciar questionário' }),
    ).toHaveFocus();
  });

  it('should not render when open is false', () => {
    render(
      <ModalInfo
        open={false}
        onOpenChange={vi.fn()}
        onReview={vi.fn()}
        onStart={vi.fn()}
      />,
    );

    expect(screen.queryByText('Atualizar Informações')).not.toBeInTheDocument();
  });

  it('should translate to English when language changes', async () => {
    await i18n.changeLanguage('en');
    render(
      <ModalInfo
        open={true}
        onOpenChange={vi.fn()}
        onReview={vi.fn()}
        onStart={vi.fn()}
      />,
    );

    expect(screen.getByText('Update Information')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Review data' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Start questionnaire' }),
    ).toBeInTheDocument();
  });
});
