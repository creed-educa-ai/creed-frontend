import { render, screen, within } from '@testing-library/react';
import { PrismaRadarChart, type PrismaScores } from './PrismaRadarChart';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

const SCORES_ATUAIS: PrismaScores = {
  seguranca_psicologica: 78,
  lideranca_adaptativa: 90,
  cultura_empreendedora: 64,
  adaptabilidade_cognitiva: 82,
  neuroinovacao_prisma: 78,
};

const SCORES_ANTERIORES: PrismaScores = {
  seguranca_psicologica: 62,
  lideranca_adaptativa: 74,
  cultura_empreendedora: 58,
  adaptabilidade_cognitiva: 70,
  neuroinovacao_prisma: 62,
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
    const neuroinovacao = within(table).getByRole('row', {
      name: /Neuroinovação/,
    });
    expect(neuroinovacao).toHaveTextContent('78');
    expect(within(table).queryByText('62')).not.toBeInTheDocument();
  });

  it('compara os valores do período escolhido quando a segunda série existe', () => {
    render(
      <PrismaRadarChart
        current={{ label: '2026', scores: SCORES_ATUAIS }}
        comparison={{ label: '2025', scores: SCORES_ANTERIORES }}
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

  it('usa as traduções de espanhol para o namespace do Prisma', async () => {
    await i18n.changeLanguage('es');

    render(
      <PrismaRadarChart current={{ label: '2026', scores: SCORES_ATUAIS }} />,
    );

    expect(screen.getByText('Prisma de competencias')).toBeInTheDocument();
    expect(screen.getByText('Seguridad Psicológica')).toBeInTheDocument();
  });
  it('na versão compacta mostra o título e a legenda dentro do card', () => {
    render(
      <PrismaRadarChart
        compact
        current={{ label: '2026', scores: SCORES_ATUAIS }}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Prisma de competências' }),
    ).toBeInTheDocument();
    // Na legenda e na tabela acessível.
    expect(screen.getAllByText('2026')).toHaveLength(2);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
