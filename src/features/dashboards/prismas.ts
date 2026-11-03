import type { Dimension, Prisma } from '@/types/api';

// Os cinco eixos do radar são os prismas do back (enum `Prisma`), na ordem
// dele: o recharts desenha em sentido horário a partir do topo.
export const PRISMAS: readonly Prisma[] = [
  'seguranca_psicologica',
  'lideranca_adaptativa',
  'cultura_empreendedora',
  'adaptabilidade_cognitiva',
  'neuroinovacao_prisma',
];

// As sete dimensões da Matriz CREED, na ordem do questionário. Cada prisma é
// a média de algumas delas (`app/domains/prismas/utils.py` no back).
export const DIMENSIONS: readonly Dimension[] = [
  'S2',
  'S4',
  'S5A',
  'S5B',
  'S6',
  'S7',
  'S8',
];

export type DimensionScores = Record<Dimension, number>;
