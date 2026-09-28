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
  vinculo_id: string | null;
  organization_id: string | null;
  organization_name: string | null;
}

export interface SessionResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: UserSessionResponse;
}
