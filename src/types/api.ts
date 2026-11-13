// Tipos espelhando os schemas Pydantic do backend (ADR-002).
// Mantê-los sincronizados manualmente por ora; quando os contratos
// estabilizarem, avaliar geração automática a partir do OpenAPI.
//
// Uma seção por domínio, com o nome da pasta do back
// (`app/domains/<domínio>/schemas.py`). Transcrição, não interpretação:
// `snake_case` fica `snake_case`, `X | None` vira `X | null`, campo com
// default que pode ser omitido no corpo vira `campo?:`.
//
// No fim do arquivo ficam os tipos **provisórios da tela**: formas que as
// telas usam e que o back ainda não tem. Cada um diz o que falta do lado de
// lá; as divergências estão listadas em
// `creed-ai-context/conventions/contrato-front-back.md`.

// ---------------------------------------------------------------------------
// shared (app/shared/paginacao.py, app/shared/enums.py)
// ---------------------------------------------------------------------------

// `PaginaDe[T]` no back.
export interface ListaPaginada<T> {
  itens: T[];
  total: number;
  pagina: number;
  tamanho_pagina: number;
}

export interface PaginationParams {
  pagina?: number;
  tamanho_pagina?: number;
}

// Tipo `recordstatus` no banco: `user` e `participants`. A organização tem o
// próprio (`OrganizationStatus`, com `pending`).
export type RecordStatus = 'active' | 'inactive';

// As sete dimensões da Matriz CREED (`Dimension`).
export type Dimension = 'S2' | 'S4' | 'S5A' | 'S5B' | 'S6' | 'S7' | 'S8';

// Tipo `prisma` no banco, compartilhado por `questions` e `insights`. São
// também os cinco eixos do radar dos dashboards (`PRISMAS`).
export type Prisma =
  | 'seguranca_psicologica'
  | 'lideranca_adaptativa'
  | 'cultura_empreendedora'
  | 'adaptabilidade_cognitiva'
  | 'neuroinovacao_prisma';

// ---------------------------------------------------------------------------
// authentication
// ---------------------------------------------------------------------------

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
  // `str | None` no back; os valores são os de `Role`.
  role: string | null;
  link_id: string | null;
  organization_id: string | null;
  // O back ainda devolve sempre nulo.
  organization_name: string | null;
}

export interface SessionResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: UserSessionResponse;
}

// `POST /authentication/password-reset` — 204 para qualquer e-mail.
export interface PasswordResetRequest {
  email: string;
}

// ---------------------------------------------------------------------------
// users
// ---------------------------------------------------------------------------

export interface UserCreate {
  name: string;
  email: string;
  keycloak_id: string;
  link_id: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  status: RecordStatus;
  // `str` no back, como em UserSessionResponse: o papel é lido do vínculo.
  role: string;
  link_id: string;
  organization_id: string;
  created_at: string;
}

// `POST /organizations/{organization_id}/members` — cria participante,
// vínculo e usuário numa chamada e manda o convite. Na branch
// `feat/86e35vhxm-convite-de-membro` do back, ainda fora da dev.
export interface MemberInvite {
  // 🟡 Premissa P-046 — o convite pede o nome da pessoa.
  name: string;
  email: string;
  role: Role;
  // 🟡 Premissa P-047 — sem `type`, o back grava o vínculo como `emprego`.
  type?: LinkType;
}

// ---------------------------------------------------------------------------
// links
// ---------------------------------------------------------------------------

// Valores de enum ficam em português (ADR-0005, 2026-09-29).
export type Role = 'admin' | 'gestor' | 'respondente';
export type LinkType = 'emprego' | 'mentoria' | 'academico' | 'pessoal';

// Sem `organization_id`: vem do caminho (`/organizations/{id}/links`).
export interface LinkCreate {
  participant_id: string;
  department_id?: string | null;
  type: LinkType;
  role: Role;
}

