import { z } from 'zod';
import { parseISO, isValid, startOfToday, format } from 'date-fns';

export const ERROS = {
  inicioObrigatorio: 'painelControle:erros.inicioObrigatorio',
  horaInicioObrigatoria: 'painelControle:erros.horaInicioObrigatoria',
  terminoObrigatorio: 'painelControle:erros.terminoObrigatorio',
  horaTerminoObrigatoria: 'painelControle:erros.horaTerminoObrigatoria',
  terminoAntesInicio: 'painelControle:erros.terminoAntesInicio',
  inicioNoPassado: 'painelControle:erros.inicioNoPassado',
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

    const hoje = format(startOfToday(), 'yyyy-MM-dd');
    if (dataInicio && dataInicio < hoje) {
      ctx.addIssue({
        code: 'custom',
        message: ERROS.inicioNoPassado,
        path: ['dataInicio'],
      });
    }

    if (!dataInicio || !horaInicio || !dataLimite || !horaLimite) {
      return;
    }

    const inicioStr = `${dataInicio}T${horaInicio}:00`;
    const terminoStr = `${dataLimite}T${horaLimite}:00`;

    const inicioDate = parseISO(inicioStr);
    const terminoDate = parseISO(terminoStr);

    if (isValid(inicioDate) && isValid(terminoDate)) {
      if (terminoDate <= inicioDate) {
        ctx.addIssue({
          code: 'custom',
          message: ERROS.terminoAntesInicio,
          path: ['dataLimite'],
        });
      }
    }
  });

export type GerenciarQuestionarioFormValues = z.infer<
  typeof gerenciarQuestionarioSchema
>;
