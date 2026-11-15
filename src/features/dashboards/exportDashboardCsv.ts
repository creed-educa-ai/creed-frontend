import type { TFunction } from 'i18next';
import type {
  CompanyDashboard,
  UserDashboard,
} from '@/features/dashboards/dashboardsApi';
import { DIMENSIONS, PRISMAS } from './prismas';
import type { Dimension, Prisma } from '@/types/api';

export type ExportCsvParams =
  | {
      kind: 'user';
      data: UserDashboard;
      t: TFunction;
      periodLabel: (id: string | null) => string;
    }
  | {
      kind: 'company';
      data: CompanyDashboard;
      t: TFunction;
      periodLabel: (id: string | null) => string;
      viewLabel?: string;
    };

/**
 * Converte uma matriz de células em string CSV com delimitador ';' e escape padrão RFC 4180.
 */
export function formatCsv(
  rows: (string | number | null | undefined)[][],
  separator = ';',
): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          if (cell === null || cell === undefined) return '';
          const str = String(cell);
          if (
            str.includes(separator) ||
            str.includes('"') ||
            str.includes('\n') ||
            str.includes('\r')
          ) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(separator),
    )
    .join('\r\n');
}

/**
 * Monta as linhas estruturadas de dados para o CSV a partir dos dados do dashboard.
 */
