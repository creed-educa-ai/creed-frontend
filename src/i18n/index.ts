import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { en } from '@/i18n/locales/en';
import { ptBR } from '@/i18n/locales/pt-BR';

export const IDIOMAS = ['pt-BR', 'en'] as const;
export type Idioma = (typeof IDIOMAS)[number];

export const IDIOMA_PADRAO: Idioma = 'pt-BR';

export const defaultNS = 'comum';

export const resources = {
  'pt-BR': ptBR,
  en,
};

// Prefixo do projeto para não colidir com o `i18nextLng` genérico de outra
// aplicação no mesmo domínio.
export const CHAVE_IDIOMA = 'creed.idioma';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS,
    supportedLngs: IDIOMAS,
    // Cobre as variantes: 'en-US' resolve para 'en' pelo corte de região, e
    // 'pt' sem região cai em pt-BR. Não usar `nonExplicitSupportedLngs`
    // aqui — ela quebra a busca no bundle hifenizado 'pt-BR'.
    fallbackLng: { pt: [IDIOMA_PADRAO], default: [IDIOMA_PADRAO] },
    interpolation: {
      // O React já escapa o que renderiza; escapar de novo mostraria
      // entidades HTML na tela.
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: CHAVE_IDIOMA,
    },
  });

// Mantém <html lang> em dia: leitor de tela e hifenização do browser leem esse
// atributo, não o estado do React.
i18n.on('languageChanged', (idioma: string) => {
  document.documentElement.lang = idioma;
});

export default i18n;
