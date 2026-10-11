import { render, screen, within } from '@testing-library/react';
import { PrismaRadarChart, type PrismaScores } from './PrismaRadarChart';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

const SCORES_ATUAIS: PrismaScores = {
  neuroinovacao: 78,
  seguranca: 64,
  lideranca: 82,
  adaptabilidade: 71,
  cultura: 90,
};

const SCORES_ANTERIORES: PrismaScores = {
  neuroinovacao: 62,
  seguranca: 58,
  lideranca: 70,
  adaptabilidade: 66,
  cultura: 74,
};

describe('PrismaRadarChart', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('mostra uma única série quando não há período anterior', () => {
    render(
      <PrismaRadarChart
        current={{ label: 'Formulário atual', scores: SCORES_ATUAIS }}
      />,
    );

    expect(screen.getByText('Prisma de competências')).toBeInTheDocument();
    expect(screen.getAllByText('Formulário atual')).toHaveLength(2);
    expect(screen.queryByText('Formulário anterior')).not.toBeInTheDocument();

    const table = screen.getByRole('table');
    expect(within(table).getByText('Neuroinovação')).toBeInTheDocument();
    expect(within(table).getByText('78')).toBeInTheDocument();
    expect(within(table).queryByText('62')).not.toBeInTheDocument();
  });

  it('compara os valores do período anterior quando a segunda série existe', () => {
    render(
      <PrismaRadarChart
        current={{ label: '2026', scores: SCORES_ATUAIS }}
        previous={{ label: '2025', scores: SCORES_ANTERIORES }}
      />,
    );

    expect(screen.getAllByText('2026')).toHaveLength(2);
    expect(screen.getAllByText('2025')).toHaveLength(2);
    expect(
      screen.getAllByText('Resultados de 2026 comparados com 2025.'),
    ).toHaveLength(2);

    const table = screen.getByRole('table');
    const neuroinovacao = within(table).getByRole('row', {
      name: /Neuroinovação/,
    });
    expect(neuroinovacao).toHaveTextContent('78');
    expect(neuroinovacao).toHaveTextContent('62');
    expect(table.querySelectorAll('thead th')).toHaveLength(3);
  });
});
