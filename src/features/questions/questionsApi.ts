// Chamadas ao backend para o domínio questions (app/domains/questions/router.py
// e router_options.py).
import { apiClient } from '@/lib/apiClient';
import type {
  QuestionCreate,
  QuestionLang,
  QuestionOptionCreate,
  QuestionOptionResponse,
  QuestionResponse,
  QuestionSection,
} from '@/types/api';

interface ListQuestionsFilters {
  section?: QuestionSection;
  lang?: QuestionLang;
}

export const questionsApi = {
  // Admin e gestor.
  createQuestion: (question: QuestionCreate) =>
    apiClient.post<QuestionResponse>('/questions', question),

  // Já vêm na ordem de `order_index`. Sem `section`, todas as seções; sem
  // `lang`, em português.
  listQuestions: (
    formId: string,
    { section, lang }: ListQuestionsFilters = {},
  ) => {
    const params = new URLSearchParams();
    if (section) params.set('section', section);
    if (lang) params.set('lang', lang);
    const query = params.toString();
    return apiClient.get<QuestionResponse[]>(
      `/forms/${formId}/questions${query ? `?${query}` : ''}`,
    );
  },

  // Admin e gestor.
  createOption: (questionId: string, option: QuestionOptionCreate) =>
    apiClient.post<QuestionOptionResponse>(
      `/questions/${questionId}/options`,
      option,
    ),
};
