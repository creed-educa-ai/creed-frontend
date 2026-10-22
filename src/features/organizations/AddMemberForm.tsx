import { Controller, useForm } from 'react-hook-form';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MEMBER_ROLES,
  addMemberSchema,
  type AddMemberValues,
} from '@/features/organizations/addMemberSchema';

interface AddMemberFormProps {
  // Quem usa o componente decide o que fazer com os dados (chamar a API, por
  // exemplo). O formulário só valida e entrega.
  onSubmit: (values: AddMemberValues) => void | Promise<void>;
}

export function AddMemberForm({ onSubmit }: AddMemberFormProps) {
  const { t } = useTranslation(['organizations']);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddMemberValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { email: '', role: 'respondente' },
  });

  async function submit(values: AddMemberValues) {
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
    return { message: t(key as never) };
  }

  return (
    <form
      noValidate
      className="flex flex-col gap-3 md:flex-row md:items-start"
      onSubmit={(event) => void handleSubmit(submit)(event)}
    >
      <Field data-invalid={Boolean(errors.email)} className="md:flex-1">
        <FieldLabel htmlFor="member-email" className="sr-only">
          {t('organizations:addMember.email.label')}
        </FieldLabel>
        <InputGroup className="h-10">
          <InputGroupInput
            id="member-email"
            type="email"
            className="h-10"
            placeholder={t('organizations:addMember.email.placeholder')}
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
          <InputGroupAddon
            align="inline-end"
            className="p-0 has-[>button]:mr-0"
          >
            <InputGroupButton
              type="submit"
              variant="default"
              size="icon-sm"
              className="size-10 rounded-l-none"
              disabled={isSubmitting}
              aria-label={t('organizations:addMember.submit')}
            >
              <Plus />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <FieldError errors={[translateError(errors.email?.message)]} />
      </Field>

      <Field data-invalid={Boolean(errors.role)} className="md:w-56">
        <FieldLabel htmlFor="member-role" className="sr-only">
          {t('organizations:addMember.role.label')}
        </FieldLabel>
        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                id="member-role"
                className="w-full data-[size=default]:h-10"
              >
                <span className="flex gap-1">
                  <span className="text-muted-foreground">
                    {t('organizations:addMember.role.label')}:
                  </span>
                  <SelectValue />
                </span>
              </SelectTrigger>
              <SelectContent>
                {MEMBER_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {t(`organizations:addMember.role.options.${role}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError errors={[translateError(errors.role?.message)]} />
      </Field>
    </form>
  );
}
