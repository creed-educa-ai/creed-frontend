import type { DepartmentType } from '@/types/api';

// PLACEHOLDER: a cor de cada setor ainda não foi definida com a cliente.
// Marketing e Recursos Humanos vêm das tags antigas da tabela de membros, e
// Financeiro do azul de "vendas" de lá; Administrativo e TI são tons novos no
// mesmo estilo (saturados, com texto claro). Quando a identidade visual
// fechar, viram tokens do tema em `src/index.css` e saem do hex.
export const DEPARTMENT_COLORS: Record<DepartmentType, string> = {
  Marketing: 'bg-[#009E4F]',
  Financeiro: 'bg-[#008AC9]',
  Administrativo: 'bg-[#C25E00]',
  RecursosHumanos: 'bg-[#8B1E8B]',
  TecnologiaInformacao: 'bg-[#C2185B]',
};
