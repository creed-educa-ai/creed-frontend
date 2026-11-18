// Respostas do `GET /dashboards/overview` para os testes do retrato atual da
// administradora.
import type {
  OverviewDashboard,
  OverviewKind,
} from '@/features/dashboards/dashboardsApi';
import type { Prisma } from '@/types/api';

function notas(valor: number): Record<Prisma, number> {
  return {
    seguranca_psicologica: valor,
    lideranca_adaptativa: valor,
    cultura_empreendedora: valor,
    adaptabilidade_cognitiva: valor,
    neuroinovacao_prisma: valor,
  };
}

// O retrato atual, como o back devolve: duas empresas, ou um mentorando.
export function retrato(kind: OverviewKind): OverviewDashboard {
  const grupos =
    kind === 'companies'
      ? [
          { id: 'org-a', label: 'Empresa A', valor: 70 },
          { id: 'org-b', label: 'Empresa B', valor: 50 },
        ]
      : [{ id: 'link-m1', label: 'Mentorando 1', valor: 80 }];
  const destaque = { prisma: 'seguranca_psicologica' as const, valor: 60 };
  return {
    kind,
    responses_from: '2026-09-01T12:00:00Z',
    responses_to: '2026-10-15T12:00:00Z',
    scores: notas(60),
    dimensions: { S2: 60, S4: 60, S5A: 60, S5B: 60, S6: 60, S7: 60, S8: 60 },
    company_summary: {
      concluidos: 9,
      convidados: 10,
      destaque,
      oportunidade: destaque,
      maisComum: destaque,
    },
    alignment: { respondents: 9, prismas: null },
    groups: grupos.map(({ id, label, valor }) => ({
      id,
      label,
      respondents: 3,
      scores: notas(valor),
      difference: notas(valor - 60),
    })),
    comparisons: grupos.map(({ id, valor }) => ({
      period: null,
      scope: id,
      scores: notas(valor),
      variation: notas(60 - valor),
      dimensions: {
        S2: valor,
        S4: valor,
        S5A: valor,
        S5B: valor,
        S6: valor,
        S7: valor,
        S8: valor,
      },
    })),
    creed_summary: {
      analiseTexto: [],
      recomendacaoTexto: [],
      prismas: {} as never,
      destaque: 'seguranca_psicologica',
      oportunidade: 'seguranca_psicologica',
      // O retrato atual não tem insight.
      insight_status: 'none',
      generated_at: null,
    },
  };
}
