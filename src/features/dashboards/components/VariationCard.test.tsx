import { render, screen } from '@testing-library/react';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import type { PrismaScores } from './PrismaRadarChart';
import { VariationCard } from './VariationCard';

const SCORES: PrismaScores = {
  seguranca_psicologica: 79,
  lideranca_adaptativa: 77,
  cultura_empreendedora: 67,
  adaptabilidade_cognitiva: 57,
  neuroinovacao_prisma: 54,
};

const COMPARISON = {
  label: '2025/1',
  variation: {
    seguranca_psicologica: 5,
    lideranca_adaptativa: -3,
    cultura_empreendedora: 6,
    adaptabilidade_cognitiva: 0,
    neuroinovacao_prisma: 4,
  },
};

describe('VariationCard', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('mostra a variação de cada prisma, do que mais subiu para o que mais caiu', () => {
    render(
      <VariationCard
        scores={SCORES}
        shownLabel="2026/1"
        comparison={COMPARISON}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Variação por prisma' }),
    ).toBeInTheDocument();
    expect(screen.getByText('2026/1 em relação a 2025/1')).toBeInTheDocument();
    // Na tela, os dois recortes aparecem em etiqueta, com o fundo do radar.
    expect(screen.getByText('2026/1', { selector: 'span' })).toHaveClass(
      'bg-accent',
    );
    expect(screen.getByText('2025/1', { selector: 'span' })).toHaveClass(
      'bg-accent',
    );

    const rows = screen.getAllByRole('listitem');
    // Nome, número da seta, descrição para leitor de tela e a nota.
    expect(rows.map((row) => row.textContent)).toEqual([
      'Cultura Empreendedora6aumentou 667',
      'Segurança Psicológica5aumentou 579',
      'Neuroinovação4aumentou 454',
      'Adaptabilidade Cognitivasem variação57',
      'Liderança Adaptativa3diminuiu 377',
    ]);
  });

  it('descreve queda e estabilidade para leitor de tela', () => {
    render(
      <VariationCard
        scores={SCORES}
        shownLabel="2026/1"
        comparison={COMPARISON}
      />,
    );

    expect(screen.getByText('diminuiu 3')).toHaveClass('sr-only');
    expect(screen.getByText('sem variação')).toHaveClass('sr-only');
  });

  it('sem comparação mostra só as notas, da maior para a menor', () => {
    render(<VariationCard scores={SCORES} shownLabel="2026/1" />);

    expect(screen.getByText('2026/1, sem comparação.')).toBeInTheDocument();
    expect(screen.queryByText(/aumentou|diminuiu/)).not.toBeInTheDocument();

    const rows = screen.getAllByRole('listitem');
    expect(rows.map((row) => row.textContent)).toEqual([
      'Segurança Psicológica79',
      'Liderança Adaptativa77',
      'Cultura Empreendedora67',
      'Adaptabilidade Cognitiva57',
      'Neuroinovação54',
    ]);
  });
});
