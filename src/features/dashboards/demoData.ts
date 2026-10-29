// Dados fictícios das duas telas de dashboard. Saem quando o domínio
// dashboards do backend existir (hoje é stub) e a integração entrar.
import type { PrismaPeriod } from './components/PrismaRadarChart';

export const ORGANIZATION_NAME = 'Acme Inc.';

// TODO: períodos, grupos e membros virão do backend
export const periods = ['2026/1', '2025/2', '2025/1'];

export const groups = [
  { id: 'geral', labelKey: 'dashboard:Geral' },
  { id: 'gerentes', labelKey: 'dashboard:Gerentes' },
  { id: 'colaboradores', labelKey: 'dashboard:Colaboradores' },
] as const;

export const members = [
  { id: '1', label: 'Neymar Jr' },
  { id: '2', label: 'Walter White' },
  { id: '3', label: 'Tom Cruise' },
];

export const currentPeriod: PrismaPeriod = {
  label: '2026/1',
  scores: {
    plasticidade_humana: 79,
    tomada_decisao: 77,
    empreendedorismo: 67,
    multiculturalismo: 57,
    neuroinovacao: 54,
  },
};

export const previousPeriod: PrismaPeriod = {
  label: '2025/2',
  scores: {
    plasticidade_humana: 70,
    tomada_decisao: 72,
    empreendedorismo: 60,
    multiculturalismo: 52,
    neuroinovacao: 48,
  },
};

export const companySummary = {
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

export const creedSummary = {
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
