// Tipos espelhando os schemas Pydantic do backend (ADR-002).
// Mantê-los sincronizados manualmente por ora; quando os contratos
// estabilizarem, avaliar geração automática a partir do OpenAPI.

export interface Respondente {
  id: string;
  nome: string;
  email: string;
  data_nascimento: string | null;
  idade: number | null;
  genero: string | null;
  regiao: string | null;
  pais: string | null;
  criado_em: string;
}

export interface ListaPaginada<T> {
  itens: T[];
  total: number;
  pagina: number;
  tamanho_pagina: number;
}

export interface RespondenteCreate {
  nome: string;
  email: string;
  data_nascimento?: string | null;
  genero?: string | null;
  regiao?: string | null;
  pais?: string | null;
}

// Domínio authentication
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface UserSessionResponse {
  id: string;
  email: string;
  role: string | null;
  link_id: string | null;
  organization_id: string | null;
  organization_name: string | null;
}

export interface SessionResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: UserSessionResponse;
}

// Domínio forms (app/domains/forms/schemas.py)
export type FormStatus = 'draft' | 'published' | 'closed';

export interface FormRead {
  id: string;
  name: string;
  organization_id: string;
  status: FormStatus;
  created_at: string;
}

// Domínio questions (app/domains/questions/schemas.py)
export type QuestionType = 'objective' | 'descriptive';

// Valores provisórios no back (P-020).
export type QuestionSection = 'profile' | 'assessment' | 'closing';

export type Prisma =
  | 'plasticidade_humana'
  | 'empreendedorismo'
  | 'multiculturalismo'
  | 'neuroinovacao'
  | 'tomada_decisao';

export interface QuestionResponse {
  id: string;
  form_id: string;
  text: string;
  order_index: number;
  type: QuestionType;
  section: QuestionSection;
  required: boolean;
  prisma: Prisma | null;
  created_at: string;
}

// Domínio responses (app/domains/responses/schemas.py)
export type FormResponseStatus = 'in_progress' | 'submitted';

// O vínculo não vai no corpo: o back usa o do login.
export interface FormResponseCreate {
  form_id: string;
}

export interface FormResponseResponse {
  id: string;
  form_id: string;
  // O back ainda não renomeou este campo para link_id (CREED-47).
  vinculo_id: string;
  status: FormResponseStatus;
  started_at: string;
  submitted_at: string | null;
}

export interface AnswerCreate {
  question_id: string;
  option_id?: string | null;
  value?: string | null;
}

export interface AnswerResponse {
  id: string;
  form_response_id: string;
  question_id: string;
  option_id: string | null;
  value: string | null;
  created_at: string;
}
