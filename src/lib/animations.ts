// Entrada do conteúdo das telas que o menu abre: a mesma do login
// (sobe de baixo, com fade), mais curta e mais baixa, porque trocar de tela
// pelo menu se repete muito. Vai no conteúdo, nunca no header: o header é igual
// em todas as telas e animar o que não mudou é ruído (ui-e-responsividade.md §4).
// Na tela roxa do menu (onboarding do questionário) o card sobe com esta, e só
// o fundo dissolve, como nas outras telas da marca.
export const screenEnterClassName =
  'animate-in duration-300 ease-out fade-in slide-in-from-bottom-4 motion-reduce:animate-none';
