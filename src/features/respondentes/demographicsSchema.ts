import { z } from 'zod';
import {
  genderValues,
  ageRangeValues,
  ethnicityValues,
  religionValues,
  nationalityValues,
  brazilStateValues,
  portugalRegionValues,
} from './respondentesDemograficasOpcoes';

const invalidOption = 'respondentes:demograficos2.invalidOption';

// Valida as opções da UI, sem inventar um payload para a API ainda pendente.
export const demographicsSchema = z.object({
  genero: z.enum(genderValues, { error: invalidOption }).nullable(),
  faixaEtaria: z.enum(ageRangeValues, { error: invalidOption }).nullable(),
  origemEtnica: z.array(z.enum(ethnicityValues, { error: invalidOption })),
  religiao: z.array(z.enum(religionValues, { error: invalidOption })),
  nacionalidade: z.enum(nationalityValues, { error: invalidOption }).nullable(),
  estadoBrasil: z.enum(brazilStateValues, { error: invalidOption }).nullable(),
  regiaoPortugal: z
    .enum(portugalRegionValues, { error: invalidOption })
    .nullable(),
  nacionalidadeOutra: z.string().trim(),
});

export type DemographicsForm = z.infer<typeof demographicsSchema>;

export const emptyDemographics: DemographicsForm = {
  genero: null,
  faixaEtaria: null,
  origemEtnica: [],
  religiao: [],
  nacionalidade: null,
  estadoBrasil: null,
  regiaoPortugal: null,
  nacionalidadeOutra: '',
};

export function normalizeDemographics(
  data: DemographicsForm,
): DemographicsForm {
  return {
    ...data,
    estadoBrasil:
      data.nacionalidade === 'brasileira' ? data.estadoBrasil : null,
    regiaoPortugal:
      data.nacionalidade === 'portuguesa' ? data.regiaoPortugal : null,
    nacionalidadeOutra:
      data.nacionalidade === 'outra' ? data.nacionalidadeOutra : '',
  };
}
