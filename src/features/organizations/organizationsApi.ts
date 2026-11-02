// Chamadas ao backend para o domínio de organizações. No back a pasta e a rota
// estão em português (app/domains/organizacoes/, `/organizacoes`); a feature
// do front segue o inglês do ADR-0005 e a rota é transcrita como está.
//
// Duas partes:
// - rotas que existem no back, transcritas do contrato;
// - MOCK das empresas (cadastro público e aprovação pelo super adm), que o back
//   ainda não tem (CREED-591/595). A tela usa `Company`, que tem campos que
//   `OrganizationResponse` não tem: ver o tipo em types/api.ts.
import { apiClient } from '@/lib/apiClient';
import type {
  Company,
  CompanyRegistration,
  ListaPaginada,
  OrganizationCreate,
  OrganizationResponse,
  OrganizationUpdate,
  PaginationParams,
} from '@/types/api';

// ---------------------------------------------------------------------------
// MOCK — empresas
// ---------------------------------------------------------------------------

const companySeed: Company[] = [
  {
    id: '1',
    nomeEmpresa: 'Acme Inc.',
    email: 'contato@acme.com',
    status: 'pendente',
    documento: '345645678',
    nomeResponsavel: 'Ana Silva',
    telefone: '11987654321',
  },
  {
    id: '2',
    nomeEmpresa: 'Tech Solutions',
    email: 'contato@techsolutions.com',
    status: 'ativo',
    documento: '34567890',
    nomeResponsavel: 'Carlos Oliveira',
    telefone: '11987654321',
  },
  {
    id: '3',
    nomeEmpresa: 'Inova Tech',
    email: 'contato@inovatech.com',
    status: 'pendente',
    documento: '34567891',
    nomeResponsavel: 'Maria Santos',
    telefone: '11987654321',
  },
];

let companyRegistry: Company[] = cloneAll(companySeed);

function cloneAll(companies: Company[]): Company[] {
  return companies.map((company) => ({ ...company }));
}

// Os testes começam sempre da mesma lista.
export function resetCompaniesMock() {
  companyRegistry = cloneAll(companySeed);
}

// PROVISÓRIO — espera simulada do cadastro, para a apresentação: sem ela o
// envio é instantâneo e o símbolo do painel não chega a girar. Sai junto com o
// mock: a própria requisição passa a ser a espera.
const SIGN_UP_DELAY_MS = 1500;

export const organizationsApi = {
  // --- rotas do back -------------------------------------------------------

  // Só admin.
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

  // --- MOCK ----------------------------------------------------------------

  // Cadastro público de empresa: nasce pendente, à espera do super adm.
  registerCompany: async (registration: CompanyRegistration) => {
    await new Promise((resolve) => setTimeout(resolve, SIGN_UP_DELAY_MS));
    const company: Company = {
      ...registration,
      id: String(Date.now()),
      status: 'pendente',
    };
    companyRegistry = [...companyRegistry, company];
    return { ...company };
  },

  listCompanies: (): Promise<Company[]> =>
    Promise.resolve(cloneAll(companyRegistry)),

  // 🟡 Premissa P-053 — no back, aprovar cria a organização e convida quem
  // cadastrou como `gestor`.
  approveCompany: (id: string): Promise<void> => {
    companyRegistry = companyRegistry.map((company) =>
      company.id === id ? { ...company, status: 'ativo' } : company,
    );
    return Promise.resolve();
  },

  rejectCompany: (id: string): Promise<void> => {
    companyRegistry = companyRegistry.filter((company) => company.id !== id);
    return Promise.resolve();
  },

  removeCompany: (id: string): Promise<void> => {
    companyRegistry = companyRegistry.filter((company) => company.id !== id);
    return Promise.resolve();
  },
};
