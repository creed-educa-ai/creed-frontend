import { z } from 'zod';
import { format, formatISO, parse } from 'date-fns';

export const ERROS = {
  inicioObrigatorio: 'painelControle:erros.inicioObrigatorio',
  horaInicioObrigatoria: 'painelControle:erros.horaInicioObrigatoria',
  terminoObrigatorio: 'painelControle:erros.terminoObrigatorio',
  horaTerminoObrigatoria: 'painelControle:erros.horaTerminoObrigatoria',
  terminoAntesInicio: 'painelControle:erros.terminoAntesInicio',
  horaTerminoAntesInicio: 'painelControle:erros.horaTerminoAntesInicio',
  inicioNoPassado: 'painelControle:erros.inicioNoPassado',
  horaInicioNoPassado: 'painelControle:erros.horaInicioNoPassado',
  // Do back, ao abrir o período: não são de um campo, aparecem no formulário.
  periodoConflito: 'painelControle:erros.periodoConflito',
  periodoFalhou: 'painelControle:erros.periodoFalhou',
} as const;

export type ChaveErro = (typeof ERROS)[keyof typeof ERROS];

export const manageQuestionnaireSchema = z
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

export type ManageQuestionnaireFormValues = z.infer<
  typeof manageQuestionnaireSchema
>;

// O par data e hora dos campos, no fuso de quem marca, como o back pede:
// ISO com o deslocamento ('2026-11-10T09:00:00-03:00'). Sem o fuso, um
// período marcado para as 9h abriria em outro horário.
export function toPeriodDates(values: ManageQuestionnaireFormValues) {
  const local = (data: string, hora: string) =>
    formatISO(parse(`${data} ${hora}`, 'yyyy-MM-dd HH:mm', new Date()));
  return {
    opens_at: local(values.dataInicio, values.horaInicio),
    closes_at: local(values.dataLimite, values.horaLimite),
  };
}
