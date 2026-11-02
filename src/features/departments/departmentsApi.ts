// Chamadas ao backend para o domínio de setores. No back a pasta e a rota
// estão no singular (app/domains/department/, `/department`); aqui a feature
// segue a convenção de plural do front e a rota é transcrita como está.
import { apiClient } from '@/lib/apiClient';
import type { DepartmentCreate, DepartmentResponse } from '@/types/api';

export const departmentsApi = {
  // Só admin.
  createDepartment: (department: DepartmentCreate) =>
    apiClient.post<DepartmentResponse>('/department', department),

  getDepartment: (departmentId: string) =>
    apiClient.get<DepartmentResponse>(`/department/${departmentId}`),
};
