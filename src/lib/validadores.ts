import { z } from 'zod';

export const cadastroSchema = z.object({
  nomeEmpresa: z.string().min(1, 'comum:erros.obrigatorio'),
  documento: z.string().min(1, 'comum:erros.obrigatorio'),
  email: z.string().min(1, 'comum:erros.obrigatorio'),
  nomeCompleto: z.string().min(1, 'comum:erros.obrigatorio'),
  telefone: z.string().min(1, 'comum:erros.obrigatorio'),
});

export type CadastroForm = z.infer<typeof cadastroSchema>;
