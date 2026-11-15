// Chamadas ao backend para o domínio dashboards.
//
// Os dois dashboards vêm do back: `GET /dashboards/me` (o resultado de quem
// está logado) e `GET /dashboards/company` (o da organização, com recorte).
// Lembrete do princípio 1: o back entrega os números prontos; a tela não soma
// nem agrupa.
import { apiClient } from '@/lib/apiClient';
import type { DepartmentType, Prisma } from '@/types/api';
import type { PrismaScores } from './components/PrismaRadarChart';
import type { DimensionScores } from './prismas';

// ---------------------------------------------------------------------------
// Formas PROVISÓRIAS da tela. Moram aqui, e não em types/api.ts, porque
// dependem do `PrismaScores` do radar e só a feature dashboards as usa.
// ---------------------------------------------------------------------------

// Um card do resumo executivo. O back manda só o prisma e a nota: o título e a
// descrição saem do i18n (em inglês e espanhol, texto do back sairia em
// português).
export interface DashboardHighlight {
  prisma: Prisma;
  valor: number;
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
  // Um `ComparisonScope` (setor ou `organization`) no dashboard da empresa; no
  // retrato atual da administradora, o id de uma empresa ou de um mentorando.
  scope: string | null;
  scores: PrismaScores;
  variation: PrismaScores;
  // Notas das sete dimensões da referência.
  dimensions: DimensionScores;
}

/**
 * Quantas pessoas do recorte ficaram em cada faixa de nota de um prisma, e a
 * leitura disso. Faixas e regra do nível: P-061 e P-062.
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
  // Só a administradora manda: a organização dela é a CREED, não a que quer ver.
  organization_id?: string | undefined;
  department?: DepartmentType | undefined;
  member_id?: string | undefined;
}

export interface DashboardMember {
  id: string;
  label: string;
}

/**
 * Um período que dá para escolher: um questionário com datas. O id é o do
 * formulário; o rótulo da tela é a data final (`periodLabeler`).
 */
export interface PeriodOption {
  id: string;
  opens_at: string;
  closes_at: string;
}

// O que os dois dashboards têm em comum. Cada um diz como são os períodos.
interface DashboardResult {
  organization_name: string;
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

/**
 * Resultado de quem está logado (`GET /dashboards/me`). Só os períodos em que
 * a pessoa respondeu, do mais recente ao mais antigo. Os textos do Creed.ai
 * vêm vazios até a esteira de IA existir.
 */
export interface UserDashboard extends DashboardResult {
  periods: PeriodOption[];
  // O nome do mentorando, quando a administradora vê o resultado dele. Nulo
  // (ou ausente) no próprio resultado.
  member_name?: string | null;
}

/** Resultado agregado da organização, com recorte por setor ou membro. */
export interface CompanyDashboard extends DashboardResult {
  // Os períodos "para todos" com resposta, do mais recente ao mais antigo (no
  // recorte de uma pessoa, os dela, inclusive os individuais).
  periods: PeriodOption[];
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

/** Uma empresa (ou um mentorando) no mapa do retrato atual. */
export interface OverviewGroup {
  id: string;
  label: string;
  respondents: number;
  scores: PrismaScores;
  // O grupo menos a média geral.
  difference: PrismaScores;
}

export type OverviewKind = 'companies' | 'mentees';

/**
 * O retrato atual (`GET /dashboards/overview`), só da administradora: cada
 * pessoa entra com a resposta mais recente que enviou, seja qual for o
 * período. Não há filtro de período: as empresas e os mentorandos respondem a
 * qualquer hora. As comparações são com cada grupo (`period` nulo, `scope` o
 * id do grupo).
 */
export interface OverviewDashboard {
  kind: OverviewKind;
  responses_from: string;
  responses_to: string;
  scores: PrismaScores;
  dimensions: DimensionScores;
  company_summary: CompanySummary;
  alignment: TeamAlignment;
  groups: OverviewGroup[];
  comparisons: PrismaComparison[];
  creed_summary: CreedSummary;
}

export const dashboardsApi = {
  // Qualquer papel, só o próprio resultado. Com `member_id`, o de um
  // mentorando, que só a administradora pede. Sem período, o mais recente que a
  // pessoa respondeu. 404: ela ainda não enviou nenhum questionário.
  getUserDashboard: (
    filters: Pick<DashboardFilters, 'period' | 'member_id'> = {},
  ) => {
    const query = filters.period
      ? `?${new URLSearchParams({ period: filters.period })}`
      : '';
    const path = filters.member_id
      ? `/dashboards/members/${encodeURIComponent(filters.member_id)}`
      : '/dashboards/me';
    return apiClient.get<UserDashboard>(`${path}${query}`);
  },

  // Gestora: a própria organização. Administradora: a do `organization_id`.
  // 404: a organização ainda não tem resultado (ou o recorte não tem resposta
  // no período). O `signal` cancela a carga anterior quando o filtro muda.
  getCompanyDashboard: (filters: DashboardFilters, signal?: AbortSignal) => {
    const params = new URLSearchParams();
    const { period, organization_id, department, member_id } = filters;
    if (period) params.set('period', period);
    if (organization_id) params.set('organization_id', organization_id);
    if (department) params.set('department', department);
    if (member_id) params.set('member_id', member_id);
    const query = params.toString();
    return apiClient.get<CompanyDashboard>(
      `/dashboards/company${query ? `?${query}` : ''}`,
      signal ? { signal } : undefined,
    );
  },

  // Só a administradora. 404: ninguém respondeu ainda.
  getOverview: (kind: OverviewKind, signal?: AbortSignal) =>
    apiClient.get<OverviewDashboard>(
      `/dashboards/overview?kind=${kind}`,
      signal ? { signal } : undefined,
    ),
};
