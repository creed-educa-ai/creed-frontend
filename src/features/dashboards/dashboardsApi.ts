// Chamadas ao backend para o domínio dashboards.
//
// Hoje é tudo MOCK: no back, `dashboards` tem tabela e schema
// (`DashboardResponse`: só `user_id`, `form_id`, `is_private`), mas a rota é
// stub, e os números do radar dependem de `prismas` e `insights`, que também
// não têm rota. Os dados ficam aqui, e não na tela, para que integrar seja
// trocar o corpo das funções por `apiClient.get` — o slice e as telas não
// mudam. Lembrete do princípio 1: o back entrega os números prontos; a tela
// não soma nem agrupa.
import type { DepartmentType, Dimension, Prisma } from '@/types/api';
import type { PrismaScores } from './components/PrismaRadarChart';
import { DIMENSIONS, PRISMAS, type DimensionScores } from './prismas';

// ---------------------------------------------------------------------------
// Formas PROVISÓRIAS da tela. Moram aqui, e não em types/api.ts, porque
// dependem do `PrismaScores` do radar e só a feature dashboards as usa.
// ---------------------------------------------------------------------------

export interface DashboardHighlight {
  titulo: string;
  valor: number;
  descricao: string;
}

export interface CreedSummary {
  analiseTexto: string[];
  recomendacaoTexto: string[];
  // Um texto curto por prisma. No back, são os `insights` marcados com o
  // prisma em `insight_prismas`.
  prismas: Record<Prisma, string>;
  // Quais prismas os cards marcam como destaque e oportunidade: quem decide é
  // o back, a tela só marca.
  destaque: Prisma;
  oportunidade: Prisma;
}

export interface CompanySummary {
  concluidos: number;
  convidados: number;
  destaque: DashboardHighlight;
  oportunidade: DashboardHighlight;
  maisComum: DashboardHighlight;
}

/**
 * Com quem a comparação é feita, além do período: um setor ou a empresa toda.
 * `null` é o mesmo recorte que está sendo exibido.
 */
export type ComparisonScope = DepartmentType | 'organization';

/**
 * Uma referência com que o resultado exibido pode ser comparado. Período e
 * escopo são escolhidos à parte, e o que vem nulo é o mesmo do que está sendo
 * exibido: só `period` = o mesmo recorte em outro período; só `scope` = aquele
 * setor (ou a empresa toda) no período exibido. A variação já vem calculada
 * (exibido − referência): derivar indicador é do back (princípio 1).
 */
export interface PrismaComparison {
  period: string | null;
  scope: ComparisonScope | null;
  scores: PrismaScores;
  variation: PrismaScores;
  // Notas das sete dimensões da referência.
  dimensions: DimensionScores;
}

/**
 * Quantas pessoas do recorte ficaram em cada faixa de nota de um prisma, e a
 * leitura disso. Faixas e regra do nível: P-057 e P-058.
 */
export interface PrismaAlignment {
  bands: { baixa: number; media: number; alta: number };
  level: 'alinhado' | 'moderado' | 'dividido';
}

export interface TeamAlignment {
  respondents: number;
  // Nulo quando o recorte ainda não tem resposta nenhuma.
  prismas: Record<Prisma, PrismaAlignment> | null;
}

/**
 * Um setor no mapa setores × prismas. A diferença já vem calculada (setor −
 * organização inteira, no mesmo período): derivar indicador é do back.
 */
export interface DepartmentRow {
  department: DepartmentType;
  respondents: number;
  // Nulos quando o setor ainda não tem resposta.
  scores: PrismaScores | null;
  difference: PrismaScores | null;
}

/** O que dá para escolher nos dois botões de comparação. */
export interface ComparisonOptions {
  // Todos os períodos, do mais recente para o mais antigo, inclusive o
  // exibido: com um setor escolhido, dá para comparar no mesmo período.
  periods: string[];
  // Todos os setores, inclusive o exibido. Quem responde não compara com
  // setores (lista vazia).
  departments: DepartmentType[];
  // O período anterior ao exibido; nulo quando o exibido é o mais antigo.
  default_period: string | null;
}

/**
 * Recorte que a tela pede. Sem período, o back usa o mais recente; sem setor
 * e sem membro, a organização inteira. A filtragem é do back: a tela só pede.
 */
