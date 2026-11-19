// Chamadas ao backend para o domínio responses (rotas `/form-responses` e
// `/forms/current`). Formulário e perguntas são de outros domínios:
// `formsApi` e `questionsApi`.
import { apiClient } from '@/lib/apiClient';
import type {
  AnswerCreate,
  AnswerResponse,
  CurrentFormRead,
  FormResponseCreate,
  FormResponseResponse,
  FormResponseSubmit,
  InsightStatusRead,
  Language,
} from '@/types/api';

export const responsesApi = {
  // O caminho é de `/forms`, mas a rota mora em `responses` no back
  // (`router_current.py`): junta o formulário e a resposta da pessoa nele.
  // Quem decide qual questionário vale é o back, pelo vínculo do login.
  getCurrentForm: () => apiClient.get<CurrentFormRead>('/forms/current'),

  // O vínculo não vai no corpo: o back usa o do login.
  createFormResponse: (formId: string) =>
    apiClient.post<FormResponseResponse>('/form-responses', {
      form_id: formId,
    } satisfies FormResponseCreate),

  recordAnswer: (formResponseId: string, answer: AnswerCreate) =>
    apiClient.post<AnswerResponse>(
      `/form-responses/${formResponseId}/answers`,
      answer,
    ),

  listAnswers: (formResponseId: string) =>
    apiClient.get<AnswerResponse[]>(
      `/form-responses/${formResponseId}/answers`,
    ),

  // O envio muda o status para `submitted`. O idioma da tela decide em que
  // língua o back pede o insight da resposta.
  submitFormResponse: (formResponseId: string, language: Language) =>
    apiClient.patch<FormResponseResponse>(`/form-responses/${formResponseId}`, {
      language,
    } satisfies FormResponseSubmit),

  // A rota mora em `insights` no back, mas é lida a partir da resposta: o
  // insight nasce no envio. O `signal` cancela a consulta ao sair da tela.
  getInsightStatus: (formResponseId: string, signal?: AbortSignal) =>
    apiClient.get<InsightStatusRead>(
      `/form-responses/${formResponseId}/insight`,
      signal ? { signal } : undefined,
    ),
};
