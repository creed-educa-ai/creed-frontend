import { useState } from 'react';
import { Controller, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox';
import type { DemographicsForm } from './demographicsSchema';

interface Choice {
  value: string;
  label: string;
}
interface ChoiceFieldProps {
  control: Control<DemographicsForm>;
  label: string;
  options: Choice[];
}

type SingleChoiceName =
  | 'genero'
  | 'faixaEtaria'
  | 'nacionalidade'
  | 'estadoBrasil'
  | 'regiaoPortugal';

export function SingleChoiceField({
  control,
  name,
  label,
  options,
  afterChange,
}: ChoiceFieldProps & {
  name: SingleChoiceName;
  afterChange?: () => void;
}) {
  const { t } = useTranslation('respondentes');
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Select
            value={field.value ?? ''}
            onValueChange={(value) => {
              field.onChange(value || null);
              afterChange?.();
            }}
          >
            <SelectTrigger
              id={name}
              ref={field.ref}
              onBlur={field.onBlur}
              aria-invalid={fieldState.invalid}
              aria-describedby={fieldState.error ? `${name}-error` : undefined}
              className="min-h-10 w-full"
            >
              <SelectValue placeholder={t('escolher')} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="min-h-10"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {field.value !== null && (
            <Button
              type="button"
              variant="ghost"
              className="min-h-10"
              onClick={() => {
                field.onChange(null);
                afterChange?.();
              }}
            >
              {t('demograficos2.clear', { field: label })}
            </Button>
          )}
          {fieldState.error && (
            <FieldError id={`${name}-error`}>
              {t('demograficos2.invalidOption')}
            </FieldError>
          )}
        </Field>
      )}
    />
  );
}

export function MultipleChoiceField({
  control,
  name,
  label,
  options,
}: ChoiceFieldProps & {
  name: 'origemEtnica' | 'religiao';
}) {
  const { t } = useTranslation('respondentes');
  const [open, setOpen] = useState(false);
  const anchor = useComboboxAnchor();
  const labelFor = (value: string) =>
    options.find((option) => option.value === value)?.label ?? value;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Combobox
            multiple
            items={options.map((option) => option.value)}
            itemToStringLabel={labelFor}
            value={field.value}
            onValueChange={(values: string[]) => {
              field.onChange(values);
              setOpen(false);
            }}
            open={open}
            onOpenChange={setOpen}
          >
            <ComboboxChips ref={anchor} className="min-h-10 min-w-0">
              <ComboboxValue>
                {(values: string[]) =>
                  values.map((value) => (
                    <ComboboxChip
                      key={value}
                      removeLabel={t('demograficos2.remove', {
                        option: labelFor(value),
                      })}
                      className="h-auto min-h-10 max-w-full whitespace-normal [&_[data-slot=combobox-chip-remove]]:size-10 [&_[data-slot=combobox-chip-remove]]:shrink-0"
                    >
                      <span className="min-w-0 wrap-anywhere">
                        {labelFor(value)}
                      </span>
                    </ComboboxChip>
                  ))
                }
              </ComboboxValue>
              <ComboboxChipsInput
                id={name}
                ref={field.ref}
                onBlur={field.onBlur}
                placeholder={t('escolher')}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.error ? `${name}-error` : undefined
                }
              />
            </ComboboxChips>
            <ComboboxContent anchor={anchor}>
              <ComboboxEmpty>{t('semResultado')}</ComboboxEmpty>
              <ComboboxList>
                {(value: string) => (
                  <ComboboxItem key={value} value={value} className="min-h-10">
                    {labelFor(value)}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          {fieldState.error && (
            <FieldError id={`${name}-error`}>
              {t('demograficos2.invalidOption')}
            </FieldError>
          )}
        </Field>
      )}
    />
  );
}
