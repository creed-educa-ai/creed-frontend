// Chamadas ao backend para o questionário: lê o formulário e as perguntas
// (domínios forms e questions) e grava a resposta (domínio responses).
import { apiClient } from '@/lib/apiClient';
import type {
  AnswerCreate,
  AnswerResponse,
  FormRead,
  FormResponseResponse,
  QuestionResponse,
} from '@/types/api';

export const responsesApi = {
  getForm: (formId: string) => apiClient.get<FormRead>(`/forms/${formId}`),

  // Já vêm na ordem de `order_index`.
  listQuestions: (formId: string) =>
    apiClient.get<QuestionResponse[]>(`/forms/${formId}/questions`),

  createFormResponse: (formId: string) =>
    apiClient.post<FormResponseResponse>('/form-responses', {
      form_id: formId,
    }),

  recordAnswer: (formResponseId: string, answer: AnswerCreate) =>
    apiClient.post<AnswerResponse>(
      `/form-responses/${formResponseId}/answers`,
      answer,
    ),

  // Sem corpo: o envio só muda o status para `submitted`.
  submitFormResponse: (formResponseId: string) =>
    apiClient.patch<FormResponseResponse>(
      `/form-responses/${formResponseId}`,
      undefined,
    ),
};
