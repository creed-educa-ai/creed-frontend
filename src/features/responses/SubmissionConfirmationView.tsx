import { useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import CreedSymbol from '@/components/logos/logo';
import wordmark from '@/components/logos/wordmark-light.svg';
import { Button } from '@/components/ui/button';
import { loadSubmittedInsight } from '@/features/responses/responsesSlice';
import { useBrandAnimationDelay } from '@/hooks/useBrandAnimationDelay';
import { useRepeatWhile } from '@/hooks/useRepeatWhile';
import { dashboardPath } from '@/lib/dashboardPath';
import { cn } from '@/lib/utils';
import { pageTitleClassName } from '@/lib/typography';

// O que a revisão manda junto ao navegar para cá depois do envio.
interface ConfirmacaoRouteState {
  formResponseId?: string;
}

// O insight da resposta que acabou de ser enviada: nasce em preparo, e a tela
// pergunta a cada 5 s, por até 2 min, se ele já ficou pronto.
function InsightDaResposta({ formResponseId }: { formResponseId: string }) {
  const { t } = useTranslation(['respostasEnviadas']);
  const dispatch = useAppDispatch();
  const status = useAppSelector(
    (state) => state.responses.submission.insightStatus,
  );

  const consultar = useCallback(
    () => dispatch(loadSubmittedInsight(formResponseId)),
    [dispatch, formResponseId],
  );
  const tetoChegou = useRepeatWhile(
    status === null || status === 'pending',
    5_000,
    consultar,
  );

  if (status === 'done') {
    return (
      <>
        <p role="status" className="max-w-sm text-sm/relaxed">
          {t('respostasEnviadas:insightPronto')}
        </p>
        <Button asChild variant="outline" className="w-full max-w-xs">
          {/* O insight é da pessoa, em qualquer papel: o dashboard individual. */}
          <Link to="/dashboard">{t('respostasEnviadas:verInsight')}</Link>
        </Button>
      </>
    );
  }

  // 🟡 Premissa P-095: `failed` antes do teto para a busca e diz que o insight
  // não ficou disponível, sem "tentar de novo" (P-044).
  const mensagem =
    status === 'failed'
      ? t('respostasEnviadas:insightIndisponivel')
      : tetoChegou
        ? t('respostasEnviadas:insightNoDashboard')
        : t('respostasEnviadas:insightEmPreparo');

  return (
    <p role="status" className="max-w-sm text-sm/relaxed opacity-90">
      {mensagem}
    </p>
  );
}

// Tela de "respostas enviadas", depois de confirmar o envio na revisão.
// Copiada da AwaitingConfirmationView: mesmo fundo da marca girando e mesmo
// símbolo animado, com a wordmark embaixo, o aviso do insight e a ação de
// voltar.
export function SubmissionConfirmationView() {
  const { t } = useTranslation(['respostasEnviadas']);
  const atrasoDaAnimacao = useBrandAnimationDelay();
  const role = useAppSelector((state) => state.authentication.user?.role);
  const location = useLocation();
  const routeState = location.state as ConfirmacaoRouteState | null;
  // Sem o id (a tela aberta direto pelo endereço), não há o que acompanhar.
  const formResponseId =
    typeof routeState?.formResponseId === 'string'
      ? routeState.formResponseId
      : null;

  return (
    // A tela roxa aparece com fade-in. Fica num div por fora porque o fade e
    // o giro do degradê usam a mesma propriedade `animation`: no mesmo
    // elemento, um apagaria o outro.
    <div className="animate-in duration-700 ease-out fade-in motion-reduce:animate-none">
      <div
        className="bg-brand animate-brand-giro flex min-h-svh flex-col items-center justify-center gap-6 p-10 text-center text-primary-foreground"
        style={{ animationDelay: atrasoDaAnimacao }}
      >
        <div className="flex flex-col items-center gap-4">
          <CreedSymbol animated className="size-28" />
          <img src={wordmark} alt="CREED.ai" className="w-44" />
        </div>

        <div className="mt-6">
          <h1 className={cn(pageTitleClassName, 'text-inherit')}>
            {t('respostasEnviadas:titulo')}
          </h1>
          <p className="mt-2 max-w-sm text-sm/relaxed opacity-90">
            {t('respostasEnviadas:mensagem')}
          </p>
        </div>

        {formResponseId ? (
          <InsightDaResposta formResponseId={formResponseId} />
        ) : (
          <p className="max-w-sm text-sm/relaxed opacity-90">
            {t('respostasEnviadas:insightNoDashboard')}
          </p>
        )}

        <Button asChild className="w-full max-w-xs">
          {/* Respondido o questionário, a pessoa volta para o dashboard. */}
          <Link to={dashboardPath(role)}>{t('respostasEnviadas:voltar')}</Link>
        </Button>
      </div>
    </div>
  );
}
