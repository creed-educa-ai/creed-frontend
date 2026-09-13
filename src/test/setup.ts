import '@testing-library/jest-dom/vitest';
// Mesmo motivo do main.tsx: componentes com useTranslation esperam o i18next
// já configurado — aqui isso vale para toda a suíte.
import '@/i18n/config';

if (
  typeof globalThis.localStorage === 'undefined' ||
  typeof globalThis.localStorage.setItem !== 'function'
) {
  const store = new Map<string, string>();
  const memoryStorage: Storage = {
    get length() {
      return store.size;
    },
    clear: () => {
      store.clear();
    },
    getItem: (key) => store.get(key) ?? null,
    key: (index) => Array.from(store.keys())[index] ?? null,
    removeItem: (key) => {
      store.delete(key);
    },
    setItem: (key, value) => {
      store.set(key, value);
    },
  };

  Object.defineProperty(globalThis, 'localStorage', {
    value: memoryStorage,
    configurable: true,
    writable: true,
  });
}
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
