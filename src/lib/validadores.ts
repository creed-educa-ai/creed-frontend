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
  email: z
    .string()
    .regex(/^[^\s@]+@[^\s@]+$/, 'autenticacao:erros.emailInvalido'),
  senha: z.string().min(1, 'comum:erros.obrigatorio'),
  lembrarDeMim: z.boolean(),
});

export interface LoginForm {
  email: string;
  senha: string;
  lembrarDeMim: boolean;
}

// autenticacao/alterarSenha — ainda não existe domínio de autenticação no
// creed-backend, então não há contrato definindo a política de senha.
// > 🟡 Premissa P-004 — mínimo de 8 caracteres, sem regra extra de
// complexidade. Confirmar com o time.
export const alterarSenhaSchema = z
  .object({
    novaSenha: z.string().min(8, 'autenticacao:erros.senhaCurta'),
    confirmarSenha: z
      .string()
      .min(1, 'autenticacao:erros.confirmacaoObrigatoria'),
  })
  .refine((dados) => dados.novaSenha === dados.confirmarSenha, {
    message: 'autenticacao:erros.senhasDivergentes',
    path: ['confirmarSenha'],
  });

export type AlterarSenhaForm = z.infer<typeof alterarSenhaSchema>;
