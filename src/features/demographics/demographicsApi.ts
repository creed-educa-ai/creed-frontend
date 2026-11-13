// Chamadas ao backend para o domínio demographics
// (app/domains/demographics/router.py). O perfil é sempre o de quem está
// logado: o back acha o participante pelo vínculo da sessão.
import { apiClient } from '@/lib/apiClient';
import type { DemographicCreate, DemographicResponse } from '@/types/api';

export const demographicsApi = {
  // 404: a pessoa ainda não concluiu nem pulou o onboarding.
  getMine: () => apiClient.get<DemographicResponse>('/demographics/me'),

  // Substitui o perfil inteiro: o que não vier é apagado.
  saveMine: (profile: DemographicCreate) =>
    apiClient.put<DemographicResponse>('/demographics/me', profile),
};
