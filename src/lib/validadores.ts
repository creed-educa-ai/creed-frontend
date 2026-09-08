// autenticacao/alterarSenha — ainda não existe domínio de autenticação no
// creed-backend, então não há contrato definindo a política de senha.
// > 🟡 Premissa P-004 — mínimo de 8 caracteres, sem regra extra de
// complexidade. Confirmar com o time.
import { z } from 'zod';

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
