import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { FormLayout } from '@/components/layout/formLayout';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { definirPerspectiva } from '@/features/respondentes/respondentesDemograficosSlice';

// Só esta tela usa o schema, então ele nasce na feature (formularios.md,
// regra 2). A pergunta é opcional e a cliente não definiu limite de tamanho
// (P-010): qualquer texto é válido, inclusive vazio.
const demograficos3Schema = z.object({
  perspectiva: z.string(),
});

type Demograficos3Form = z.infer<typeof demograficos3Schema>;

export function Demograficos3View() {
  const { t } = useTranslation(['comum', 'respondentes']);
  const dispatch = useAppDispatch();
  const perspectivaSalva = useAppSelector(
    (state) => state.respondentesDemograficos.perspectiva,
  );

  // O texto vive no react-hook-form enquanto a pessoa digita e só vai para o
  // Redux no Avançar (formularios.md, regra 6). O valor inicial vem do slice
  // para quem volta a esta tela reencontrar o que já tinha salvo.
  const { register, handleSubmit } = useForm<Demograficos3Form>({
    resolver: zodResolver(demograficos3Schema),
    defaultValues: { perspectiva: perspectivaSalva },
  });

  // Avançar salva o passo, mas não navega: a ligação entre as telas é a
  // CREED-20.7 (P-009).
  function salvar(dados: Demograficos3Form) {
    dispatch(definirPerspectiva(dados.perspectiva));
  }

  return (
    <FormLayout>
      <h1 className="text-2xl font-bold text-heading">
        {t('respondentes:demograficos3.titulo')}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t('respondentes:demograficos3.subtitulo')}
      </p>

      <form onSubmit={(evento) => void handleSubmit(salvar)(evento)}>
        <div className="mt-6 flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="perspectiva">
              {t('respondentes:demograficos3.pergunta')}
            </FieldLabel>
            <Textarea
              id="perspectiva"
              placeholder={t('respondentes:demograficos3.placeholder')}
              {...register('perspectiva')}
            />
          </Field>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Button type="submit" className="w-full">
            {t('respondentes:avancar')}
          </Button>
          <Button type="button" variant="outline" className="w-full">
            {t('respondentes:pular')}
          </Button>
        </div>
      </form>
    </FormLayout>
  );
}
