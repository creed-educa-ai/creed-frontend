import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { FormLayout } from '@/components/layout/formLayout';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { saveDemographicsStep } from './demographicsSlice';
import {
  demographicsSchema,
  emptyDemographics,
  normalizeDemographics,
  type DemographicsForm,
} from './demographicsSchema';
import { SingleChoiceField, MultipleChoiceField } from './DemographicsFields';
import {
  genderValues,
  ageRangeValues,
  ethnicityValues,
  religionValues,
  nationalityValues,
  brazilStateValues,
  portugalRegionValues,
} from './demographicsOptions';
import { pageTitleClassName } from '@/lib/typography';

interface Demograficos2ViewProps {
  // A CREED-20.7 conecta estas ações ao fluxo e à API, sem rotas fictícias aqui.
  onContinue?: (data: DemographicsForm) => void;
  onSkip?: () => void;
}

export function DemographicsStep2View({
  onContinue,
  onSkip,
}: Demograficos2ViewProps) {
  const { t } = useTranslation('respondentes');
  const dispatch = useAppDispatch();
  const draft = useAppSelector((state) => state.demographics);
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<DemographicsForm>({
    resolver: zodResolver(demographicsSchema),
    defaultValues: normalizeDemographics(draft),
  });
  const nationality = useWatch({ control, name: 'nationality' });

  function clearNationalityDetails() {
    setValue('brazil_state', null, { shouldDirty: true });
    setValue('portugal_region', null, { shouldDirty: true });
    setValue('other_nationality', '', { shouldDirty: true });
  }

  function saveStep(data: DemographicsForm) {
    const step = normalizeDemographics(data);
    // Snapshot confirmado da etapa, compatível com as branches 20.4 e 20.6.
    // Os campos em edição pertencem somente ao RHF; isto não persiste na API.
    dispatch(saveDemographicsStep(step));
    onContinue?.(step);
  }

  function skipStep() {
    reset(emptyDemographics);
    dispatch(saveDemographicsStep(emptyDemographics));
    onSkip?.();
  }

  return (
    <FormLayout>
      <h1 className={pageTitleClassName}>{t('demograficos2.titulo')}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t('demograficos2.subtitulo')}
      </p>
      <form
        onSubmit={(event) => void handleSubmit(saveStep)(event)}
        className="mt-6 flex flex-col gap-4"
      >
        <SingleChoiceField
          control={control}
          name="gender"
          label={t('campos.genero')}
          options={genderValues.map((value) => ({
            value,
            label: t(`demograficos2.options.gender.${value}`),
          }))}
        />
        <SingleChoiceField
          control={control}
          name="age_range"
          label={t('campos.faixaEtaria')}
          options={ageRangeValues.map((value) => ({
            value,
            label: t(`demograficos2.options.ageRange.${value}`),
          }))}
        />
        <MultipleChoiceField
          control={control}
          name="ethnicities"
          label={t('campos.origemEtnica')}
          options={ethnicityValues.map((value) => ({
            value,
            label: t(`demograficos2.options.ethnicity.${value}`),
          }))}
        />
        <MultipleChoiceField
          control={control}
          name="religions"
          label={t('campos.religiao')}
          options={religionValues.map((value) => ({
            value,
            label: t(`demograficos2.options.religion.${value}`),
          }))}
        />
        <SingleChoiceField
          control={control}
          name="nationality"
          label={t('campos.nacionalidade')}
          afterChange={clearNationalityDetails}
          options={nationalityValues.map((value) => ({
            value,
            label: t(`demograficos2.options.nationality.${value}`),
          }))}
        />
        {nationality === 'brasileira' && (
          <SingleChoiceField
            control={control}
            name="brazil_state"
            label={t('campos.estado')}
            options={brazilStateValues.map((value) => ({
              value,
              label: t(`demograficos2.options.brazilState.${value}`),
            }))}
          />
        )}
        {nationality === 'portuguesa' && (
          <SingleChoiceField
            control={control}
            name="portugal_region"
            label={t('campos.regiao')}
            options={portugalRegionValues.map((value) => ({
              value,
              label: t(`demograficos2.options.portugalRegion.${value}`),
            }))}
          />
        )}
        {nationality === 'outra' && (
          <Field>
            <FieldLabel htmlFor="other_nationality">
              {t('campos.nacionalidadeOutra')}
            </FieldLabel>
            <Input id="other_nationality" {...register('other_nationality')} />
          </Field>
        )}
        <div className="mt-2 flex flex-col gap-2">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {t('avancar')}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={skipStep}
            disabled={isSubmitting}
          >
            {t('pular')}
          </Button>
        </div>
      </form>
    </FormLayout>
  );
}
