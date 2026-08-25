import type { defaultNS } from '@/i18n';
import type { ptBR } from '@/i18n/locales/pt-BR';

// Declaration merging: dá autocomplete e checagem nas chaves passadas para
// `t()` e `<Trans>`. Chave inexistente vira erro de compilação.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: typeof ptBR;
  }
}
