// Chamadas ao backend para o domínio participants
// (app/domains/participants/router.py). Hoje só admin.
import { apiClient } from '@/lib/apiClient';
import type { ParticipantCreate, ParticipantResponse } from '@/types/api';

export const participantsApi = {
  createParticipant: (participant: ParticipantCreate) =>
    apiClient.post<ParticipantResponse>('/participants', participant),

  getParticipant: (participantId: string) =>
    apiClient.get<ParticipantResponse>(`/participants/${participantId}`),
};
