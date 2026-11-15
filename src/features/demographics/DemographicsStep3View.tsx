import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { FormLayout } from '@/components/layout/formLayout';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { setPerspective } from './demographicsSlice';
import { pageTitleClassName } from '@/lib/typography';

// Só esta tela usa o schema, então ele nasce na feature (formularios.md,
// regra 2). A pergunta é opcional e a cliente não definiu limite de tamanho
// (P-010): qualquer texto é válido, inclusive vazio. Espaços nas pontas saem,
// como no campo de texto livre da tela 2.
const demograficos3Schema = z.object({
  perspective: z.string().trim(),
});

export type DemographicsStep3Form = z.infer<typeof demograficos3Schema>;

const respostaVazia: DemographicsStep3Form = { perspective: '' };

interface Demograficos3ViewProps {
  // A CREED-20.7 conecta estas ações ao fluxo, no mesmo formato da tela 2.
  // Podem devolver uma promessa (o envio ao back): os botões ficam
  // desabilitados até ela terminar.
  onContinue?: (data: DemographicsStep3Form) => void | Promise<void>;
  onSkip?: () => void | Promise<void>;
}

export function DemographicsStep3View({
  onContinue,
  onSkip,
}: Demograficos3ViewProps) {
  const { t } = useTranslation('respondentes');
  const dispatch = useAppDispatch();
  const perspectivaSalva = useAppSelector(
    (state) => state.demographics.perspective,
  );
  // O Pular não passa pelo handleSubmit: o envio dele tem estado próprio.
  const [pulando, setPulando] = useState(false);

  // O texto vive no react-hook-form enquanto a pessoa digita e só vai para o
  // Redux no Avançar (formularios.md, regra 6). O valor inicial vem do slice
  // para quem volta a esta tela reencontrar o que já tinha salvo.
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<DemographicsStep3Form>({
    resolver: zodResolver(demograficos3Schema),
    defaultValues: { perspective: perspectivaSalva },
  });

  // Nenhuma das duas ações navega: a ligação entre as telas é da CREED-20.7,
  // que recebe o controle pelas props (P-009).
  async function salvar(dados: DemographicsStep3Form) {
    dispatch(setPerspective(dados.perspective));
    await onContinue?.(dados);
  }

  // Pular descarta a resposta desta etapa, inclusive a que já tinha sido salva.
  async function pular() {
    reset(respostaVazia);
    dispatch(setPerspective(respostaVazia.perspective));
    setPulando(true);
    try {
      await onSkip?.();
    } finally {
      setPulando(false);
    }
  }

  const enviando = isSubmitting || pulando;

  return (
    <FormLayout>
      <h1 className={pageTitleClassName}>{t('demograficos3.titulo')}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t('demograficos3.subtitulo')}
      </p>

      <form
        onSubmit={(evento) => void handleSubmit(salvar)(evento)}
        className="mt-6 flex flex-col gap-4"
      >
        <Field>
          <FieldLabel htmlFor="perspective">
            {t('demograficos3.pergunta')}
          </FieldLabel>
          <Textarea
            id="perspective"
            placeholder={t('demograficos3.placeholder')}
            {...register('perspective')}
          />
        </Field>

        <div className="mt-2 flex flex-col gap-2">
          <Button type="submit" className="w-full" disabled={enviando}>
            {t('avancar')}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => void pular()}
            disabled={enviando}
          >
            {t('pular')}
          </Button>
        </div>
      </form>
    </FormLayout>
  );
}
