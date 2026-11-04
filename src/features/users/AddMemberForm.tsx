import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Plus, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
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
} from '@/features/users/addMemberSchema';

interface AddMemberFormProps {
  // Quem usa o componente decide o que fazer com os dados (chamar a API, por
  // exemplo). O formulário só valida e entrega.
  onSubmit: (values: AddMemberValues) => void | Promise<void>;
  // Sem o seletor de função (painel do admin, para mentorandos): a função fica
  // `respondente`, o padrão, e os campos e o Adicionar ficam numa linha só.
  withRole?: boolean;
}

export function AddMemberForm({
  onSubmit,
  withRole = true,
}: AddMemberFormProps) {
  const { t } = useTranslation(['organizations']);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddMemberValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { name: '', email: '', role: 'respondente' },
  });

  async function submit(values: AddMemberValues) {
    try {
      await onSubmit(values);
      reset();
    } catch {
      // O erro é de quem passou o `onSubmit`. Aqui só mantemos o que foi
      // digitado para a pessoa tentar de novo.
    }
  }

  function translateError(key?: string) {
    if (!key) return undefined;
    return { message: t(key as never) };
  }

  return (
    // Sem a função (admin), da tela média em diante tudo numa linha: nome e
    // e-mail dividem o espaço e o Adicionar fica no fim, só com a largura do
    // texto. Com a função, um campo por linha.
    <form
      noValidate
      className={cn(
        'flex flex-col gap-3',
        !withRole && 'md:grid md:grid-cols-[1fr_1fr_auto] md:items-start',
      )}
      onSubmit={(event) => void handleSubmit(submit)(event)}
    >
      {/* Nome e e-mail no mesmo formato, com o ícone do campo à esquerda (pessoa
          e carta), como a lupa das buscas. */}
      <Field data-invalid={Boolean(errors.name)}>
        <FieldLabel htmlFor="member-name" className="sr-only">
          {t('organizations:addMember.name.label')}
        </FieldLabel>
        <InputGroup>
          <InputGroupAddon>
            <User aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            id="member-name"
            // O nome é de quem vai ser convidado: o navegador não deve sugerir
            // o de quem está logado.
            autoComplete="off"
            placeholder={t('organizations:addMember.name.placeholder')}
            aria-invalid={Boolean(errors.name)}
            {...register('name')}
          />
        </InputGroup>
        <FieldError errors={[translateError(errors.name?.message)]} />
      </Field>

      <Field data-invalid={Boolean(errors.email)}>
        <FieldLabel htmlFor="member-email" className="sr-only">
          {t('organizations:addMember.email.label')}
        </FieldLabel>
        <InputGroup>
          <InputGroupAddon>
            <Mail aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            id="member-email"
            type="email"
            placeholder={t('organizations:addMember.email.placeholder')}
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
        </InputGroup>
        <FieldError errors={[translateError(errors.email?.message)]} />
      </Field>

      {/* Função e Adicionar meio a meio. No celular estreito, um embaixo do
          outro: "Função: Respondente" não cabe na metade. Sem a função, só o
          Adicionar, que é a última coluna da linha. */}
      <div
        className={cn(
          'grid grid-cols-1 items-start gap-3',
          withRole && 'sm:grid-cols-2',
        )}
      >
        {withRole && (
          <Field data-invalid={Boolean(errors.role)}>
            <FieldLabel htmlFor="member-role" className="sr-only">
              {t('organizations:addMember.role.label')}
            </FieldLabel>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="member-role" className="w-full">
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
        )}

        <Button
          type="submit"
          className={cn('w-full', !withRole && 'md:px-6')}
          disabled={isSubmitting}
        >
          <Plus aria-hidden="true" />
          {t('organizations:addMember.submit')}
        </Button>
      </div>
    </form>
  );
}
