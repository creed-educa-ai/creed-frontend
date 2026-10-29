import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  adicionarMentorandoSchema,
  type AdicionarMentorandoValues,
  type ChaveErro,
} from './adicionarMentorandoSchema';

interface AdicionarMentorandoProps {
  // Quem usa o componente decide o que fazer com os dados (chamar a API, por
  // exemplo). Aqui só validamos e entregamos.
  onSubmit: (values: AdicionarMentorandoValues) => void | Promise<void>;
}

export function AdicionarMentorando({ onSubmit }: AdicionarMentorandoProps) {
  const { t } = useTranslation(['adicionarMentorando']);
  const emailId = useId();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdicionarMentorandoValues>({
    resolver: zodResolver(adicionarMentorandoSchema),
    defaultValues: { email: '' },
  });

  async function submit(values: AdicionarMentorandoValues) {
    try {
      await onSubmit(values);
      reset();
    } catch {
      // O erro é de quem passou o `onSubmit`. Aqui só mantemos o e-mail
      // digitado para a pessoa tentar de novo.
    }
  }

  function translateError(key?: string) {
    if (!key) return undefined;
    return { message: t(key as ChaveErro) };
  }

  return (
    // O título da seção ("Adicionar mentorando") é de quem usa o componente.
    <section className="h-full w-full rounded-2xl bg-card p-5 shadow-sm">
      <form noValidate onSubmit={(event) => void handleSubmit(submit)(event)}>
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor={emailId} className="sr-only">
            {t('adicionarMentorando:email.label')}
          </FieldLabel>
          <InputGroup className="h-10 border-primary">
            <InputGroupAddon
              align="inline-start"
              className="p-0 has-[>button]:ml-0"
            >
              <InputGroupButton
                type="submit"
                variant="default"
                size="icon-sm"
                className="size-10 rounded-r-none"
                disabled={isSubmitting}
                aria-label={t('adicionarMentorando:adicionar')}
              >
                <Plus />
              </InputGroupButton>
            </InputGroupAddon>
            <InputGroupInput
              id={emailId}
              type="email"
              className="h-10"
              placeholder={t('adicionarMentorando:email.placeholder')}
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
            />
          </InputGroup>
          <FieldError errors={[translateError(errors.email?.message)]} />
        </Field>
      </form>
    </section>
  );
}
