//Faz o download no navegador
// Baixa um texto (csv) como arquivo no navegador, sem passar pelo back.
export function baixarArquivo(
  conteudo: string,
  nomeArquivo: string,
  tipo: string,
): void {
  const blob = new Blob([conteudo], { type: tipo });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}
