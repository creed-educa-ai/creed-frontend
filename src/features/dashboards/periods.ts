// O rótulo de um período na tela: só a data final, no formato do idioma de
// quem vê ("15/10/2026"). O back manda o id e as datas (o nome do formulário,
// "Questionário 2026-10-01 a 2026-10-15", não traduz).
import type { PeriodOption } from './dashboardsApi';

export function formatPeriod(period: PeriodOption, language: string): string {
  return new Intl.DateTimeFormat(language, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(period.closes_at));
}

/**
 * Uma função que dá o rótulo de um período pelo id. Id que não está na lista
 * volta como veio, para a tela nunca ficar sem texto.
 */
export function periodLabeler(
  periods: readonly PeriodOption[],
  language: string,
): (id: string) => string {
  const rotulos = new Map(
    periods.map((period) => [period.id, formatPeriod(period, language)]),
  );
  return (id) => rotulos.get(id) ?? id;
}
