// Chamadas ao backend para o domínio forms (app/domains/forms/router.py).
import { apiClient } from '@/lib/apiClient';
import type { FormCreate, FormRead } from '@/types/api';

export const formsApi = {
  // Admin e gestor. Nasce em rascunho.
  createForm: (form: FormCreate) => apiClient.post<FormRead>('/forms', form),

  // Qualquer papel, na própria organização; o admin lê de qualquer uma.
  getForm: (formId: string) => apiClient.get<FormRead>(`/forms/${formId}`),
};
