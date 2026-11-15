import type { TFunction } from 'i18next';
import type {
  CompanyDashboard,
  PrismaComparison,
  UserDashboard,
} from '@/features/dashboards/dashboardsApi';
import { completionRate } from './completionRate';
import { DIMENSIONS, PRISMAS } from './prismas';
import type { ptBR } from '@/i18n/locales/pt-BR';
import type { DepartmentType, Dimension, Prisma } from '@/types/api';

type CsvCell = string | number | null | undefined;
// Os namespaces que a planilha lê. Tipar o `t` com eles mantém a checagem de
// chave: uma chave que não existe vira erro de compilação, não código cru.
export type CsvT = TFunction<['comum', 'dashboardPrisma']>;
type CsvLabel = Exclude<
  keyof (typeof ptBR)['dashboardPrisma']['csv'],
  'respondentesTotal'
>;

export type ExportCsvParams =
  | {
      kind: 'user';
      data: UserDashboard;
      t: CsvT;
      periodLabel: (id: string) => string;
      locale: string;
    }
  | {
      kind: 'company';
      data: CompanyDashboard;
      t: CsvT;
      periodLabel: (id: string) => string;
      locale: string;
      viewLabel?: string;
    };

// Números com o separador decimal do idioma (vírgula em pt-BR/es): o Excel lê
// "72.5" como texto ou data numa planilha brasileira.
function numberFormatter(locale: string) {
  const format = new Intl.NumberFormat(locale, {
    useGrouping: false,
    maximumFractionDigits: 2,
  });
  return (value: number) => format.format(value);
}

/**
 * Neutraliza texto vindo de quem usa o sistema (nome da organização, do
 * membro): uma célula que começa com =, +, -, @ vira fórmula no Excel. O
 * apóstrofo na frente faz a planilha mostrar o texto como está.
 */
