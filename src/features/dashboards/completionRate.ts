// Percentual de convidados que terminaram o questionário, arredondado. O card
// do resumo e a planilha CSV usam esta mesma conta para nunca divergirem.
export function completionRate(concluidos: number, convidados: number): number {
  return convidados > 0 ? Math.round((concluidos / convidados) * 100) : 0;
}