export interface LinkResponse {
  id: string;
  participant_id: string;
  organization_id: string;
  department_id: string | null;
  type: LinkType;
  role: Role;
  start_at: string;
  end_at: string | null;
  created_at: string;
  updated_at: string | null;
}

// Situação do período em relação ao momento da consulta. O enum mora em
// `app/domains/forms/schemas.py`; aqui fica junto do `MemberPeriod`, que é
// quem o usa por enquanto.
export type PeriodStatus = 'past' | 'open' | 'scheduled';

// O período de um membro, escolhido pelo back (P-068): o aberto, senão o
// próximo agendado, senão o último que passou.
export interface MemberPeriod {
  form_id: string;
  opens_at: string;
  closes_at: string;
  period_status: PeriodStatus;
  // Só resposta enviada conta (P-069).
  has_answered: boolean;
}

// `GET /organizations/{organization_id}/members` — a lista inteira, sem
// paginação, em ordem de nome (P-070). `?type=` filtra pelo tipo do vínculo.
export interface MemberListItem {
  link_id: string;
  name: string;
  // Nulo quando o vínculo foi criado sem convite (sem login).
  email: string | null;
  role: Role;
  type: LinkType;
  department: DepartmentType | null;
  updated_at: string | null;
  // Nulo quando a pessoa não tem nenhum período.
  period: MemberPeriod | null;
}

// ---------------------------------------------------------------------------
// participants
// ---------------------------------------------------------------------------

export interface ParticipantCreate {
  name: string;
  // 🟡 Premissa P-021 — opcional; se vier, o documento já precisa existir.
  document_id?: string | null;
}

export interface ParticipantResponse {
  id: string;
  name: string;
  document_id: string | null;
  status: RecordStatus;
  created_at: string;
  updated_at: string | null;
}

// ---------------------------------------------------------------------------
// demographics — schema e tabela existem, mas o back ainda não tem rota.
// ---------------------------------------------------------------------------

export type Gender =
  'feminino' | 'masculino' | 'nao_binario' | 'prefiro_nao_informar';

export type AgeRange =
  | '18_25'
  | '26_35'
  | '36_45'
  | '46_55'
  | '56_65'
  | '65_mais'
  | 'prefiro_nao_informar';

export type Ethnicity =
  | 'africana_afrodescendente'
  | 'indigena_amerindia'
  | 'europeia'
  | 'asiatica'
  | 'arabe_medio_oriente'
  | 'latino_americana'
  | 'romani_cigana'
  | 'multipla_hibrida'
  | 'prefiro_nao_responder';

export type Religion =
  | 'crista'
  | 'judaica'
  | 'islamica'
  | 'matriz_africana'
  | 'espiritismo'
  | 'budismo'
  | 'sem_religiao'
  | 'outra'
  | 'prefiro_nao_responder';

export type Nationality = 'brasileira' | 'portuguesa' | 'outra';

export type BrazilState =
  | 'AC'
  | 'AL'
  | 'AP'
  | 'AM'
  | 'BA'
  | 'CE'
  | 'DF'
  | 'ES'
  | 'GO'
  | 'MA'
  | 'MT'
  | 'MS'
  | 'MG'
  | 'PA'
  | 'PB'
  | 'PR'
  | 'PE'
  | 'PI'
  | 'RJ'
  | 'RN'
  | 'RS'
  | 'RO'
  | 'RR'
  | 'SC'
  | 'SP'
  | 'SE'
  | 'TO';

export type PortugalRegion =
  | 'norte'
  | 'centro'
  | 'area_metropolitana_lisboa'
  | 'alentejo'
  | 'algarve'
  | 'acores'
  | 'madeira';

// O back normaliza os campos que não batem com a nacionalidade, do mesmo jeito
// que o `normalizeDemographics` do front.
export interface DemographicCreate {
  gender?: Gender | null;
  age_range?: AgeRange | null;
  ethnicities?: Ethnicity[];
  religions?: Religion[];
  nationality?: Nationality | null;
  brazil_state?: BrazilState | null;
  portugal_region?: PortugalRegion | null;
  other_nationality?: string | null;
  perspective?: string | null;
}

