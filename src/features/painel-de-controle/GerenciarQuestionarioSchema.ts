import { format, startOfToday } from 'date-fns';
import { z } from 'zod';

export const ERROS = {
  inicioObrigatorio: 'painelControle:erros.inicioObrigatorio',
  horaInicioObrigatoria: 'painelControle:erros.horaInicioObrigatoria',
  terminoObrigatorio: 'painelControle:erros.terminoObrigatorio',
  horaTerminoObrigatoria: 'painelControle:erros.horaTerminoObrigatoria',
  inicioNoPassado: 'painelControle:erros.inicioNoPassado',
  terminoAntesInicio: 'painelControle:erros.terminoAntesInicio',
  horaTerminoAntesInicio: 'painelControle:erros.horaTerminoAntesInicio',
};

export type ChaveErro = (typeof ERROS)[keyof typeof ERROS];

export const gerenciarQuestionarioSchema = z
  .object({
    dataInicio: z.string().min(1, { error: ERROS.inicioObrigatorio }),
    horaInicio: z.string().min(1, { error: ERROS.horaInicioObrigatoria }),
    dataLimite: z.string().min(1, { error: ERROS.terminoObrigatorio }),
    horaLimite: z.string().min(1, { error: ERROS.horaTerminoObrigatoria }),
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

    if (!dataInicio || !dataLimite) {
      return;
    }

    if (dataLimite < dataInicio) {
      ctx.addIssue({
        code: 'custom',
        message: ERROS.terminoAntesInicio,
        path: ['dataLimite'],
      });
    } else if (
      dataLimite === dataInicio &&
      horaInicio &&
      horaLimite &&
      horaLimite <= horaInicio
    ) {
      ctx.addIssue({
        code: 'custom',
        message: ERROS.horaTerminoAntesInicio,
        path: ['horaLimite'],
      });
    }
  });

export type GerenciarQuestionarioForm = z.infer<
  typeof gerenciarQuestionarioSchema
>;