export interface DashboardFilters {
  period?: string | undefined;
  department?: DepartmentType | undefined;
  member_id?: string | undefined;
}

export interface DashboardMember {
  id: string;
  label: string;
}

/** Resultado de quem está logado. */
export interface UserDashboard {
  organization_name: string;
  periods: string[];
  // O período que esta resposta mostra, já resolvido pelo back.
  period: string;
  scores: PrismaScores;
  // As sete dimensões de que os prismas são feitos.
  dimensions: DimensionScores;
  comparison_options: ComparisonOptions;
  // Uma por combinação possível das opções acima.
  comparisons: PrismaComparison[];
  creed_summary: CreedSummary;
}

/** Resultado agregado da organização, com recorte por setor ou membro. */
export interface CompanyDashboard extends UserDashboard {
  // O recorte que esta resposta mostra; os dois nulos são a organização.
  department: DepartmentType | null;
  member_id: string | null;
  // Setores da organização, para o recorte do topo.
  departments: DepartmentType[];
  members: DashboardMember[];
  company_summary: CompanySummary;
  // Nulo no recorte de um funcionário: uma pessoa só não tem dispersão.
  alignment: TeamAlignment | null;
  // Uma linha por setor cadastrado na organização (pode ser nenhum), sempre
  // da organização inteira no período pedido: o recorte não muda o mapa.
  department_matrix: DepartmentRow[];
}

// ---------------------------------------------------------------------------
// MOCK
// ---------------------------------------------------------------------------

const ORGANIZATION_NAME = 'Acme Inc.';

// Notas da organização inteira em cada período.
const overallScores = {
  '2026/1': {
    seguranca_psicologica: 79,
    lideranca_adaptativa: 77,
    cultura_empreendedora: 67,
    adaptabilidade_cognitiva: 57,
    neuroinovacao_prisma: 54,
  },
  '2025/2': {
    seguranca_psicologica: 70,
    lideranca_adaptativa: 72,
    cultura_empreendedora: 60,
    adaptabilidade_cognitiva: 52,
    neuroinovacao_prisma: 48,
  },
  '2025/1': {
    seguranca_psicologica: 74,
    lideranca_adaptativa: 80,
    cultura_empreendedora: 61,
    adaptabilidade_cognitiva: 57,
    neuroinovacao_prisma: 50,
  },
} satisfies Record<string, PrismaScores>;

type MockPeriod = keyof typeof overallScores;

const LATEST_PERIOD: MockPeriod = '2026/1';

// Do mais recente para o mais antigo.
const periods: MockPeriod[] = [LATEST_PERIOD, '2025/2', '2025/1'];

// Quanto cada setor fica acima ou abaixo da organização, igual em todo
// período: o bastante para o mock ter números diferentes por setor.
const departmentOffsets: Record<DepartmentType, PrismaScores> = {
  Marketing: {
    seguranca_psicologica: 3,
    lideranca_adaptativa: -2,
    cultura_empreendedora: 3,
    adaptabilidade_cognitiva: 3,
    neuroinovacao_prisma: 4,
  },
  Financeiro: {
    seguranca_psicologica: -3,
    lideranca_adaptativa: -5,
    cultura_empreendedora: -9,
    adaptabilidade_cognitiva: -5,
    neuroinovacao_prisma: -7,
  },
  Administrativo: {
    seguranca_psicologica: -1,
    lideranca_adaptativa: 2,
    cultura_empreendedora: -6,
    adaptabilidade_cognitiva: 1,
    neuroinovacao_prisma: -3,
  },
  RecursosHumanos: {
    seguranca_psicologica: 6,
    lideranca_adaptativa: 3,
    cultura_empreendedora: -5,
    adaptabilidade_cognitiva: 14,
    neuroinovacao_prisma: -4,
  },
  TecnologiaInformacao: {
    seguranca_psicologica: -9,
    lideranca_adaptativa: 1,
    cultura_empreendedora: 7,
    adaptabilidade_cognitiva: -12,
    neuroinovacao_prisma: 7,
  },
};

