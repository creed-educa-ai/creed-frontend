import type { DepartmentType } from '@/types/api';

// A cor de cada setor é token do tema (`--department-*` em `src/index.css`):
// o critério da escolha está comentado lá.
// Os setores que existem, na ordem em que aparecem nos menus.
export const DEPARTMENTS: DepartmentType[] = [
  'Marketing',
  'Financeiro',
  'Administrativo',
  'RecursosHumanos',
  'TecnologiaInformacao',
];

export const DEPARTMENT_COLORS: Record<DepartmentType, string> = {
  Marketing: 'bg-department-marketing',
  Financeiro: 'bg-department-finance',
  Administrativo: 'bg-department-administrative',
  RecursosHumanos: 'bg-department-human-resources',
  TecnologiaInformacao: 'bg-department-it',
};
