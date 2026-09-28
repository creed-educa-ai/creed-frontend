import { useState } from 'react';

// Delay para o `animate-brand-giro` continuar de onde estava entre telas.
//
// Cada tela monta o próprio fundo da marca, e animação CSS de elemento novo
// começa do zero: sem isto, o degradê reinicia a cada troca de página. O delay
// negativo "adianta" a animação pelo tempo desde que a página carregou, então
// todo fundo da marca nasce no mesmo ponto do mesmo relógio.
//
// Fica no useState para ser lido UMA vez, na montagem: mudar o delay de uma
// animação já rodando (a cada re-render) faria o degradê pular.
export function useAtrasoDaAnimacaoMarca() {
  const [atraso] = useState(() => -performance.now());
  return `${String(atraso)}ms`;
}