export function buildDashboardCsvRows(
  params: ExportCsvParams,
): (string | number | null | undefined)[][] {
  const { kind, data, t, periodLabel } = params;
  const rows: (string | number | null | undefined)[][] = [];

  const getPrismaName = (p: Prisma) =>
    t(`resultado:prismas.${p}`, { defaultValue: p });
  const getDimName = (d: Dimension) =>
    t(`resultado:dimensoes.nomes.${d}`, { defaultValue: d });

  const currentPeriod = periodLabel(data.period);

  if (kind === 'user') {
    // 1. Identificação
    rows.push(['Relatório', 'Dashboard Individual - CREED.ai']);
    rows.push(['Organização', data.organization_name]);
    if (data.member_name) {
      rows.push(['Mentorando', data.member_name]);
    }
    rows.push(['Período', currentPeriod]);
    rows.push([]);

    // 2. Resumo CREED.ai
    rows.push(['Resumo CREED.ai', '']);
    rows.push([
      'Prisma de Destaque',
      getPrismaName(data.creed_summary.destaque),
    ]);
    rows.push([
      'Prisma de Oportunidade',
      getPrismaName(data.creed_summary.oportunidade),
    ]);
    rows.push([]);

    // 3. Pontuação dos 5 Prismas
    rows.push(['Prisma', 'Pontuação (0-100)']);
    for (const prisma of PRISMAS) {
      rows.push([getPrismaName(prisma), data.scores[prisma] ?? 0]);
    }
    rows.push([]);

    // 4. Desempenho por Dimensão (7 Dimensões)
    rows.push(['Código', 'Dimensão', 'Pontuação (0-100)']);
    for (const dim of DIMENSIONS) {
      rows.push([dim, getDimName(dim), data.dimensions[dim] ?? 0]);
    }
    rows.push([]);

    // 5. Comparações com períodos anteriores
    if (data.comparisons && data.comparisons.length > 0) {
      rows.push(['Comparações com Períodos Anteriores', '', '', '']);
      rows.push(['Período', 'Prisma', 'Pontuação', 'Variação']);
      for (const comp of data.comparisons) {
        const compPeriod = periodLabel(comp.period);
        for (const prisma of PRISMAS) {
          const score = comp.scores[prisma] ?? 0;
          const variation = comp.variation[prisma] ?? 0;
          const varStr = variation > 0 ? `+${variation}` : String(variation);
          rows.push([compPeriod, getPrismaName(prisma), score, varStr]);
        }
      }
    }
  } else {
    // kind === 'company'
    const viewLabel = params.viewLabel ?? 'Organização Inteira';

    // 1. Identificação
    rows.push(['Relatório', 'Dashboard da Organização - CREED.ai']);
    rows.push(['Organização', data.organization_name]);
    rows.push(['Recorte / Visão', viewLabel]);
    rows.push(['Período', currentPeriod]);
    rows.push([]);

    // 2. Resumo da Empresa
    const { company_summary: summary } = data;
    rows.push(['Resumo da Organização', 'Valor']);
    rows.push(['Convidados', summary.convidados]);
    rows.push(['Concluídos', summary.concluidos]);
    rows.push(['Taxa de Conclusão', `${summary.completion_rate}%`]);
    rows.push([
      'Destaque',
      `${getPrismaName(summary.destaque.prisma)} (${summary.destaque.valor})`,
    ]);
    rows.push([
      'Oportunidade',
      `${getPrismaName(summary.oportunidade.prisma)} (${summary.oportunidade.valor})`,
    ]);
    rows.push(['Prisma mais comum', getPrismaName(summary.most_common)]);
    rows.push([]);

    // 3. Pontuação dos Prismas
    rows.push(['Prisma', 'Pontuação (0-100)']);
    for (const prisma of PRISMAS) {
      rows.push([getPrismaName(prisma), data.scores[prisma] ?? 0]);
    }
    rows.push([]);

    // 4. Desempenho por Dimensão
    rows.push(['Código', 'Dimensão', 'Pontuação (0-100)']);
    for (const dim of DIMENSIONS) {
      rows.push([dim, getDimName(dim), data.dimensions[dim] ?? 0]);
    }
    rows.push([]);

    // 5. Alinhamento da Equipe
    if (data.alignment && data.alignment.prismas) {
      rows.push([
        'Alinhamento da Equipe',
        `Respondentes: ${data.alignment.respondents}`,
        '',
        '',
        '',
      ]);
      rows.push([
        'Prisma',
        'Nível',
        'Baixa (<=40)',
        'Média (41-70)',
        'Alta (>70)',
      ]);
      for (const prisma of PRISMAS) {
        const align = data.alignment.prismas[prisma];
        if (align) {
          const levelStr = t(`resultado:alinhamento.niveis.${align.level}`, {
            defaultValue: align.level,
          });
          rows.push([
            getPrismaName(prisma),
            levelStr,
            align.bands.baixa,
            align.bands.media,
            align.bands.alta,
          ]);
        }
      }
      rows.push([]);
    }

    // 6. Mapa de Setores × Prismas
    if (data.department_matrix && data.department_matrix.length > 0) {
      rows.push(['Mapa de Setores × Prismas', '', '', '', '', '', '']);
      rows.push([
        'Setor',
        'Respondentes',
        getPrismaName('seguranca_psicologica'),
        getPrismaName('lideranca_adaptativa'),
        getPrismaName('cultura_empreendedora'),
        getPrismaName('adaptabilidade_cognitiva'),
        getPrismaName('neuroinovacao_prisma'),
      ]);
      for (const row of data.department_matrix) {
        const deptLabel = t(`comum:setores.${row.department}`, {
          defaultValue: row.department,
        });
        rows.push([
          deptLabel,
          row.respondents,
          row.scores?.seguranca_psicologica ?? '',
          row.scores?.lideranca_adaptativa ?? '',
          row.scores?.cultura_empreendedora ?? '',
          row.scores?.adaptabilidade_cognitiva ?? '',
          row.scores?.neuroinovacao_prisma ?? '',
        ]);
      }
      rows.push([]);
    }

    // 7. Comparações
    if (data.comparisons && data.comparisons.length > 0) {
      rows.push(['Comparações', '', '', '', '']);
      rows.push([
        'Recorte / Setor',
        'Período',
        'Prisma',
        'Pontuação',
        'Variação',
      ]);
      for (const comp of data.comparisons) {
        const compScope = comp.scope
          ? comp.scope === 'organization'
            ? 'Empresa inteira'
            : t(`comum:setores.${comp.scope}`, { defaultValue: comp.scope })
          : viewLabel;
        const compPeriod = comp.period
          ? periodLabel(comp.period)
          : currentPeriod;
        for (const prisma of PRISMAS) {
          const score = comp.scores[prisma] ?? 0;
          const variation = comp.variation[prisma] ?? 0;
          const varStr = variation > 0 ? `+${variation}` : String(variation);
          rows.push([
            compScope,
            compPeriod,
            getPrismaName(prisma),
            score,
            varStr,
          ]);
        }
      }
    }
  }

  return rows;
}

/**
 * Dispara o download de um arquivo CSV no navegador com encoding UTF-8 (BOM).
 */
export function triggerCsvDownload(content: string, filename: string): void {
  const blob = new Blob(['\uFEFF' + content], {
    type: 'text/csv;charset=utf-8;',
  });
  if (
    typeof window !== 'undefined' &&
    typeof window.URL?.createObjectURL === 'function'
  ) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

/**
 * Orquestra a geração e o download de CSV para qualquer dashboard.
 */
export function exportDashboardCsv(params: ExportCsvParams): void {
  const rows = buildDashboardCsvRows(params);
  const csvText = formatCsv(rows);

  const orgSlug = params.data.organization_name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const filename =
    params.kind === 'user'
      ? `dashboard-individual-${orgSlug || 'creed'}.csv`
      : `dashboard-empresa-${orgSlug || 'creed'}.csv`;

  triggerCsvDownload(csvText, filename);
}