// Quanto cada membro fica acima ou abaixo da organização.
const memberOffsets: Record<string, PrismaScores> = {
  '1': {
    seguranca_psicologica: 8,
    lideranca_adaptativa: -10,
    cultura_empreendedora: 12,
    adaptabilidade_cognitiva: 4,
    neuroinovacao_prisma: 9,
  },
  '2': {
    seguranca_psicologica: -12,
    lideranca_adaptativa: 15,
    cultura_empreendedora: 5,
    adaptabilidade_cognitiva: -8,
    neuroinovacao_prisma: 2,
  },
  '3': {
    seguranca_psicologica: 4,
    lideranca_adaptativa: 6,
    cultura_empreendedora: -4,
    adaptabilidade_cognitiva: 10,
    neuroinovacao_prisma: -6,
  },
};

const departments = Object.keys(departmentOffsets) as DepartmentType[];

function mapPrismas(fn: (prisma: (typeof PRISMAS)[number]) => number) {
  return Object.fromEntries(
    PRISMAS.map((prisma) => [prisma, fn(prisma)]),
  ) as PrismaScores;
}

function scoresOf(period: MockPeriod, offset: PrismaScores | undefined) {
  return mapPrismas(
    (prisma) => overallScores[period][prisma] + (offset?.[prisma] ?? 0),
  );
}

// Notas de cada dimensão da organização em cada período. Batem com os
// prismas acima (ex.: Segurança Psicológica = média de S6 e S7), menos com
// Neuroinovação: as notas dela no mock vieram antes da fórmula.
const overallDimensions: Record<MockPeriod, DimensionScores> = {
  '2026/1': { S2: 58, S4: 58, S5A: 60, S5B: 54, S6: 76, S7: 82, S8: 72 },
  '2025/2': { S2: 51, S4: 54, S5A: 55, S5B: 49, S6: 66, S7: 74, S8: 70 },
  '2025/1': { S2: 52, S4: 52, S5A: 59, S5B: 55, S6: 70, S7: 78, S8: 82 },
};

// Só para o mock ter dimensões diferentes por recorte: cada dimensão leva o
// desvio do recorte num prisma de que ela faz parte.
const DIMENSION_PRISMA: Record<Dimension, Prisma> = {
  S2: 'neuroinovacao_prisma',
  S4: 'cultura_empreendedora',
  S5A: 'adaptabilidade_cognitiva',
  S5B: 'adaptabilidade_cognitiva',
  S6: 'seguranca_psicologica',
  S7: 'seguranca_psicologica',
  S8: 'lideranca_adaptativa',
};

function dimensionsOf(period: MockPeriod, offset: PrismaScores | undefined) {
  return Object.fromEntries(
    DIMENSIONS.map((dimension) => [
      dimension,
      overallDimensions[period][dimension] +
        (offset?.[DIMENSION_PRISMA[dimension]] ?? 0),
    ]),
  ) as DimensionScores;
}

function resolvePeriod(period: string | undefined): MockPeriod {
  return periods.find((mockPeriod) => mockPeriod === period) ?? LATEST_PERIOD;
}

// O mock faz aqui o papel do back: recorta, monta todas as combinações de
// período e setor e calcula a variação. No back real, tudo chega pronto.
function buildResult(
  filters: DashboardFilters,
  comparableDepartments: DepartmentType[],
) {
  const period = resolvePeriod(filters.period);
  const viewOffset = filters.department
    ? departmentOffsets[filters.department]
    : filters.member_id
      ? memberOffsets[filters.member_id]
      : undefined;
  const scores = scoresOf(period, viewOffset);
  const dimensions = dimensionsOf(period, viewOffset);

  const otherPeriods = periods.filter((other) => other !== period);

  // A empresa toda só entra onde também há setores: na visão da empresa.
  const scopes: (ComparisonScope | null)[] =
    comparableDepartments.length > 0
      ? [null, 'organization', ...comparableDepartments]
      : [null];

  const comparisons: PrismaComparison[] = [null, ...otherPeriods].flatMap(
    (comparedPeriod) =>
      scopes
        .filter((scope) => comparedPeriod !== null || scope !== null)
        .map((scope) => {
          // O que vem nulo é o mesmo do que está sendo exibido; a empresa
          // toda não tem desvio.
          const referencePeriod = comparedPeriod ?? period;
          const referenceOffset =
            scope === null
              ? viewOffset
              : scope === 'organization'
                ? undefined
                : departmentOffsets[scope];
          const reference = scoresOf(referencePeriod, referenceOffset);
          return {
            period: comparedPeriod,
            scope,
            scores: reference,
            variation: mapPrismas(
              (prisma) => scores[prisma] - reference[prisma],
            ),
            dimensions: dimensionsOf(referencePeriod, referenceOffset),
          };
        }),
  );

  return {
    period,
    scores,
    dimensions,
    comparison_options: {
      periods,
      departments: comparableDepartments,
      default_period: periods[periods.indexOf(period) + 1] ?? null,
    },
    comparisons,
  };
}

