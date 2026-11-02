import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { FormLayout } from '@/components/layout/formLayout';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { setName } from './demographicsSlice';

const demograficos1Schema = z.object({
  name: z.string().trim().min(1, {
    error: 'respondentes:demograficos1.nomeObrigatorio',
  }),
});

export type DemographicsStep1Form = z.infer<typeof demograficos1Schema>;

interface Demograficos1ViewProps {
  // A CREED-20.7 conecta esta etapa ao restante do onboarding.
  onContinue?: (data: DemographicsStep1Form) => void;
}

export function DemographicsStep1View({ onContinue }: Demograficos1ViewProps) {
  const { t } = useTranslation('respondentes');
  const dispatch = useAppDispatch();
  const nomeSalvo = useAppSelector((state) => state.demographics.name);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DemographicsStep1Form>({
    resolver: zodResolver(demograficos1Schema),
    defaultValues: { name: nomeSalvo },
  });

  function salvar(dados: DemographicsStep1Form) {
    dispatch(setName(dados.name));
    onContinue?.(dados);
  }

  const nomeInvalido = Boolean(errors.name);

  return (
    <FormLayout>
      <div className="mx-auto w-full max-w-sm lg:max-w-none">
        <h1 className="text-2xl font-bold text-heading">
          {t('demograficos1.titulo')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('demograficos1.descricaoNome')}
        </p>

        <form
          className="mt-6 flex flex-col gap-5"
          onSubmit={(evento) => void handleSubmit(salvar)(evento)}
        >
          <Field data-invalid={nomeInvalido}>
            <FieldLabel htmlFor="name" className="sr-only">
              {t('campos.nome')}
            </FieldLabel>
            <Input
              id="name"
              className="min-h-10"
              placeholder={t('campos.nomePlaceholder')}
              aria-invalid={nomeInvalido}
              aria-describedby={nomeInvalido ? 'name-erro' : undefined}
              autoComplete="name"
              {...register('name')}
            />
            {nomeInvalido && (
              <FieldError id="name-erro">
                {t('demograficos1.nomeObrigatorio')}
              </FieldError>
            )}
          </Field>

          <Button
            type="submit"
            className="min-h-10 w-full"
            disabled={isSubmitting}
          >
            {t('avancar')}
          </Button>
        </form>
      </div>
    </FormLayout>
  );
}
