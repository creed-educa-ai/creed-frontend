import { z } from 'zod';

export const cadastroSchema = z.object({
  nomeEmpresa: z.string().min(1, 'comum:erros.obrigatorio'),
  documento: z.string().min(1, 'comum:erros.obrigatorio'),
  email: z.string().min(1, 'comum:erros.obrigatorio'),
  nomeCompleto: z.string().min(1, 'comum:erros.obrigatorio'),
  telefone: z.string().min(1, 'comum:erros.obrigatorio'),
});

export type CadastroForm = z.infer<typeof cadastroSchema>;

export const loginSchema = z.object({
  email: z.email('autenticacao:erros.emailInvalido'),
  senha: z.string().min(1, 'comum:erros.obrigatorio'),
  lembrarDeMim: z.boolean(),
});

export interface LoginForm {
  email: string;
  senha: string;
  lembrarDeMim: boolean;
}

// Só o e-mail: quem define a senha nova é a página do Keycloak, aberta pelo
// link que o back manda (P-012).
export const recuperarSenhaSchema = z.object({
  email: z.email('autenticacao:erros.emailInvalido'),
});

export type RecuperarSenhaForm = z.infer<typeof recuperarSenhaSchema>;
