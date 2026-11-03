import { render, screen } from '@testing-library/react';
import type { TeamAlignment } from '@/features/dashboards/dashboardsApi';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { AlignmentCard } from './AlignmentCard';

const alinhado = {
  bands: { baixa: 1, media: 8, alta: 1 },
  level: 'alinhado' as const,
};

const ALIGNMENT: TeamAlignment = {
  respondents: 10,
  prismas: {
    seguranca_psicologica: alinhado,
    lideranca_adaptativa: alinhado,
    cultura_empreendedora: alinhado,
    adaptabilidade_cognitiva: alinhado,
    neuroinovacao_prisma: {
      bands: { baixa: 4, media: 2, alta: 4 },
      level: 'dividido',
    },
  },
};

describe('AlignmentCard', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('mostra o nível de cada prisma e a distribuição para leitor de tela', () => {
    render(<AlignmentCard alignment={ALIGNMENT} shownLabel="2026/1" />);

    expect(
      screen.getByRole('heading', { name: 'Alinhamento da equipe' }),
    ).toBeInTheDocument();
    expect(screen.getByText('2026/1 · 10 respostas')).toBeInTheDocument();

    const neuro = screen.getAllByRole('listitem')[4];
    expect(neuro).toHaveTextContent('Neuroinovação');
    expect(neuro).toHaveTextContent('Dividido');
    expect(neuro).toHaveTextContent('4 com nota baixa, 2 média e 4 alta.');
    expect(screen.getAllByText('Alinhado')).toHaveLength(4);
  });

  it('mostra o nível como tag, verde no alinhado e amarelo no dividido', () => {
    render(<AlignmentCard alignment={ALIGNMENT} shownLabel="2026/1" />);

    expect(screen.getAllByText('Alinhado')[0]).toHaveClass('bg-success');
    expect(screen.getByText('Dividido')).toHaveClass('bg-warning');
  });

  it('sem nenhuma resposta mostra o aviso no lugar das barras', () => {
    render(
      <AlignmentCard
        alignment={{ respondents: 0, prismas: null }}
        shownLabel="Administrativo 2026/1"
      />,
    );

    expect(
      screen.getByText('Ainda não há respostas neste recorte.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });
});
