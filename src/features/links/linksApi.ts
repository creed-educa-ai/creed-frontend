// Chamadas ao backend para o domínio links (app/domains/links/router.py e
// router_members.py). A organização vem do caminho, não do corpo.
import { apiClient } from '@/lib/apiClient';
import type {
  DepartmentType,
  LinkCreate,
  LinkResponse,
  LinkType,
  MemberDepartmentUpdate,
  MemberListItem,
  MemberResponse,
} from '@/types/api';

export const linksApi = {
  // Só admin.
  createLink: (organizationId: string, link: LinkCreate) =>
    apiClient.post<LinkResponse>(
      `/organizations/${organizationId}/links`,
      link,
    ),

  // Admin em qualquer organização; gestor só na própria (P-066). Sem `type`,
  // todos os vínculos.
  listMembers: (organizationId: string, type?: LinkType) =>
    apiClient.get<MemberListItem[]>(
      `/organizations/${organizationId}/members${type ? `?type=${type}` : ''}`,
    ),

  // Exclui o membro de vez (M-3): respostas, questionários só dele, vínculo e
  // login. Gestor na própria organização; admin na do próprio vínculo
  // (P-071). 204 sem corpo.
  deleteMember: (organizationId: string, linkId: string) =>
    apiClient.delete(`/organizations/${organizationId}/members/${linkId}`),

  // Troca o setor do membro; `null` tira o setor. O corpo só aceita
  // `department`: campo a mais é 422.
  updateMemberDepartment: (
    organizationId: string,
    linkId: string,
    department: DepartmentType | null,
  ) =>
    apiClient.patch<MemberResponse>(
      `/organizations/${organizationId}/members/${linkId}`,
      { department } satisfies MemberDepartmentUpdate,
    ),
};