export function safeText(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

/**
 * Converte uma matriz de células em string CSV com delimitador ';' e escape padrão RFC 4180.
 */
export function formatCsv(
  rows: CsvCell[][],
  locale = 'pt-BR',
  separator = ';',
): string {
  const formatNumber = numberFormatter(locale);
  return rows
    .map((row) =>
      row
        .map((cell) => {
          if (cell === null || cell === undefined) return '';
          const str = typeof cell === 'number' ? formatNumber(cell) : cell;
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
export function buildDashboardCsvRows(params: ExportCsvParams): CsvCell[][] {
  const { kind, data, t, periodLabel, locale } = params;
  const rows: CsvCell[][] = [];
  const formatNumber = numberFormatter(locale);

  const getPrismaName = (p: Prisma) => t(`dashboardPrisma:prismas.${p}`);
  const getDimName = (d: Dimension) =>
    t(`dashboardPrisma:dimensoes.nomes.${d}`);
  const label = (key: CsvLabel) => t(`dashboardPrisma:csv.${key}`);
  const signed = (value: number) =>
    value > 0 ? `+${formatNumber(value)}` : formatNumber(value);

  const currentPeriod = periodLabel(data.period);
  const organizationName = safeText(data.organization_name);

  const pushPrismaScores = () => {
    rows.push([t('dashboardPrisma:prisma'), label('pontuacaoEscala')]);
    for (const prisma of PRISMAS) {
      rows.push([getPrismaName(prisma), data.scores[prisma]]);
    }
    rows.push([]);
  };

  const pushDimensions = () => {
    rows.push([label('codigo'), label('dimensao'), label('pontuacaoEscala')]);
    for (const dim of DIMENSIONS) {
      rows.push([dim, getDimName(dim), data.dimensions[dim]]);
    }
    rows.push([]);
  };

  // Uma linha por prisma de cada comparação; `leading` são as colunas que vêm
  // antes do prisma (período, e o recorte no dashboard da organização).
  const pushComparisons = (
    title: string,
    leadingHeaders: string[],
    leading: (comp: PrismaComparison) => CsvCell[],
  ) => {
    const header = [
      ...leadingHeaders,
      t('dashboardPrisma:prisma'),
      label('pontuacao'),
      label('variacao'),
    ];
    rows.push([title, ...header.slice(1).map(() => '')]);
    rows.push(header);
    for (const comp of data.comparisons) {
      for (const prisma of PRISMAS) {
        rows.push([
          ...leading(comp),
          getPrismaName(prisma),
          comp.scores[prisma],
          signed(comp.variation[prisma]),
        ]);
      }
    }
  };

  const comparisonPeriod = (comp: PrismaComparison) =>
    comp.period ? periodLabel(comp.period) : currentPeriod;

  if (kind === 'user') {
    // 1. Identificação
    rows.push([label('relatorio'), label('tituloIndividual')]);
    rows.push([label('organizacao'), organizationName]);
    if (data.member_name) {
      rows.push([label('mentorando'), safeText(data.member_name)]);
    }
    rows.push([label('periodo'), currentPeriod]);
    rows.push([]);

    // 2. Resumo CREED.ai
    rows.push([label('resumoCreed'), '']);
    rows.push([
      label('prismaDestaque'),
      getPrismaName(data.creed_summary.destaque),
    ]);
    rows.push([
      label('prismaOportunidade'),
      getPrismaName(data.creed_summary.oportunidade),
    ]);
    rows.push([]);

    // 3. Pontuação dos 5 Prismas
    pushPrismaScores();

    // 4. Desempenho por Dimensão (7 Dimensões)
    pushDimensions();

    // 5. Comparações com períodos anteriores
    if (data.comparisons.length > 0) {
      pushComparisons(
        label('comparacoesAnteriores'),
        [label('periodo')],
        (comp) => [comparisonPeriod(comp)],
      );
    }
  } else {
    // kind === 'company'
    const viewLabel = params.viewLabel
      ? safeText(params.viewLabel)
      : organizationName;

    // 1. Identificação
    rows.push([label('relatorio'), label('tituloOrganizacao')]);
    rows.push([label('organizacao'), organizationName]);
    rows.push([label('recorte'), viewLabel]);
    rows.push([label('periodo'), currentPeriod]);
    rows.push([]);

    // 2. Resumo da Empresa
    const { company_summary: summary } = data;
    const highlight = (metric: { prisma: Prisma; valor: number }) =>
      `${getPrismaName(metric.prisma)} (${formatNumber(metric.valor)})`;

    rows.push([label('resumoOrganizacao'), label('valor')]);
    rows.push([label('convidados'), summary.convidados]);
    rows.push([label('concluidos'), summary.concluidos]);
    rows.push([
      label('taxaConclusao'),
      `${String(completionRate(summary.concluidos, summary.convidados))}%`,
    ]);
    rows.push([label('destaque'), highlight(summary.destaque)]);
    rows.push([label('oportunidade'), highlight(summary.oportunidade)]);
    rows.push([label('maisComum'), highlight(summary.maisComum)]);
    rows.push([]);

    // 3. Pontuação dos Prismas
    pushPrismaScores();

    // 4. Desempenho por Dimensão
    pushDimensions();

    // 5. Alinhamento da Equipe
    if (data.alignment?.prismas) {
      rows.push([
        label('alinhamento'),
        t('dashboardPrisma:csv.respondentesTotal', {
          total: data.alignment.respondents,
        }),
        '',
        '',
        '',
      ]);
      rows.push([
        t('dashboardPrisma:prisma'),
        label('nivel'),
        t('dashboardPrisma:alinhamento.faixas.baixa'),
        t('dashboardPrisma:alinhamento.faixas.media'),
        t('dashboardPrisma:alinhamento.faixas.alta'),
      ]);
      for (const prisma of PRISMAS) {
        const align = data.alignment.prismas[prisma];
        rows.push([
          getPrismaName(prisma),
          t(`dashboardPrisma:alinhamento.niveis.${align.level}`),
          align.bands.baixa,
          align.bands.media,
          align.bands.alta,
        ]);
      }
      rows.push([]);
    }

    // 6. Mapa de Setores × Prismas
    if (data.department_matrix.length > 0) {
      const header = [
        label('setor'),
        label('respondentes'),
        ...PRISMAS.map(getPrismaName),
      ];
      rows.push([label('mapa'), ...header.slice(1).map(() => '')]);
      rows.push(header);
      for (const row of data.department_matrix) {
        rows.push([
          t(`comum:setores.${row.department}`),
          row.respondents,
          ...PRISMAS.map((prisma) => row.scores?.[prisma] ?? ''),
        ]);
      }
      rows.push([]);
    }

    // 7. Comparações
    if (data.comparisons.length > 0) {
      pushComparisons(
        label('comparacoes'),
        [label('recorteSetor'), label('periodo')],
        (comp) => [
          comp.scope
            ? comp.scope === 'organization'
              ? organizationName
              : t(`comum:setores.${comp.scope as DepartmentType}`, {
                  defaultValue: comp.scope,
                })
            : viewLabel,
          comparisonPeriod(comp),
        ],
      );
    }
  }

  return rows;
}

/**
 * Dispara o download de um arquivo CSV no navegador com encoding UTF-8 (BOM).
 */
export function triggerCsvDownload(content: string, filename: string): void {
  const blob = new Blob(['﻿' + content], {
    type: 'text/csv;charset=utf-8;',
  });
  if (
    typeof window !== 'undefined' &&
    typeof window.URL.createObjectURL === 'function'
  ) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Revogar no mesmo tick do clique cancela o download no Safari e em
    // Firefox antigo: o browser ainda não começou a ler o blob.
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);
  }
}

/**
 * Orquestra a geração e o download de CSV para qualquer dashboard.
 */
export function exportDashboardCsv(params: ExportCsvParams): void {
  const rows = buildDashboardCsvRows(params);
  const csvText = formatCsv(rows, params.locale);

  const orgSlug = params.data.organization_name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const filename =
    params.kind === 'user'
      ? `dashboard-individual-${orgSlug || 'creed'}.csv`
      : `dashboard-empresa-${orgSlug || 'creed'}.csv`;

  triggerCsvDownload(csvText, filename);
}
