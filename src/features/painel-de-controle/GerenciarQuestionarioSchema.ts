import { z } from 'zod';
import { format } from 'date-fns';

export const ERROS = {
  inicioObrigatorio: 'painelControle:erros.inicioObrigatorio',
  horaInicioObrigatoria: 'painelControle:erros.horaInicioObrigatoria',
  terminoObrigatorio: 'painelControle:erros.terminoObrigatorio',
  horaTerminoObrigatoria: 'painelControle:erros.horaTerminoObrigatoria',
  terminoAntesInicio: 'painelControle:erros.terminoAntesInicio',
  horaTerminoAntesInicio: 'painelControle:erros.horaTerminoAntesInicio',
  inicioNoPassado: 'painelControle:erros.inicioNoPassado',
  horaInicioNoPassado: 'painelControle:erros.horaInicioNoPassado',
} as const;

export type ChaveErro = (typeof ERROS)[keyof typeof ERROS];

export const gerenciarQuestionarioSchema = z
  .object({
    dataInicio: z.string().min(1, { message: ERROS.inicioObrigatorio }),
    horaInicio: z.string().min(1, { message: ERROS.horaInicioObrigatoria }),
    dataLimite: z.string().min(1, { message: ERROS.terminoObrigatorio }),
    horaLimite: z.string().min(1, { message: ERROS.horaTerminoObrigatoria }),
  })
  .superRefine((dados, ctx) => {
    const { dataInicio, horaInicio, dataLimite, horaLimite } = dados;

    const agora = new Date();
    const hoje = format(agora, 'yyyy-MM-dd');
    if (dataInicio && dataInicio < hoje) {
      ctx.addIssue({
        code: 'custom',
        message: ERROS.inicioNoPassado,
        path: ['dataInicio'],
      });
    } else if (
      dataInicio === hoje &&
      horaInicio &&
      horaInicio < format(agora, 'HH:mm')
    ) {
      ctx.addIssue({
        code: 'custom',
        message: ERROS.horaInicioNoPassado,
        path: ['horaInicio'],
      });
    }

    if (!dataInicio || !horaInicio || !dataLimite || !horaLimite) {
      return;
    }

    // 'yyyy-MM-dd' e 'HH:mm' com zero à esquerda ordenam certo como texto.
    if (dataLimite < dataInicio) {
      ctx.addIssue({
        code: 'custom',
        message: ERROS.terminoAntesInicio,
        path: ['dataLimite'],
      });
    } else if (dataLimite === dataInicio && horaLimite <= horaInicio) {
      ctx.addIssue({
        code: 'custom',
        message: ERROS.horaTerminoAntesInicio,
        path: ['horaLimite'],
      });
    }
  });

export type GerenciarQuestionarioFormValues = z.infer<
  typeof gerenciarQuestionarioSchema
>;
