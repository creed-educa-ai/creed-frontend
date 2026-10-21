import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PainelControleView } from './PainelControleView';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: () => {
        return new Promise<void>((resolve) => {
          resolve();
        });
      },
    },
  }),
}));

describe('PainelControleView - Testes Unitários', () => {
  it('deve renderizar os elementos principais do painel corretamente', () => {
    render(<PainelControleView />);

    expect(screen.getByText('ACME Inc.')).toBeInTheDocument();
    expect(screen.getByText('Painel de Controle')).toBeInTheDocument();
  });

  it('deve permitir alterar o input de hora e refletir na confirmação', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {
      // noop
    });

    const { container } = render(<PainelControleView />);

    const inputHoraInicio = container.querySelector('input[type="time"]')!;

    fireEvent.change(inputHoraInicio, { target: { value: '15:45' } });

    const botaoConfirmar = screen.getByText('painelControle:confirmar');
    fireEvent.click(botaoConfirmar);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Dados salvos:',
      expect.objectContaining({
        horaInicio: '15:45',
      }),
    );

    consoleSpy.mockRestore();
  });

  it('deve abrir o popover do calendário ao clicar no botão de data', () => {
    render(<PainelControleView />);

    const botoesCalendario = screen.getAllByRole('button', {
      name: /1\/2\/2026/i,
    });
    expect(botoesCalendario.length).toBeGreaterThanOrEqual(1);

    fireEvent.click(botoesCalendario[0]!);

    const calendarioElement = screen.getByRole('grid');
    expect(calendarioElement).toBeInTheDocument();
  });
});
