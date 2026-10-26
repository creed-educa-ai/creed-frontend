import { z } from 'zod';

// Chaves do i18n usadas como mensagem de erro; a tela as traduz.
export const ERROS = {
  emailObrigatorio: 'adicionarMentorando:erros.emailObrigatorio',
  emailInvalido: 'adicionarMentorando:erros.emailInvalido',
} as const;

export type ChaveErro = (typeof ERROS)[keyof typeof ERROS];

export const adicionarMentorandoSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { error: ERROS.emailObrigatorio })
    .pipe(z.email({ error: ERROS.emailInvalido })),
});

export type AdicionarMentorandoValues = z.infer<
  typeof adicionarMentorandoSchema
>;
