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
      screen.getByText(
        /Você gostaria de revisar alguns de seus dados pessoais/,
      ),
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

    expect(screen.getByRole('button', { name: 'Sim' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Não' })).toBeInTheDocument();
  });

  it('should call onReview when "Sim" button is clicked', async () => {
    const mockOnReview = vi.fn();
    render(
      <ModalInfo
        open={true}
        onOpenChange={vi.fn()}
        onReview={mockOnReview}
        onStart={vi.fn()}
      />,
    );

    const simButton = screen.getByRole('button', { name: 'Sim' });
    await userEvent.click(simButton);

    expect(mockOnReview).toHaveBeenCalled();
  });

  it('should call onStart when "Não" button is clicked', async () => {
    const mockOnStart = vi.fn();
    render(
      <ModalInfo
        open={true}
        onOpenChange={vi.fn()}
        onReview={vi.fn()}
        onStart={mockOnStart}
      />,
    );

    const naoButton = screen.getByRole('button', { name: 'Não' });
    await userEvent.click(naoButton);

    expect(mockOnStart).toHaveBeenCalled();
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
    expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
  });
});
