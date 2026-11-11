import { z } from 'zod';

// > 🟡 Premissa P-076 — a mesma regra do back: tirado o que não é letra nem
// número ("12.345.678/0001-90" vira "12345678000190"), sobram 11 dígitos
// (CPF) ou 14 (CNPJ). O dígito verificador não é conferido. O documento vai
// ao back como foi digitado: quem guarda só os dígitos é ele.
function temOnzeOuQuatorzeDigitos(documento: string) {
  const soLetrasENumeros = documento.replace(/[^\p{L}\p{N}]/gu, '');
  return /^(\d{11}|\d{14})$/.test(soLetrasENumeros);
}

// Espelha o `OrganizationSignUp` do back. O `.trim()` vem antes dos tamanhos,
// como o `str_strip_whitespace` de lá: "  " é campo vazio, não dois
// caracteres.
export const signUpSchema = z.object({
  nomeEmpresa: z
    .string()
    .trim()
    .min(1, 'comum:erros.obrigatorio')
    .max(200, 'cadastro:erros.ate200Caracteres'),
  documento: z
    .string()
    .trim()
    .min(1, 'comum:erros.obrigatorio')
    .refine(temOnzeOuQuatorzeDigitos, 'cadastro:erros.documentoInvalido'),
  email: z.email('autenticacao:erros.emailInvalido'),
  // > 🟡 Premissa P-082 — o nome do responsável tem de 2 a 200 caracteres,
  // como o `contact_name` do back. O `min(1)` vem antes para o campo vazio
  // dizer "Campo obrigatório", como os outros.
  nomeCompleto: z
    .string()
    .trim()
    .min(1, 'comum:erros.obrigatorio')
    .min(2, 'cadastro:erros.nomeCompletoInvalido')
    .max(200, 'cadastro:erros.nomeCompletoInvalido'),
  telefone: z
    .string()
    .trim()
    .min(1, 'comum:erros.obrigatorio')
    .max(30, 'cadastro:erros.ate30Caracteres'),
});

export type SignUpForm = z.infer<typeof signUpSchema>;

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
export const passwordResetSchema = z.object({
  email: z.email('autenticacao:erros.emailInvalido'),
});

export type PasswordResetForm = z.infer<typeof passwordResetSchema>;
