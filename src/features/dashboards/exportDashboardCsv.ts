import type { TFunction } from 'i18next';
import type {
  CompanyDashboard,
  CompanySummary,
  OverviewDashboard,
  PrismaComparison,
  TeamAlignment,
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
    }
  | {
      // O retrato atual da administradora: todas as empresas ou todos os
      // mentorandos. Sem período; os rótulos vêm prontos da tela.
      kind: 'overview';
      data: OverviewDashboard;
      t: CsvT;
      locale: string;
      viewLabel: string;
      // "Respostas de … a …", já formatado.
      responsesLabel: string;
      // Só no retrato das empresas: sem ele, a planilha sai sem o mapa.
      matrixTitle?: string | undefined;
      groupHeading: string;
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
  const { data, t, locale } = params;
  const rows: CsvCell[][] = [];
  const formatNumber = numberFormatter(locale);

  const getPrismaName = (p: Prisma) => t(`dashboardPrisma:prismas.${p}`);
  const getDimName = (d: Dimension) =>
    t(`dashboardPrisma:dimensoes.nomes.${d}`);
  const label = (key: CsvLabel) => t(`dashboardPrisma:csv.${key}`);
  const signed = (value: number) =>
    value > 0 ? `+${formatNumber(value)}` : formatNumber(value);

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
    comparisons: PrismaComparison[],
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
    for (const comp of comparisons) {
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

  const highlight = (metric: { prisma: Prisma; valor: number }) =>
    `${getPrismaName(metric.prisma)} (${formatNumber(metric.valor)})`;

  const pushSummary = (summary: CompanySummary) => {
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
  };

  const pushAlignment = (alignment: TeamAlignment | null) => {
    if (!alignment?.prismas) return;
    rows.push([
      label('alinhamento'),
      t('dashboardPrisma:csv.respondentesTotal', {
        total: alignment.respondents,
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
      const align = alignment.prismas[prisma];
      rows.push([
        getPrismaName(prisma),
        t(`dashboardPrisma:alinhamento.niveis.${align.level}`),
        align.bands.baixa,
        align.bands.media,
        align.bands.alta,
      ]);
    }
    rows.push([]);
  };

  if (params.kind === 'overview') {
    const viewLabel = safeText(params.viewLabel);
    const groupName = (id: string | null) =>
      safeText(
        params.data.groups.find((group) => group.id === id)?.label ??
          params.viewLabel,
      );

    // 1. Identificação
    rows.push([label('relatorio'), label('tituloRetrato')]);
    rows.push([label('recorte'), viewLabel]);
    rows.push([label('periodo'), params.responsesLabel]);
    rows.push([]);

    // 2. Resumo, 3. Prismas, 4. Dimensões, 5. Alinhamento
    pushSummary(params.data.company_summary);
    pushPrismaScores();
    pushDimensions();
    pushAlignment(params.data.alignment);

    // 6. Mapa de empresas × prismas
    if (params.matrixTitle && params.data.groups.length > 0) {
      const header = [
        params.groupHeading,
        label('respondentes'),
        ...PRISMAS.map(getPrismaName),
      ];
      rows.push([params.matrixTitle, ...header.slice(1).map(() => '')]);
      rows.push(header);
      for (const group of params.data.groups) {
        rows.push([
          safeText(group.label),
          group.respondents,
          ...PRISMAS.map((prisma) => group.scores[prisma]),
        ]);
      }
      rows.push([]);
    }

    // 7. Comparações com cada grupo (o retrato não tem período)
    if (params.data.comparisons.length > 0) {
      pushComparisons(
        params.data.comparisons,
        label('comparacoes'),
        [params.groupHeading],
        (comp) => [groupName(comp.scope)],
      );
    }

    return rows;
  }

  const { kind, periodLabel } = params;
  const currentPeriod = periodLabel(params.data.period);
  const organizationName = safeText(params.data.organization_name);
  const comparisonPeriod = (comp: PrismaComparison) =>
    comp.period ? periodLabel(comp.period) : currentPeriod;

  if (kind === 'user') {
    const data = params.data;
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
        data.comparisons,
        label('comparacoesAnteriores'),
        [label('periodo')],
        (comp) => [comparisonPeriod(comp)],
      );
    }
  } else {
    // kind === 'company'
    const data = params.data;
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
    pushSummary(data.company_summary);

    // 3. Pontuação dos Prismas
    pushPrismaScores();

    // 4. Desempenho por Dimensão
    pushDimensions();

    // 5. Alinhamento da Equipe
    pushAlignment(data.alignment);

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
        data.comparisons,
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

  const orgSlug = (
    params.kind === 'overview'
      ? params.viewLabel
      : params.data.organization_name
  )
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const filename =
    params.kind === 'user'
      ? `dashboard-individual-${orgSlug || 'creed'}.csv`
      : params.kind === 'overview'
        ? `dashboard-${orgSlug || 'creed'}.csv`
        : `dashboard-empresa-${orgSlug || 'creed'}.csv`;

  triggerCsvDownload(csvText, filename);
}
