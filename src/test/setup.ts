import '@testing-library/jest-dom/vitest';
// Mesmo motivo do main.tsx: componentes com useTranslation esperam o i18next
// já configurado — aqui isso vale para toda a suíte.
import '@/i18n/config';

// jsdom não implementa ResizeObserver; componentes Radix (ex.: Checkbox) usam
// essa API internamente e quebram no render sem esse stub.
global.ResizeObserver = class ResizeObserver {
  observe() {
    return undefined;
  }
  unobserve() {
    return undefined;
  }
  disconnect() {
    return undefined;
  }
};
