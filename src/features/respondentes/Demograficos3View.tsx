import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { FormLayout } from '@/components/layout/formLayout';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { definirPerspectiva } from './respondentesDemograficosSlice';

// Só esta tela usa o schema, então ele nasce na feature (formularios.md,
// regra 2). A pergunta é opcional e a cliente não definiu limite de tamanho
// (P-010): qualquer texto é válido, inclusive vazio. Espaços nas pontas saem,
// como no campo de texto livre da tela 2.
const demograficos3Schema = z.object({
  perspectiva: z.string().trim(),
});

export type Demograficos3Form = z.infer<typeof demograficos3Schema>;

const respostaVazia: Demograficos3Form = { perspectiva: '' };

interface Demograficos3ViewProps {
  // A CREED-20.7 conecta estas ações ao fluxo, no mesmo formato da tela 2.
  onContinue?: (data: Demograficos3Form) => void;
  onSkip?: () => void;
}

export function Demograficos3View({
  onContinue,
  onSkip,
}: Demograficos3ViewProps) {
  const { t } = useTranslation('respondentes');
  const dispatch = useAppDispatch();
  const perspectivaSalva = useAppSelector(
    (state) => state.respondentesDemograficos.perspectiva,
  );

  // O texto vive no react-hook-form enquanto a pessoa digita e só vai para o
  // Redux no Avançar (formularios.md, regra 6). O valor inicial vem do slice
  // para quem volta a esta tela reencontrar o que já tinha salvo.
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<Demograficos3Form>({
    resolver: zodResolver(demograficos3Schema),
    defaultValues: { perspectiva: perspectivaSalva },
  });

  // Nenhuma das duas ações navega: a ligação entre as telas é da CREED-20.7,
  // que recebe o controle pelas props (P-009).
  function salvar(dados: Demograficos3Form) {
    dispatch(definirPerspectiva(dados.perspectiva));
    onContinue?.(dados);
  }

  // Pular descarta a resposta desta etapa, inclusive a que já tinha sido salva.
  function pular() {
    reset(respostaVazia);
    dispatch(definirPerspectiva(respostaVazia.perspectiva));
    onSkip?.();
  }

  return (
    <FormLayout>
      <h1 className="text-2xl font-bold text-heading">
        {t('demograficos3.titulo')}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t('demograficos3.subtitulo')}
      </p>

      <form
        onSubmit={(evento) => void handleSubmit(salvar)(evento)}
        className="mt-6 flex flex-col gap-4"
      >
        <Field>
          <FieldLabel htmlFor="perspectiva">
            {t('demograficos3.pergunta')}
          </FieldLabel>
          <Textarea
            id="perspectiva"
            placeholder={t('demograficos3.placeholder')}
            {...register('perspectiva')}
          />
        </Field>

        <div className="mt-2 flex flex-col gap-2">
          <Button
            type="submit"
            className="min-h-10 w-full"
            disabled={isSubmitting}
          >
            {t('avancar')}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-h-10 w-full"
            onClick={pular}
            disabled={isSubmitting}
          >
            {t('pular')}
          </Button>
        </div>
      </form>
    </FormLayout>
  );
}
