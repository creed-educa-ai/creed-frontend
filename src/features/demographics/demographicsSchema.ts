import { z } from 'zod';
import {
  genderValues,
  ageRangeValues,
  ethnicityValues,
  religionValues,
  nationalityValues,
  brazilStateValues,
  portugalRegionValues,
} from './demographicsOptions';

const invalidOption = 'respondentes:demograficos2.invalidOption';

// Valida as opções da UI. Os nomes dos campos são os do `DemographicCreate`
// do back, que ainda não tem rota (types/api.ts).
export const demographicsSchema = z.object({
  gender: z.enum(genderValues, { error: invalidOption }).nullable(),
  age_range: z.enum(ageRangeValues, { error: invalidOption }).nullable(),
  ethnicities: z.array(z.enum(ethnicityValues, { error: invalidOption })),
  religions: z.array(z.enum(religionValues, { error: invalidOption })),
  nationality: z.enum(nationalityValues, { error: invalidOption }).nullable(),
  brazil_state: z.enum(brazilStateValues, { error: invalidOption }).nullable(),
  portugal_region: z
    .enum(portugalRegionValues, { error: invalidOption })
    .nullable(),
  other_nationality: z.string().trim(),
});

export type DemographicsForm = z.infer<typeof demographicsSchema>;

export const emptyDemographics: DemographicsForm = {
  gender: null,
  age_range: null,
  ethnicities: [],
  religions: [],
  nationality: null,
  brazil_state: null,
  portugal_region: null,
  other_nationality: '',
};

export function normalizeDemographics(
  data: DemographicsForm,
): DemographicsForm {
  return {
    ...data,
    brazil_state: data.nationality === 'brasileira' ? data.brazil_state : null,
    portugal_region:
      data.nationality === 'portuguesa' ? data.portugal_region : null,
    other_nationality:
      data.nationality === 'outra' ? data.other_nationality : '',
  };
}
