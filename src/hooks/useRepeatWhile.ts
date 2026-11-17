import { useEffect, useState } from 'react';

// O que cada repetição devolve para poder ser cancelada: a promessa do
// `dispatch` de um thunk tem `abort()`.
interface Cancelable {
  abort: () => void;
}

// Depois disto a tela para de perguntar, mesmo que a resposta não tenha mudado.
const TETO_MS = 2 * 60 * 1000;

/**
 * Repete `repeat` a cada `intervalMs` enquanto `active` for verdadeiro, por até
 * 2 minutos (spec da CREED-80, "Front"). Para quando `active` vira falso, e ao
 * sair da tela também cancela a busca que estiver a caminho.
 *
 * `repeat` deve vir de um `useCallback`: quando ele muda (outro período, por
 * exemplo), a contagem recomeça.
 *
 * Devolve `true` quando o teto chegou sem `active` virar falso. Depois disso,
 * continua `true`.
 */
export function useRepeatWhile(
  active: boolean,
  intervalMs: number,
  repeat: () => Cancelable,
): boolean {
  const [tetoChegou, setTetoChegou] = useState(false);

  useEffect(() => {
    if (!active) return;

    const vezes = Math.floor(TETO_MS / intervalMs);
    let feitas = 0;
    let ultima: Cancelable | null = null;
    const timer = window.setInterval(() => {
      feitas += 1;
      ultima = repeat();
      if (feitas >= vezes) {
        window.clearInterval(timer);
        setTetoChegou(true);
      }
    }, intervalMs);

    return () => {
      window.clearInterval(timer);
      // Já respondida, o `abort()` não faz nada.
      ultima?.abort();
    };
  }, [active, intervalMs, repeat]);

  return tetoChegou;
}
