import { z } from 'zod';

// Valores iguais aos do enum `Roles` do back (links/models.py). `admin` fica de
// fora de propósito: uma empresa adiciona funcionários e gestores, não
// administradores da plataforma.
// > 🟡 Premissa P-045 — o formulário oferece `respondente` e `gestor`.
export const MEMBER_ROLES = ['respondente', 'gestor'] as const;

// O nome segue a regra do `UserBase` do back: 2 a 200 caracteres.
// > 🟡 Premissa P-046 — o convite pede o nome da pessoa.
export const MEMBER_NAME_MIN = 2;
export const MEMBER_NAME_MAX = 200;

export const addMemberSchema = z.object({
  name: z
    .string()
    .trim()
    .min(MEMBER_NAME_MIN, 'organizations:errors.invalidName')
    .max(MEMBER_NAME_MAX, 'organizations:errors.invalidName'),
  email: z.email('organizations:errors.invalidEmail'),
  role: z.enum(MEMBER_ROLES),
});

export type AddMemberValues = z.infer<typeof addMemberSchema>;

// Erros do back no convite, que o slice já traduziu em chave de i18n. O 409
// (e-mail que já tem acesso) vai para o campo e-mail; o resto, para o
// formulário (formularios.md, regra 7).
// > 🟡 Premissa P-084 — mensagens próprias, nos três idiomas.
export const INVITE_EMAIL_TAKEN = 'organizations:errors.emailTaken';
export const INVITE_FAILED = 'organizations:errors.inviteFailed';
export type InviteError = typeof INVITE_EMAIL_TAKEN | typeof INVITE_FAILED;