const members: DashboardMember[] = [
  { id: '1', label: 'Neymar Jr' },
  { id: '2', label: 'Walter White' },
  { id: '3', label: 'Tom Cruise' },
];

// Daqui até `members`, o mock só existe para mostrar que o recorte muda a
// página inteira: os resumos saem das notas e do nome do recorte. No back
// real, os números vêm da agregação e o texto, da esteira de IA.
const MOCK_PRISMA_NAMES: Record<(typeof PRISMAS)[number], string> = {
  seguranca_psicologica: 'Segurança Psicológica',
  lideranca_adaptativa: 'Liderança Adaptativa',
  cultura_empreendedora: 'Cultura Empreendedora',
  adaptabilidade_cognitiva: 'Adaptabilidade Cognitiva',
  neuroinovacao_prisma: 'Neuroinovação',
};

const MOCK_DEPARTMENT_NAMES: Record<DepartmentType, string> = {
  Marketing: 'Marketing',
  Financeiro: 'Financeiro',
  Administrativo: 'Administrativo',
  RecursosHumanos: 'RH',
  TecnologiaInformacao: 'TI',
};

// Concluídos e convidados por setor; somam os 50/67 da organização.
const departmentParticipation: Record<DepartmentType, [number, number]> = {
  Marketing: [12, 14],
  Financeiro: [8, 12],
  Administrativo: [4, 11],
  RecursosHumanos: [9, 9],
  TecnologiaInformacao: [17, 21],
};

// Daqui até `buildAlignment`, o mock monta a distribuição a partir de um
// nível escolhido por prisma; no back real, ela sai das notas de cada pessoa.
type AlignmentLevel = PrismaAlignment['level'];

// Que parte do grupo cai em baixa, média e alta em cada formato.
const BAND_SHARES: Record<
  AlignmentLevel | 'alinhadoAlto',
  [number, number, number]
> = {
  alinhado: [0.1, 0.8, 0.1],
  alinhadoAlto: [0.05, 0.2, 0.75],
  moderado: [0.2, 0.5, 0.3],
  dividido: [0.4, 0.15, 0.45],
};

// O nível de cada prisma na organização; os setores giram a lista, para cada
// um ter um formato diferente.
const OVERALL_LEVELS: AlignmentLevel[] = [
  'alinhado',
  'moderado',
  'moderado',
  'alinhado',
  'dividido',
];

// A regra da P-058, como o back faria: dividido quando baixa e alta passam de
// 30% cada; alinhado quando uma faixa só tem 70% ou mais.
function levelOf(
  bands: PrismaAlignment['bands'],
  total: number,
): AlignmentLevel {
  if (bands.baixa / total > 0.3 && bands.alta / total > 0.3) return 'dividido';
  if (Math.max(bands.baixa, bands.media, bands.alta) / total >= 0.7)
    return 'alinhado';
  return 'moderado';
}

function buildDepartmentMatrix(period: MockPeriod): DepartmentRow[] {
  const overall = scoresOf(period, undefined);
  return departments.map((department) => {
    const scores = scoresOf(period, departmentOffsets[department]);
    return {
      department,
      respondents: departmentParticipation[department][0],
      scores,
      difference: mapPrismas((prisma) => scores[prisma] - overall[prisma]),
    };
  });
}

