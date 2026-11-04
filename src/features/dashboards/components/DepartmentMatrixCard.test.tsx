import { render, screen, within } from '@testing-library/react';
import type { DepartmentRow } from '@/features/dashboards/dashboardsApi';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { DepartmentMatrixCard } from './DepartmentMatrixCard';

const ROWS: DepartmentRow[] = [
  {
    department: 'Marketing',
    respondents: 12,
    scores: {
      seguranca_psicologica: 82,
      lideranca_adaptativa: 75,
      cultura_empreendedora: 70,
      adaptabilidade_cognitiva: 60,
      neuroinovacao_prisma: 58,
    },
    difference: {
      seguranca_psicologica: 3,
      lideranca_adaptativa: -2,
      cultura_empreendedora: 0,
      adaptabilidade_cognitiva: -9,
      neuroinovacao_prisma: 8,
    },
  },
  {
    department: 'Financeiro',
    respondents: 0,
    scores: null,
    difference: null,
  },
];

describe('DepartmentMatrixCard', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('mostra a nota e a diferença de cada setor, colorindo só o que foge da empresa', () => {
    render(<DepartmentMatrixCard rows={ROWS} period="2026/1" />);

    const marketing = screen.getByRole('row', { name: /Marketing/ });
    const cells = within(marketing).getAllByRole('cell');
    expect(cells.map((cell) => cell.textContent)).toEqual([
      '82 +3',
      '75 −2',
      '70 0',
      '60 −9',
      '58 +8',
    ]);
    // Contorno verde acima da empresa, amarelo abaixo; menos de 3 pontos
    // fica sem cor. Os números ficam sempre no roxo.
    const outlines = cells.map((cell) => cell.firstElementChild);
    expect(outlines[0]).toHaveClass('border-success');
    expect(outlines[3]).toHaveClass('border-warning');
    expect(outlines[1]).not.toHaveClass('border-success', 'border-warning');
    expect(outlines[2]).not.toHaveClass('border-success', 'border-warning');
    expect(within(marketing).getByText('82')).toHaveClass('text-chart-1');
    expect(within(marketing).getByText('+3')).toHaveClass('text-chart-2');
    expect(within(marketing).getByText('−9')).toHaveClass('text-chart-2');
  });

  it('mostra cada setor como tag, com a cor dele', () => {
    render(<DepartmentMatrixCard rows={ROWS} period="2026/1" />);

    expect(screen.getByText('Marketing')).toHaveClass(
      'bg-department-marketing',
    );
    expect(screen.getByText('Financeiro')).toHaveClass('bg-department-finance');
  });

  it('sem setores cadastrados mostra o aviso no lugar da tabela', () => {
    render(<DepartmentMatrixCard rows={[]} period="2026/1" />);

    expect(
      screen.getByText('Esta organização ainda não tem setores cadastrados.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('mostra traço no setor sem respostas', () => {
    render(<DepartmentMatrixCard rows={ROWS} period="2026/1" />);

    const financeiro = screen.getByRole('row', { name: /Financeiro/ });
    expect(within(financeiro).getAllByText('—')).toHaveLength(5);
  });
});
