import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/pageHeader';
import { InfoModal } from '@/features/responses/InfoModal';
import { screenEnterClassName } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sectionTitleClassName } from '@/lib/typography';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { IDIOMAS, IDIOMA_PADRAO } from '@/i18n/config';
import type { QuestionLang } from '@/types/api';
import { loadQuestionnaire } from '@/features/responses/responsesSlice';

export function QuestionnaireOnboardingView() {
  const { t, i18n } = useTranslation([
    'onboardQuestionario',
    'formulario',
    'comum',
  ]);
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.responses.status);
  const error = useAppSelector((state) => state.responses.error);
  const formResponse = useAppSelector((state) => state.responses.formResponse);
  const fetching = useAppSelector((state) => state.responses.fetching);
  const [infoOpen, setInfoOpen] = useState(false);
  // Até esta tela pedir a sua carga e ela voltar, o que está no slice pode ser
  // de uma visita anterior (ex.: "disponível" antes de enviar).
  const [requested, setRequested] = useState(false);
  const navigate = useNavigate();
  const lang: QuestionLang =
    IDIOMAS.find((idioma) => idioma === i18n.resolvedLanguage) ?? IDIOMA_PADRAO;

  const load = useCallback(() => {
    void dispatch(loadQuestionnaire(lang));
    setRequested(true);
  }, [dispatch, lang]);

  useEffect(() => {
    load();
  }, [load]);

  const checking = !requested || fetching;
  const isSubmitted =
    !checking && status === 'ready' && formResponse?.status === 'submitted';
  const isAvailable = !checking && status === 'ready' && !isSubmitted;
  const noOpenQuestionnaire =
    status === 'error' && error === 'formulario:erros.semQuestionarioAberto';
  // "Nenhum aberto" é informação, não falha: fica no subtítulo como as outras.
  const failed = !checking && status === 'error' && !noOpenQuestionnaire;
  // Sem acesso, tentar de novo daria o mesmo 403.
  const canRetry = failed && error !== 'formulario:erros.semAcesso';

  let statusMessage: string | null;
  if (checking) {
    statusMessage = t('comum:carregando');
  } else if (isSubmitted) {
    statusMessage = t('formulario:jaRespondido');
  } else if (noOpenQuestionnaire) {
    statusMessage = t('formulario:erros.semQuestionarioAberto');
  } else if (failed) {
    statusMessage = null;
  } else {
    statusMessage = t('onboardQuestionario:subtitulo');
  }

  return (
    // isolate: a camada do fundo (-z-10) fica atrás do conteúdo, mas dentro
    // desta tela, sem cair para trás do body.
    <div className="relative isolate flex min-h-svh flex-col overflow-hidden">
      {/* O roxo é uma camada própria para dissolver sozinho, como nas outras
          telas da marca: com o fade na tela inteira, o card dissolveria junto
          em vez de subir. */}
      <div
        aria-hidden="true"
        className="bg-brand absolute inset-0 -z-10 animate-in duration-700 ease-out fade-in motion-reduce:animate-none"
      />
      <PageHeader
        eyebrow="João Silva"
        title={t('onboardQuestionario:titulo')}
        tone="brand"
      />
      <div className="flex flex-1 flex-col overflow-hidden p-6 lg:p-8">
        <div
          className={cn(
            'mx-auto my-auto flex w-full max-w-xl flex-col items-center justify-center gap-6 py-6',
            screenEnterClassName,
          )}
        >
          <div className="w-full rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-col items-start justify-start gap-1 rounded-xl bg-primary p-8 text-primary-foreground">
              <h2
                className={cn(
                  sectionTitleClassName,
                  'text-balance text-inherit',
                )}
              >
                {t('onboardQuestionario:start')}
              </h2>
              <p role="status" aria-live="polite" className="text-balance">
                {statusMessage}
              </p>
            </div>
            {isAvailable && (
              <div className="p-4 pt-6">
                <p className="text-sm leading-relaxed text-card-foreground">
                  {t('onboardQuestionario:mensagem')}
                </p>
              </div>
            )}
            {failed && (
              <div
                role="alert"
                className="flex flex-col items-start gap-3 p-4 pt-6"
              >
                <p className="text-sm text-destructive">
                  {/* O slice guarda a chave como string; mesma saída do FormView. */}
                  {t(
                    (error ?? 'formulario:erros.servicoIndisponivel') as never,
                  )}
                </p>
                {canRetry && (
                  <Button type="button" variant="outline" onClick={load}>
                    {t('comum:acoes.tentarNovamente')}
                  </Button>
                )}
              </div>
            )}
            <div
              className={cn(
                'flex w-full flex-wrap items-center justify-end gap-2 p-2',
                isAvailable &&
                  'justify-between rounded-2xl border border-border bg-background pl-4',
              )}
            >
              {isAvailable && (
                <div className="flex gap-4 text-sm text-foreground">
                  <p>{t('onboardQuestionario:tempo')}</p>
                  <p>{t('onboardQuestionario:secao')}</p>
                </div>
              )}
              <Button
                disabled={!isAvailable}
                onClick={() => {
                  setInfoOpen(true);
                }}
              >
                {t('onboardQuestionario:iniciar')}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <InfoModal
        open={infoOpen}
        onOpenChange={setInfoOpen}
        onReview={() => {
          navigate('/demographics/step-1');
        }}
        onStart={() => {
          navigate('/questionnaire/questions');
        }}
      />
    </div>
  );
}
