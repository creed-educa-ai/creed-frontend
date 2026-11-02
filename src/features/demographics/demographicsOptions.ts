// Opções do formulário demográfico. Os valores são os dos enums de
// app/domains/demographics/models.py; o `satisfies` faz o compilador acusar
// qualquer valor que o back não aceite.
import type {
  AgeRange,
  BrazilState,
  Ethnicity,
  Gender,
  Nationality,
  PortugalRegion,
  Religion,
} from '@/types/api';

export const genderValues = [
  'feminino',
  'masculino',
  'nao_binario',
  'prefiro_nao_informar',
] as const satisfies readonly Gender[];

export const ageRangeValues = [
  '18_25',
  '26_35',
  '36_45',
  '46_55',
  '56_65',
  '65_mais',
  'prefiro_nao_informar',
] as const satisfies readonly AgeRange[];

export const ethnicityValues = [
  'africana_afrodescendente',
  'indigena_amerindia',
  'europeia',
  'asiatica',
  'arabe_medio_oriente',
  'latino_americana',
  'romani_cigana',
  'multipla_hibrida',
  'prefiro_nao_responder',
] as const satisfies readonly Ethnicity[];

export const religionValues = [
  'crista',
  'judaica',
  'islamica',
  'matriz_africana',
  'espiritismo',
  'budismo',
  'sem_religiao',
  'outra',
  'prefiro_nao_responder',
] as const satisfies readonly Religion[];

export const nationalityValues = [
  'brasileira',
  'portuguesa',
  'outra',
] as const satisfies readonly Nationality[];

export const brazilStateValues = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const satisfies readonly BrazilState[];

export const portugalRegionValues = [
  'norte',
  'centro',
  'area_metropolitana_lisboa',
  'alentejo',
  'algarve',
  'acores',
  'madeira',
] as const satisfies readonly PortugalRegion[];
