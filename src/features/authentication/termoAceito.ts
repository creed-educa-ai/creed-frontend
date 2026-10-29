// PROVISÓRIO — mock do aceite do termo de consentimento.
//
// O backend ainda não guarda se o usuário aceitou o termo: não há campo na
// tabela `user` nem na resposta do login. Até existir, o aceite fica no
// localStorage deste navegador, por id de usuário. Limite conhecido: em outro
// navegador ou computador o termo aparece de novo.
//
// Quando o backend tiver o campo, estas duas funções saem: a leitura vira o
// campo da sessão e o registro vira uma chamada de API.

function chave(userId: string): string {
  return `creed.termoAceito.${userId}`;
}

export function termoFoiAceito(userId: string): boolean {
  return localStorage.getItem(chave(userId)) !== null;
}

export function registrarAceiteDoTermo(userId: string): void {
  localStorage.setItem(chave(userId), new Date().toISOString());
}
