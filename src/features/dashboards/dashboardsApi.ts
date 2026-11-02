// Chamadas ao backend para o domínio dashboards.
//
// Hoje é tudo MOCK: no back, `dashboards` tem tabela e schema
// (`DashboardResponse`: só `user_id`, `form_id`, `is_private`), mas a rota é
// stub, e os números do radar dependem de `prismas` e `insights`, que também
// não têm rota. Os dados ficam aqui, e não na tela, para que integrar seja
// trocar o corpo das funções por `apiClient.get` — o slice e as telas não
// mudam. Lembrete do princípio 1: o back entrega os números prontos; a tela
// não soma nem agrupa.
import type { PrismaPeriod } from './components/PrismaRadarChart';

// ---------------------------------------------------------------------------
// Formas PROVISÓRIAS da tela. Moram aqui, e não em types/api.ts, porque
// dependem do `PrismaPeriod` do radar e só a feature dashboards as usa.
// ---------------------------------------------------------------------------

export interface DashboardHighlight {
  titulo: string;
  valor: number;
  descricao: string;
}

export interface CreedSummary {
  destaqueTexto: string;
  oportunidadeTexto: string;
  analiseTexto: string[];
  recomendacaoTexto: string[];
}

export interface CompanySummary {
  concluidos: number;
  convidados: number;
  destaque: DashboardHighlight;
  oportunidade: DashboardHighlight;
  maisComum: DashboardHighlight;
}

export interface DashboardGroup {
  id: string;
  // Chave de i18n: os grupos de hoje são fixos da tela.
  labelKey:
    'dashboard:Geral' | 'dashboard:Gerentes' | 'dashboard:Colaboradores';
}

export interface DashboardMember {
  id: string;
  label: string;
}

/** Resultado de quem está logado. */
export interface UserDashboard {
  organization_name: string;
  periods: string[];
  current: PrismaPeriod;
  previous: PrismaPeriod;
  creed_summary: CreedSummary;
}

/** Resultado agregado da organização, com recorte por grupo ou membro. */
export interface CompanyDashboard extends UserDashboard {
  groups: DashboardGroup[];
  members: DashboardMember[];
  company_summary: CompanySummary;
}

// ---------------------------------------------------------------------------
// MOCK
// ---------------------------------------------------------------------------

const ORGANIZATION_NAME = 'Acme Inc.';

const periods = ['2026/1', '2025/2', '2025/1'];

const currentPeriod: PrismaPeriod = {
  label: '2026/1',
  scores: {
    plasticidade_humana: 79,
    tomada_decisao: 77,
    empreendedorismo: 67,
    multiculturalismo: 57,
    neuroinovacao: 54,
  },
};

const previousPeriod: PrismaPeriod = {
  label: '2025/2',
  scores: {
    plasticidade_humana: 70,
    tomada_decisao: 72,
    empreendedorismo: 60,
    multiculturalismo: 52,
    neuroinovacao: 48,
  },
};

const creedSummary: CreedSummary = {
  destaqueTexto: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
  oportunidadeTexto: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
  analiseTexto: [
    'Primeiro parágrafo da análise.',
    'Segundo parágrafo da análise.',
  ],
  recomendacaoTexto: [
    'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
  ],
};

const companySummary: CompanySummary = {
  concluidos: 50,
  convidados: 67,
  destaque: {
    titulo: 'Inovação',
    valor: 79,
    descricao:
      'A equipe demonstra abertura consistente a novas abordagens e experimentação em ciclos curtos.',
  },
  oportunidade: {
    titulo: 'Neuroinovação',
    valor: 54,
    descricao:
      'A equipe demonstra abertura consistente a novas abordagens e experimentação em ciclos curtos.',
  },
  maisComum: {
    titulo: 'Cultura',
    valor: 67,
    descricao:
      'A equipe demonstra abertura consistente a novas abordagens e experimentação em ciclos curtos.',
  },
};

const groups: DashboardGroup[] = [
  { id: 'geral', labelKey: 'dashboard:Geral' },
  { id: 'gerentes', labelKey: 'dashboard:Gerentes' },
  { id: 'colaboradores', labelKey: 'dashboard:Colaboradores' },
];

const members: DashboardMember[] = [
  { id: '1', label: 'Neymar Jr' },
  { id: '2', label: 'Walter White' },
  { id: '3', label: 'Tom Cruise' },
];

const userDashboard: UserDashboard = {
  organization_name: ORGANIZATION_NAME,
  periods,
  current: currentPeriod,
  previous: previousPeriod,
  creed_summary: creedSummary,
};

export const dashboardsApi = {
  getUserDashboard: (): Promise<UserDashboard> =>
    Promise.resolve(userDashboard),

  getCompanyDashboard: (): Promise<CompanyDashboard> =>
    Promise.resolve({
      ...userDashboard,
      groups,
      members,
      company_summary: companySummary,
    }),
};
