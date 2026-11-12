// Chamadas ao backend para o domínio forms (app/domains/forms/router.py e
// router_periods.py).
import { apiClient } from '@/lib/apiClient';
import type {
  FormCreate,
  FormRead,
  PeriodCreate,
  PeriodRead,
} from '@/types/api';

export const formsApi = {
  // Admin e gestor. Nasce em rascunho.
  createForm: (form: FormCreate) => apiClient.post<FormRead>('/forms', form),

  // Qualquer papel, na própria organização; o admin lê de qualquer uma.
  getForm: (formId: string) => apiClient.get<FormRead>(`/forms/${formId}`),

  // Admin e gestor, só na organização do próprio vínculo. O gestor abre o da
  // organização inteira; o admin, o de um mentorando (`link_id`). Período que
  // cruza ou encosta em outro do mesmo público é 409.
  createPeriod: (organizationId: string, period: PeriodCreate) =>
    apiClient.post<FormRead>(
      `/organizations/${organizationId}/periods`,
      period,
    ),

  // Do mais recente ao mais antigo. Sem `linkId`, os "para todos"; com ele,
  // os daquela pessoa (só o admin).
  listPeriods: (organizationId: string, linkId?: string) =>
    apiClient.get<PeriodRead[]>(
      `/organizations/${organizationId}/periods${
        linkId ? `?link_id=${linkId}` : ''
      }`,
    ),
};
