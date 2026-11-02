// Chamadas ao backend para o domínio questions (app/domains/questions/router.py
// e router_options.py).
import { apiClient } from '@/lib/apiClient';
import type {
  QuestionCreate,
  QuestionOptionCreate,
  QuestionOptionResponse,
  QuestionResponse,
  QuestionSection,
} from '@/types/api';

export const questionsApi = {
  // Admin e gestor.
  createQuestion: (question: QuestionCreate) =>
    apiClient.post<QuestionResponse>('/questions', question),

  // Já vêm na ordem de `order_index`. Sem `section`, todas as seções.
  listQuestions: (formId: string, section?: QuestionSection) => {
    const query = section ? `?${new URLSearchParams({ section })}` : '';
    return apiClient.get<QuestionResponse[]>(
      `/forms/${formId}/questions${query}`,
    );
  },

  // Admin e gestor.
  createOption: (questionId: string, option: QuestionOptionCreate) =>
    apiClient.post<QuestionOptionResponse>(
      `/questions/${questionId}/options`,
      option,
    ),
};
