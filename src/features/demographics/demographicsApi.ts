// Chamadas ao backend para o domínio demographics (rota `/demographics/me`).
// O perfil é sempre o da pessoa logada: o back descobre quem é pela sessão.
import { apiClient } from '@/lib/apiClient';
import type { DemographicCreate, DemographicResponse } from '@/types/api';

export const demographicsApi = {
  // 404 quando a pessoa ainda não concluiu nem pulou o onboarding.
  getMyDemographics: () =>
    apiClient.get<DemographicResponse>('/demographics/me'),

  // Cria ou substitui o perfil inteiro. Corpo vazio registra que pulou.
  saveMyDemographics: (profile: DemographicCreate) =>
    apiClient.put<DemographicResponse>('/demographics/me', profile),
};
