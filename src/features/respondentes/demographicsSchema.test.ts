import {
  demographicsSchema,
  emptyDemographics,
  normalizeDemographics,
} from './demographicsSchema';

describe('demographicsSchema', () => {
  it('allows every answer to be empty', () => {
    expect(demographicsSchema.parse(emptyDemographics)).toEqual(
      emptyDemographics,
    );
  });
  it.each([
    { genero: 'invalid' },
    { faixaEtaria: 'invalid' },
    { origemEtnica: ['invalid'] },
    { religiao: ['invalid'] },
    { nacionalidade: 'invalid' },
    { estadoBrasil: 'XX' },
    { regiaoPortugal: 'invalid' },
  ])('rejects unsupported option values: %o', (invalid) => {
    const result = demographicsSchema.safeParse({
      ...emptyDemographics,
      ...invalid,
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0]?.message).toBe(
        'respondentes:demograficos2.invalidOption',
      );
  });
  it('trims a free-text nationality and drops answers to hidden fields', () => {
    const data = demographicsSchema.parse({
      ...emptyDemographics,
      nacionalidade: 'outra',
      nacionalidadeOutra: ' Argentina ',
      estadoBrasil: 'RS',
      regiaoPortugal: 'norte',
    });
    expect(normalizeDemographics(data)).toEqual({
      ...emptyDemographics,
      nacionalidade: 'outra',
      nacionalidadeOutra: 'Argentina',
    });
  });
});