function buildAlignment(
  filters: DashboardFilters,
  scores: PrismaScores,
): TeamAlignment | null {
  if (filters.member_id) return null;
  const respondents = filters.department
    ? departmentParticipation[filters.department][0]
    : 50;
  if (respondents === 0) return { respondents, prismas: null };

  const shift = filters.department
    ? departments.indexOf(filters.department) + 1
    : 0;
  const entries = PRISMAS.map((prisma, index) => {
    const planned =
      OVERALL_LEVELS[(index + shift) % OVERALL_LEVELS.length] ?? 'moderado';
    const shares =
      BAND_SHARES[
        planned === 'alinhado' && scores[prisma] > 70 ? 'alinhadoAlto' : planned
      ];
    const baixa = Math.round(shares[0] * respondents);
    const alta = Math.round(shares[2] * respondents);
    const bands = { baixa, media: respondents - baixa - alta, alta };
    return [prisma, { bands, level: levelOf(bands, respondents) }] as const;
  });

  return {
    respondents,
    prismas: Object.fromEntries(entries) as Record<Prisma, PrismaAlignment>,
  };
}

function mockRecorteName(filters: DashboardFilters) {
  if (filters.department) return MOCK_DEPARTMENT_NAMES[filters.department];
  const member = members.find(({ id }) => id === filters.member_id);
  return member?.label ?? 'a equipe';
}

function buildCreedSummary(
  name: string,
  period: string,
  scores: PrismaScores,
): CreedSummary {
  const ordered = [...PRISMAS].sort((a, b) => scores[b] - scores[a]);
  return {
    analiseTexto: [
      `Análise de ${name} no período ${period}.`,
      'Segundo parágrafo da análise.',
    ],
    recomendacaoTexto: [
      `Recomendação para ${name}. Lorem ipsum dolor sit amet.`,
    ],
    prismas: mapPrismaTexts(
      (prisma) =>
        `Leitura breve de ${MOCK_PRISMA_NAMES[prisma]} para ${name}. Lorem ipsum dolor sit amet, consectetur.`,
    ),
    destaque: ordered[0] ?? 'seguranca_psicologica',
    oportunidade: ordered[ordered.length - 1] ?? 'neuroinovacao_prisma',
  };
}

function mapPrismaTexts(fn: (prisma: Prisma) => string) {
  return Object.fromEntries(
    PRISMAS.map((prisma) => [prisma, fn(prisma)]),
  ) as Record<Prisma, string>;
}

function buildCompanySummary(
  filters: DashboardFilters,
  scores: PrismaScores,
): CompanySummary {
  const ordered = [...PRISMAS].sort((a, b) => scores[b] - scores[a]);
  const highlight = (prisma: (typeof PRISMAS)[number], descricao: string) => ({
    titulo: MOCK_PRISMA_NAMES[prisma],
    valor: scores[prisma],
    descricao,
  });
  const [concluidos, convidados] = filters.department
    ? departmentParticipation[filters.department]
    : filters.member_id
      ? [1, 1]
      : [50, 67];
  const name = mockRecorteName(filters);

  return {
    concluidos,
    convidados,
    destaque: highlight(
      ordered[0] ?? 'seguranca_psicologica',
      `O ponto mais forte de ${name}.`,
    ),
    oportunidade: highlight(
      ordered[ordered.length - 1] ?? 'neuroinovacao_prisma',
      `Onde ${name} tem mais espaço para crescer.`,
    ),
    // "Mais comum" ainda não tem definição: o mock usa a nota do meio.
    maisComum: highlight(
      ordered[2] ?? 'cultura_empreendedora',
      `A nota mais próxima da média de ${name}.`,
    ),
  };
}

export const dashboardsApi = {
  getUserDashboard: (
    filters: Pick<DashboardFilters, 'period'> = {},
  ): Promise<UserDashboard> => {
    const result = buildResult(filters, []);
    return Promise.resolve({
      organization_name: ORGANIZATION_NAME,
      periods,
      ...result,
      creed_summary: buildCreedSummary('você', result.period, result.scores),
    });
  },

  getCompanyDashboard: (
    filters: DashboardFilters,
  ): Promise<CompanyDashboard> => {
    const result = buildResult(filters, departments);
    return Promise.resolve({
      organization_name: ORGANIZATION_NAME,
      periods,
      ...result,
      department: filters.department ?? null,
      member_id: filters.member_id ?? null,
      creed_summary: buildCreedSummary(
        mockRecorteName(filters),
        result.period,
        result.scores,
      ),
      departments,
      members,
      company_summary: buildCompanySummary(filters, result.scores),
      alignment: buildAlignment(filters, result.scores),
      department_matrix: buildDepartmentMatrix(result.period),
    });
  },
};
