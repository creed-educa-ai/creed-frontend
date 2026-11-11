// Chamadas ao backend para o domínio de organizações. No back a pasta e a rota
// estão em português (app/domains/organizacoes/, `/organizacoes`); a feature
// do front segue o inglês do ADR-0005 e a rota é transcrita como está.
//
// Dois prefixos para o mesmo domínio, e o mesmo recurso responde nos dois:
// - `/organizacoes`: listar, ler, criar e alterar (`GET` e `PATCH` em
//   `/organizacoes/{id}`);
// - `/organizations`: o cadastro público, a aprovação e a exclusão (`DELETE`
//   em `/organizations/{id}`).
// Use o da rota, como está no contrato: o prefixo errado dá 404 ou 405.
import { apiClient } from '@/lib/apiClient';
import type {
  ListaPaginada,
  OrganizationCreate,
  OrganizationResponse,
  OrganizationSignUp,
  OrganizationUpdate,
  PaginationParams,
} from '@/types/api';

export const organizationsApi = {
  // Só admin. Traz as organizações em qualquer status, pendentes incluídas.
  listOrganizations: ({
    pagina = 1,
    tamanho_pagina = 50,
  }: PaginationParams = {}) => {
    const query = new URLSearchParams({
      pagina: String(pagina),
      tamanho_pagina: String(tamanho_pagina),
    });
    return apiClient.get<ListaPaginada<OrganizationResponse>>(
      `/organizacoes?${query}`,
    );
  },

  // Admin lê qualquer uma; gestor, só a do próprio vínculo.
  getOrganization: (organizationId: string) =>
    apiClient.get<OrganizationResponse>(`/organizacoes/${organizationId}`),

  // Só admin. O documento precisa já existir (não há rota que o crie).
  createOrganization: (organization: OrganizationCreate) =>
    apiClient.post<OrganizationResponse>('/organizacoes', organization),

  // Só admin. Só os campos enviados mudam.
  updateOrganization: (organizationId: string, changes: OrganizationUpdate) =>
    apiClient.patch<OrganizationResponse>(
      `/organizacoes/${organizationId}`,
      changes,
    ),

  // Cadastro público: rota sem token. A empresa nasce pendente, à espera da
  // administradora. 409 é documento já cadastrado.
  signUp: (body: OrganizationSignUp) =>
    apiClient.post<OrganizationResponse>('/organizations/sign-up', body),

  // Só admin. A rota não tem corpo, mas o `post` do apiClient pede o segundo
  // argumento. Devolve a organização já ativa. 409: ela já não está pendente,
  // ou o e-mail do cadastro já tem acesso. 503: nada mudou.
  // 🟡 Premissa P-053 — aprovar convida quem cadastrou, no e-mail informado,
  // como gestor.
  approveOrganization: (organizationId: string) =>
    apiClient.post<OrganizationResponse>(
      `/organizations/${organizationId}/approval`,
      undefined,
    ),

  // Só admin. Apaga a empresa, os membros, as respostas e os questionários; é
  // também a rejeição de uma pendente (P-078). 204 sem corpo. 409: a
  // organização da própria sessão. 503: nada foi apagado.
  deleteOrganization: (organizationId: string) =>
    apiClient.delete(`/organizations/${organizationId}`),
};