export interface DemographicResponse {
  id: string;
  participant_id: string;
  gender: Gender | null;
  age_range: AgeRange | null;
  ethnicities: Ethnicity[];
  religions: Religion[];
  nationality: Nationality | null;
  brazil_state: BrazilState | null;
  portugal_region: PortugalRegion | null;
  other_nationality: string | null;
  perspective: string | null;
  created_at: string;
  updated_at: string | null;
}

// ---------------------------------------------------------------------------
// documents — só tabela no back, sem rota nem schema.
// ---------------------------------------------------------------------------

export type DocType =
  'cpf' | 'cnpj' | 'nif' | 'nipc' | 'passport' | 'vat_eu' | 'other';

// ---------------------------------------------------------------------------
// organizations — no back a pasta é `organizacoes` e a rota é `/organizacoes`;
// as rotas aninhadas (links, members) e o cadastro público usam
// `/organizations/...`.
// ---------------------------------------------------------------------------

// Tipo `organization_status` no banco. `pending` é a empresa que se cadastrou
// e espera a aprovação da administradora.
export type OrganizationStatus = 'pending' | 'active' | 'inactive';

// O documento da organização, já como o back guarda: só letras e números.
export interface OrganizationDocument {
  // `str` no back; os valores são os de `DocType`.
  type: string;
  value: string;
}

// `POST /organizations/sign-up` — rota pública, sem token. A organização nasce
// pendente. O back tira os espaços das pontas e guarda do documento só letras
// e números (P-076).
export interface OrganizationSignUp {
  name: string;
  document: string;
  email: string;
  contact_name: string;
  phone: string;
}

export interface OrganizationCreate {
  name: string;
  address: string;
  document_id: string;
}

// Só os campos enviados mudam. Para manter um valor, omita o campo: `null`
// é recusado com 422. `status` é `RecordStatus`, não `OrganizationStatus`:
// o PATCH não manda `pending`, e numa empresa pendente recusa o `status` (409).
export interface OrganizationUpdate {
  name?: string;
  address?: string;
  status?: RecordStatus;
}

export interface OrganizationResponse {
  id: string;
  name: string;
  // Texto livre (P-021).
  address: string;
  document_id: string;
  status: OrganizationStatus;
  // Nulos nas organizações criadas pelo `POST /organizacoes`: só o cadastro
  // público os preenche.
  email: string | null;
  contact_name: string | null;
  phone: string | null;
  document: OrganizationDocument;
  created_at: string;
  updated_at: string | null;
}

// ---------------------------------------------------------------------------
// department — no back a pasta e a rota são no singular (`/department`).
// ---------------------------------------------------------------------------

export type DepartmentType =
  | 'Marketing'
  | 'Financeiro'
  | 'Administrativo'
  | 'RecursosHumanos'
  | 'TecnologiaInformacao';

export interface DepartmentCreate {
  organization_id: string;
  type: DepartmentType;
}

export interface DepartmentResponse {
  id: string;
  organization_id: string;
  type: DepartmentType;
}

// ---------------------------------------------------------------------------
// forms
// ---------------------------------------------------------------------------

export type FormStatus = 'draft' | 'published' | 'closed';

// Sem `status`: o formulário nasce sempre em rascunho.
export interface FormCreate {
  name: string;
  organization_id: string;
}

export interface FormRead {
  id: string;
  name: string;
  organization_id: string;
  status: FormStatus;
  // Nulos: formulário sem período definido.
  opens_at: string | null;
  closes_at: string | null;
  // Vínculo da única pessoa que responde. Nulo: a organização inteira.
  link_id: string | null;
  created_at: string;
}

// `POST /organizations/{organization_id}/periods`. As datas vão com o fuso
// (`AwareDatetime` no back): sem ele, o back recusa com 422.
export interface PeriodCreate {
  opens_at: string;
  closes_at: string;
  // Só o admin manda, para o período de um mentorando. Sem ele, o período é
  // da organização inteira (o do gestor).
  link_id?: string;
}

