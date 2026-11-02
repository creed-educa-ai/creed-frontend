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
    { gender: 'invalid' },
    { age_range: 'invalid' },
    { ethnicities: ['invalid'] },
    { religions: ['invalid'] },
    { nationality: 'invalid' },
    { brazil_state: 'XX' },
    { portugal_region: 'invalid' },
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
      nationality: 'outra',
      other_nationality: ' Argentina ',
      brazil_state: 'RS',
      portugal_region: 'norte',
    });
    expect(normalizeDemographics(data)).toEqual({
      ...emptyDemographics,
      nationality: 'outra',
      other_nationality: 'Argentina',
    });
  });
});
