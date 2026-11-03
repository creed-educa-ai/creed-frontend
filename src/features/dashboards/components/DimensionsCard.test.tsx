import { render, screen } from '@testing-library/react';
import type { DimensionScores } from '@/features/dashboards/prismas';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { DimensionsCard } from './DimensionsCard';

const SCORES: DimensionScores = {
  S2: 58,
  S4: 58,
  S5A: 60,
  S5B: 54,
  S6: 76,
  S7: 82,
  S8: 72,
};

const COMPARED: DimensionScores = {
  S2: 51,
  S4: 54,
  S5A: 55,
  S5B: 49,
  S6: 66,
  S7: 74,
  S8: 70,
};

describe('DimensionsCard', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('mostra as sete dimensões com a nota de cada uma', () => {
    render(<DimensionsCard scores={SCORES} shownLabel="2026/1" />);

    expect(
      screen.getByRole('heading', { name: 'Desempenho por dimensão' }),
    ).toBeInTheDocument();
    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(7);
    expect(rows[5]).toHaveTextContent(
      'S7 Competências Culturais, Responsivas e Empreendedoras82',
    );
    expect(screen.getByText('2026/1')).toBeInTheDocument();
  });

  it('com comparação mostra a nota comparada e a legenda dela', () => {
    render(
      <DimensionsCard
        scores={SCORES}
        shownLabel="2026/1"
        comparison={{ label: '2025/2', dimensions: COMPARED }}
      />,
    );

    expect(screen.getByText('2025/2')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')[5]).toHaveTextContent('82 / 74');
  });
});
