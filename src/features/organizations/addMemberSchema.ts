import { z } from 'zod';

// Valores iguais aos do enum `Roles` do back (links/models.py). `admin` fica de
// fora de propósito: uma empresa adiciona funcionários e gestores, não
// administradores da plataforma.
export const MEMBER_ROLES = ['respondente', 'gestor'] as const;

export const addMemberSchema = z.object({
  email: z.email('organizations:errors.invalidEmail'),
  role: z.enum(MEMBER_ROLES),
});

export type AddMemberValues = z.infer<typeof addMemberSchema>;
