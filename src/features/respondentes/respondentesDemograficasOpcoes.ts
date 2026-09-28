// Valores do rascunho de UI. O contrato da API será definido na CREED-20.1.

export const genderValues = [
  'feminino',
  'masculino',
  'nao_binario',
  'prefiro_nao_informar',
] as const;

export const ageRangeValues = [
  '18_25',
  '26_35',
  '36_45',
  '46_55',
  '56_65',
  '65_mais',
  'prefiro_nao_informar',
] as const;

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
] as const;

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
] as const;

export const nationalityValues = ['brasileira', 'portuguesa', 'outra'] as const;

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
] as const;

export const portugalRegionValues = [
  'norte',
  'centro',
  'area_metropolitana_lisboa',
  'alentejo',
  'algarve',
  'acores',
  'madeira',
] as const;
