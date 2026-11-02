// Chamadas ao backend para o domínio links (app/domains/links/router.py).
// Hoje só admin. A organização vem do caminho, não do corpo.
import { apiClient } from '@/lib/apiClient';
import type { LinkCreate, LinkResponse } from '@/types/api';

export const linksApi = {
  createLink: (organizationId: string, link: LinkCreate) =>
    apiClient.post<LinkResponse>(
      `/organizations/${organizationId}/links`,
      link,
    ),
};
