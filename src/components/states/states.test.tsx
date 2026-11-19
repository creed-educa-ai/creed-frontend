import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { LoadingState } from '@/components/states/LoadingState';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

describe('estados de uma seção', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('LoadingState anuncia o carregamento e mostra o esboço de quem usa', () => {
    render(
      <LoadingState>
        <div data-testid="esboco" />
      </LoadingState>,
    );

    expect(screen.getByText(i18n.t('comum:carregando'))).toBeInTheDocument();
    expect(screen.getByTestId('esboco')).toBeInTheDocument();
    expect(
      screen.getByText(i18n.t('comum:carregando')).parentElement,
    ).toHaveAttribute('aria-live', 'polite');
  });

  it('ErrorState é um alerta com a mensagem e a dica de recarregar', () => {
    render(<ErrorState message="Não foi possível carregar." />);

    const alerta = screen.getByRole('alert');
    expect(alerta).toHaveTextContent('Não foi possível carregar.');
    expect(alerta).toHaveTextContent(i18n.t('comum:tenteRecarregar'));
  });

  it('ErrorState sem mensagem mostra só a dica de recarregar', () => {
    render(<ErrorState message={null} />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      i18n.t('comum:tenteRecarregar'),
    );
  });

  it('EmptyState anuncia o vazio como status', () => {
    render(<EmptyState>Nenhum membro</EmptyState>);

    expect(screen.getByRole('status')).toHaveTextContent('Nenhum membro');
  });
});
