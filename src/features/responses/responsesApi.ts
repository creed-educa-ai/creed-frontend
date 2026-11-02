// Chamadas ao backend para o domínio responses (rota `/form-responses`).
// Formulário e perguntas são de outros domínios: `formsApi` e `questionsApi`.
import { apiClient } from '@/lib/apiClient';
import type {
  AnswerCreate,
  AnswerResponse,
  FormResponseCreate,
  FormResponseResponse,
} from '@/types/api';

export const responsesApi = {
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

  // Sem corpo: o envio só muda o status para `submitted`.
  submitFormResponse: (formResponseId: string) =>
    apiClient.patch<FormResponseResponse>(
      `/form-responses/${formResponseId}`,
      undefined,
    ),
};