// `GET /organizations/{organization_id}/periods`: o formulário com as datas
// sempre preenchidas e a situação calculada pelo back na hora da consulta.
export interface PeriodRead extends FormRead {
  opens_at: string;
  closes_at: string;
  period_status: PeriodStatus;
}

// ---------------------------------------------------------------------------
// questions
// ---------------------------------------------------------------------------

export type QuestionType = 'objective' | 'descriptive';

// As seções do formulário original da cliente, uma aba por seção. S2 a S8 são
// as dimensões da Matriz CREED; S9, as perguntas abertas.
export type QuestionSection =
  'S2' | 'S4' | 'S5A' | 'S5B' | 'S6' | 'S7' | 'S8' | 'S9';

// A pergunta é do instrumento, e não do formulário: todo período aplica as
// mesmas perguntas.
export interface QuestionCreate {
  instrument_id: string;
  text: string;
  order_index: number;
  type: QuestionType;
  section: QuestionSection;
  // Sem o campo, o back grava `true`.
  required?: boolean;
  dimensao?: Dimension | null;
  prisma?: Prisma | null;
}

// A pergunta vem do caminho (`/questions/{question_id}/options`).
export interface QuestionOptionCreate {
  label: string;
  value: string;
  order_index: number;
}

export interface QuestionOptionResponse {
  id: string;
  question_id: string;
  label: string;
  value: string;
  order_index: number;
  created_at: string;
}

export interface QuestionResponse {
  id: string;
  instrument_id: string;
  text: string;
  order_index: number;
  type: QuestionType;
  section: QuestionSection;
  required: boolean;
  dimensao: Dimension | null;
  prisma: Prisma | null;
  created_at: string;
  // 🟡 Premissa P-039: o back já cria alternativas
  // (`POST /questions/{id}/options`), mas o `GET /forms/{id}/questions` ainda
  // não as devolve. Opcional até devolver.
  options?: QuestionOptionResponse[];
}

// ---------------------------------------------------------------------------
// responses (rota `/form-responses`)
// ---------------------------------------------------------------------------

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

// Descritiva em `value`, objetiva em `option_id`.
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

// ---------------------------------------------------------------------------
// dashboards — schema e tabela existem; a rota `/dashboards` é stub.
// ---------------------------------------------------------------------------

export interface DashboardCreate {
  user_id: string;
  form_id: string;
  is_private: boolean;
}

export interface DashboardResponse {
  id: string;
  user_id: string;
  form_id: string;
  is_private: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// insights — schema e tabela existem, sem rota (ADR-0010).
// ---------------------------------------------------------------------------

export interface InsightResponse {
  id: string;
  form_response_id: string;
  content: string;
  created_at: string;
}

// prismas, prognosticos e relatorios: stubs no back, sem schema.

// ===========================================================================
// PROVISÓRIOS DA TELA — formas que as telas usam e que o back não tem.
// O mock de cada um mora no <domínio>Api.ts que a tela vai chamar. Quando o
// back tiver o contrato, o tipo daqui sai e a tela passa a usar o de cima.
// ===========================================================================

// Membro da organização, na tabela do painel da empresa.
// Falta no back: `GET /organizations/{id}/members` (listar) e
// `DELETE` de membro. Mais perto do back: `UserResponse` + departamento.
export type MemberStatus = 'ativo' | 'pendente';

export interface Member {
  id: string;
  name: string;
  email: string;
  // No back, `RecordStatus` (`active`/`inactive`); "pendente" (convite não
  // aceito) não existe.
  status: MemberStatus;
  // O setor do vínculo (`links.department_id` → `DepartmentType`). Nulo até
  // a empresa escolher: o membro entra sem tag, como o `department_id`.
  tag: DepartmentType | null;
  updated_at: string;
}

export interface MemberList extends ListaPaginada<Member> {
  organization: string;
}
