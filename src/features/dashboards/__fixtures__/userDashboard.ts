// Respostas do `GET /dashboards/me` para os testes da tela individual. São os
// números do mock que a tela usava antes de ser ligada ao back, no formato do
// contrato: o período é um id, e o rótulo é a data final.
import type { PeriodOption, UserDashboard } from '../dashboardsApi';

export const PERIODOS: PeriodOption[] = [
  {
    id: 'periodo-2026-1',
    opens_at: '2026-01-01T12:00:00Z',
    closes_at: '2026-06-30T12:00:00Z',
  },
  {
    id: 'periodo-2025-2',
    opens_at: '2025-07-01T12:00:00Z',
    closes_at: '2025-12-31T12:00:00Z',
  },
  {
    id: 'periodo-2025-1',
    opens_at: '2025-01-01T12:00:00Z',
    closes_at: '2025-06-30T12:00:00Z',
  },
];

// Os rótulos que a tela mostra em português, na ordem de `PERIODOS`.
export const ROTULOS = {
  recente: '30/06/2026',
  anterior: '31/12/2025',
  antigo: '30/06/2025',
} as const;

const porPeriodo: Record<string, UserDashboard> = {
  'periodo-2026-1': {
    organization_name: 'Acme Inc.',
    periods: [
      {
        id: 'periodo-2026-1',
        opens_at: '2026-01-01T12:00:00Z',
        closes_at: '2026-06-30T12:00:00Z',
      },
      {
        id: 'periodo-2025-2',
        opens_at: '2025-07-01T12:00:00Z',
        closes_at: '2025-12-31T12:00:00Z',
      },
      {
        id: 'periodo-2025-1',
        opens_at: '2025-01-01T12:00:00Z',
        closes_at: '2025-06-30T12:00:00Z',
      },
    ],
    period: 'periodo-2026-1',
    scores: {
      seguranca_psicologica: 79,
      lideranca_adaptativa: 77,
      cultura_empreendedora: 67,
      adaptabilidade_cognitiva: 57,
      neuroinovacao_prisma: 54,
    },
    dimensions: {
      S2: 58,
      S4: 58,
      S5A: 60,
      S5B: 54,
      S6: 76,
      S7: 82,
      S8: 72,
    },
    comparison_options: {
      periods: ['periodo-2026-1', 'periodo-2025-2', 'periodo-2025-1'],
      departments: [],
      default_period: 'periodo-2025-2',
    },
    comparisons: [
      {
        period: 'periodo-2025-2',
        scope: null,
        scores: {
          seguranca_psicologica: 70,
          lideranca_adaptativa: 72,
          cultura_empreendedora: 60,
          adaptabilidade_cognitiva: 52,
          neuroinovacao_prisma: 48,
        },
        variation: {
          seguranca_psicologica: 9,
          lideranca_adaptativa: 5,
          cultura_empreendedora: 7,
          adaptabilidade_cognitiva: 5,
          neuroinovacao_prisma: 6,
        },
        dimensions: {
          S2: 51,
          S4: 54,
          S5A: 55,
          S5B: 49,
          S6: 66,
          S7: 74,
          S8: 70,
        },
      },
      {
        period: 'periodo-2025-1',
        scope: null,
        scores: {
          seguranca_psicologica: 74,
          lideranca_adaptativa: 80,
          cultura_empreendedora: 61,
          adaptabilidade_cognitiva: 57,
          neuroinovacao_prisma: 50,
        },
        variation: {
          seguranca_psicologica: 5,
          lideranca_adaptativa: -3,
          cultura_empreendedora: 6,
          adaptabilidade_cognitiva: 0,
          neuroinovacao_prisma: 4,
        },
        dimensions: {
          S2: 52,
          S4: 52,
          S5A: 59,
          S5B: 55,
          S6: 70,
          S7: 78,
          S8: 82,
        },
      },
    ],
    creed_summary: {
      analiseTexto: [
        'Análise de você no período 2026/1.',
        'Segundo parágrafo da análise.',
      ],
      recomendacaoTexto: [
        'Recomendação para você. Lorem ipsum dolor sit amet.',
      ],
      prismas: {
        seguranca_psicologica:
          'Leitura breve de Segurança Psicológica para você. Lorem ipsum dolor sit amet, consectetur.',
        lideranca_adaptativa:
          'Leitura breve de Liderança Adaptativa para você. Lorem ipsum dolor sit amet, consectetur.',
        cultura_empreendedora:
          'Leitura breve de Cultura Empreendedora para você. Lorem ipsum dolor sit amet, consectetur.',
        adaptabilidade_cognitiva:
          'Leitura breve de Adaptabilidade Cognitiva para você. Lorem ipsum dolor sit amet, consectetur.',
        neuroinovacao_prisma:
          'Leitura breve de Neuroinovação para você. Lorem ipsum dolor sit amet, consectetur.',
      },
      destaque: 'seguranca_psicologica',
      oportunidade: 'neuroinovacao_prisma',
    },
  },
  'periodo-2025-2': {
    organization_name: 'Acme Inc.',
    periods: [
      {
        id: 'periodo-2026-1',
        opens_at: '2026-01-01T12:00:00Z',
        closes_at: '2026-06-30T12:00:00Z',
      },
      {
        id: 'periodo-2025-2',
        opens_at: '2025-07-01T12:00:00Z',
        closes_at: '2025-12-31T12:00:00Z',
      },
      {
        id: 'periodo-2025-1',
        opens_at: '2025-01-01T12:00:00Z',
        closes_at: '2025-06-30T12:00:00Z',
      },
    ],
    period: 'periodo-2025-2',
    scores: {
      seguranca_psicologica: 70,
      lideranca_adaptativa: 72,
      cultura_empreendedora: 60,
      adaptabilidade_cognitiva: 52,
      neuroinovacao_prisma: 48,
    },
    dimensions: {
      S2: 51,
      S4: 54,
      S5A: 55,
      S5B: 49,
      S6: 66,
      S7: 74,
      S8: 70,
    },
    comparison_options: {
      periods: ['periodo-2026-1', 'periodo-2025-2', 'periodo-2025-1'],
      departments: [],
      default_period: 'periodo-2025-1',
    },
    comparisons: [
      {
        period: 'periodo-2026-1',
        scope: null,
        scores: {
          seguranca_psicologica: 79,
          lideranca_adaptativa: 77,
          cultura_empreendedora: 67,
          adaptabilidade_cognitiva: 57,
          neuroinovacao_prisma: 54,
        },
        variation: {
          seguranca_psicologica: -9,
          lideranca_adaptativa: -5,
          cultura_empreendedora: -7,
          adaptabilidade_cognitiva: -5,
          neuroinovacao_prisma: -6,
        },
        dimensions: {
          S2: 58,
          S4: 58,
          S5A: 60,
          S5B: 54,
          S6: 76,
          S7: 82,
          S8: 72,
        },
      },
      {
        period: 'periodo-2025-1',
        scope: null,
        scores: {
          seguranca_psicologica: 74,
          lideranca_adaptativa: 80,
          cultura_empreendedora: 61,
          adaptabilidade_cognitiva: 57,
          neuroinovacao_prisma: 50,
        },
        variation: {
          seguranca_psicologica: -4,
          lideranca_adaptativa: -8,
          cultura_empreendedora: -1,
          adaptabilidade_cognitiva: -5,
          neuroinovacao_prisma: -2,
        },
        dimensions: {
          S2: 52,
          S4: 52,
          S5A: 59,
          S5B: 55,
          S6: 70,
          S7: 78,
          S8: 82,
        },
      },
    ],
    creed_summary: {
      analiseTexto: [
        'Análise de você no período 2025/2.',
        'Segundo parágrafo da análise.',
      ],
      recomendacaoTexto: [
        'Recomendação para você. Lorem ipsum dolor sit amet.',
      ],
      prismas: {
        seguranca_psicologica:
          'Leitura breve de Segurança Psicológica para você. Lorem ipsum dolor sit amet, consectetur.',
        lideranca_adaptativa:
          'Leitura breve de Liderança Adaptativa para você. Lorem ipsum dolor sit amet, consectetur.',
        cultura_empreendedora:
          'Leitura breve de Cultura Empreendedora para você. Lorem ipsum dolor sit amet, consectetur.',
        adaptabilidade_cognitiva:
          'Leitura breve de Adaptabilidade Cognitiva para você. Lorem ipsum dolor sit amet, consectetur.',
        neuroinovacao_prisma:
          'Leitura breve de Neuroinovação para você. Lorem ipsum dolor sit amet, consectetur.',
      },
      destaque: 'lideranca_adaptativa',
      oportunidade: 'neuroinovacao_prisma',
    },
  },
  'periodo-2025-1': {
    organization_name: 'Acme Inc.',
    periods: [
      {
        id: 'periodo-2026-1',
        opens_at: '2026-01-01T12:00:00Z',
        closes_at: '2026-06-30T12:00:00Z',
      },
      {
        id: 'periodo-2025-2',
        opens_at: '2025-07-01T12:00:00Z',
        closes_at: '2025-12-31T12:00:00Z',
      },
      {
        id: 'periodo-2025-1',
        opens_at: '2025-01-01T12:00:00Z',
        closes_at: '2025-06-30T12:00:00Z',
      },
    ],
    period: 'periodo-2025-1',
    scores: {
      seguranca_psicologica: 74,
      lideranca_adaptativa: 80,
      cultura_empreendedora: 61,
      adaptabilidade_cognitiva: 57,
      neuroinovacao_prisma: 50,
    },
    dimensions: {
      S2: 52,
      S4: 52,
      S5A: 59,
      S5B: 55,
      S6: 70,
      S7: 78,
      S8: 82,
    },
    comparison_options: {
      periods: ['periodo-2026-1', 'periodo-2025-2', 'periodo-2025-1'],
      departments: [],
      default_period: null,
    },
    comparisons: [
      {
        period: 'periodo-2026-1',
        scope: null,
        scores: {
          seguranca_psicologica: 79,
          lideranca_adaptativa: 77,
          cultura_empreendedora: 67,
          adaptabilidade_cognitiva: 57,
          neuroinovacao_prisma: 54,
        },
        variation: {
          seguranca_psicologica: -5,
          lideranca_adaptativa: 3,
          cultura_empreendedora: -6,
          adaptabilidade_cognitiva: 0,
          neuroinovacao_prisma: -4,
        },
        dimensions: {
          S2: 58,
          S4: 58,
          S5A: 60,
          S5B: 54,
          S6: 76,
          S7: 82,
          S8: 72,
        },
      },
      {
        period: 'periodo-2025-2',
        scope: null,
        scores: {
          seguranca_psicologica: 70,
          lideranca_adaptativa: 72,
          cultura_empreendedora: 60,
          adaptabilidade_cognitiva: 52,
          neuroinovacao_prisma: 48,
        },
        variation: {
          seguranca_psicologica: 4,
          lideranca_adaptativa: 8,
          cultura_empreendedora: 1,
          adaptabilidade_cognitiva: 5,
          neuroinovacao_prisma: 2,
        },
        dimensions: {
          S2: 51,
          S4: 54,
          S5A: 55,
          S5B: 49,
          S6: 66,
          S7: 74,
          S8: 70,
        },
      },
    ],
    creed_summary: {
      analiseTexto: [
        'Análise de você no período 2025/1.',
        'Segundo parágrafo da análise.',
      ],
      recomendacaoTexto: [
        'Recomendação para você. Lorem ipsum dolor sit amet.',
      ],
      prismas: {
        seguranca_psicologica:
          'Leitura breve de Segurança Psicológica para você. Lorem ipsum dolor sit amet, consectetur.',
        lideranca_adaptativa:
          'Leitura breve de Liderança Adaptativa para você. Lorem ipsum dolor sit amet, consectetur.',
        cultura_empreendedora:
          'Leitura breve de Cultura Empreendedora para você. Lorem ipsum dolor sit amet, consectetur.',
        adaptabilidade_cognitiva:
          'Leitura breve de Adaptabilidade Cognitiva para você. Lorem ipsum dolor sit amet, consectetur.',
        neuroinovacao_prisma:
          'Leitura breve de Neuroinovação para você. Lorem ipsum dolor sit amet, consectetur.',
      },
      destaque: 'lideranca_adaptativa',
      oportunidade: 'neuroinovacao_prisma',
    },
  },
};

/** O resultado de um período; sem período, o mais recente. */
export function userDashboardFixture(period?: string): UserDashboard {
  const resultado = porPeriodo[period ?? 'periodo-2026-1'];
  if (!resultado) throw new Error(`período sem fixture: ${String(period)}`);
  return structuredClone(resultado);
}
