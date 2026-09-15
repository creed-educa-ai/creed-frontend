// PROVISÓRIO — prévia estática do questionário para a apresentação.
//
// Reproduz o frame "Objetiva" do Figma com conteúdo chumbado: não há API, slice
// nem fluxo de perguntas. As opções podem ser marcadas (radio nativo, sem
// estado), e "Avançar" não faz nada — o aviso de "em construção" deixa isso
// claro para quem vê. Some quando o questionário real for implementado.
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import CreedSymbol from '@/components/logos/logo';
import wordmark from '@/components/logos/wordmark-dark.svg';
import { SeletorIdioma } from '@/components/SeletorIdioma';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const TOTAL_DE_PERGUNTAS = 6;
const RESPOSTAS = [1, 2, 3, 4, 5, 6];

export function QuestionarioPreviaView() {
  const { t } = useTranslation(['questionario']);
  const navigate = useNavigate();

  return (
    <div className="bg-surface flex min-h-svh flex-col items-center justify-center gap-4 px-4 py-8 sm:px-6">
      {/* Aviso de prévia e troca de idioma, fora do card do questionário */}
      <div className="flex w-full max-w-2xl flex-wrap items-center justify-between gap-3">
        <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="rounded-full bg-warning/25 px-2.5 py-0.5 text-xs font-semibold text-foreground">
            {t('questionario:emConstrucao')}
          </span>
          {t('questionario:aviso')}
        </p>
        <SeletorIdioma />
      </div>

      <section className="w-full max-w-2xl rounded-2xl border border-primary/30 bg-card p-4 shadow-sm sm:p-7">
        {/* Cabeçalho: marca, seção e progresso */}
        <div className="grid items-center gap-4 sm:grid-cols-[auto_1fr] sm:gap-8">
          <div className="flex items-center gap-2">
            <CreedSymbol className="size-7 text-primary" />
            <img src={wordmark} alt="creed.ai" className="h-4" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-lg font-bold text-heading">
                {t('questionario:secao', { numero: 1 })}
              </span>
              <span className="text-sm font-semibold text-heading">
                {t('questionario:progresso', {
                  atual: 1,
                  total: TOTAL_DE_PERGUNTAS,
                })}
              </span>
            </div>
            <Progress
              value={100 / TOTAL_DE_PERGUNTAS}
              aria-label={t('questionario:progresso', {
                atual: 1,
                total: TOTAL_DE_PERGUNTAS,
              })}
              className="h-1 border-0 bg-accent"
            />
          </div>
        </div>

        {/* Enunciado */}
        <div className="mt-6 rounded-xl bg-primary px-5 py-4 text-primary-foreground">
          <h1 className="text-2xl font-bold text-balance">
            {t('questionario:tipo')}
          </h1>
          <p className="mt-1 text-sm opacity-90">
            {t('questionario:instrucao')}
          </p>
        </div>

        {/* Opções */}
        <fieldset className="mt-3 flex flex-col gap-2.5 sm:px-2">
          <legend className="sr-only">{t('questionario:tipo')}</legend>
          {RESPOSTAS.map((numero) => (
            <label
              key={numero}
              className="flex min-h-10 cursor-pointer items-center gap-3 rounded-lg border border-primary/60 px-4 py-2 text-sm text-heading transition-colors hover:bg-accent has-checked:border-primary has-checked:bg-accent"
            >
              <input
                type="radio"
                name="questionario-previa"
                className="size-4 accent-primary"
              />
              {t('questionario:resposta', { numero })}
            </label>
          ))}
        </fieldset>

        {/* Rodapé: voltar, tempo restante e avançar */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/40 bg-background px-4 py-3 sm:px-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              navigate(-1);
            }}
          >
            {t('questionario:voltar')}
          </Button>
          <span className="order-first w-full text-center text-xs text-muted-foreground sm:order-0 sm:w-auto">
            {t('questionario:tempoRestante', { minutos: 8, secoes: 3 })}
          </span>
          <Button type="button">{t('questionario:avancar')}</Button>
        </div>
      </section>
    </div>
  );
}
