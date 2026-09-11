import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { FormLayout } from '@/components/layout/formLayout';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { definirNome } from '@/features/respondentes/respondentesDemograficosSlice';

export function Demograficos1View() {
  const { t } = useTranslation(['comum', 'respondentes']);
  const dispatch = useAppDispatch();
  const nome = useAppSelector((state) => state.respondentesDemograficos.nome);

  return (
    <FormLayout>
      <h1 className="text-3xl font-bold text-heading">
        {t('respondentes:demograficos1.titulo')}
      </h1>

      <div className="mt-4">
        <Field>
          <FieldLabel htmlFor="nome" className="text-lg font-semibold">
            {t('respondentes:campos.nome')}
          </FieldLabel>
          <FieldDescription>
            {t('respondentes:demograficos1.descricaoNome')}
          </FieldDescription>
          <Input
            id="nome"
            className="h-11"
            placeholder={t('respondentes:campos.nomePlaceholder')}
            value={nome}
            onChange={(e) => dispatch(definirNome(e.target.value))}
          />
        </Field>
      </div>

      <div className="mt-5">
        <Button type="button" className="w-full">
          {t('respondentes:avancar')}
        </Button>
      </div>
    </FormLayout>
  );
}
