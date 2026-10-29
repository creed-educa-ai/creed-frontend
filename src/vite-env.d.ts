/// <reference types="vite/client" />

// Sem esta declaração a variável chega como `any` pela index signature do
// vite/client, e o strictTypeChecked do ESLint recusa a atribuição. Declarar
// aqui é o que mantém o apiClient tipado.
interface ImportMetaEnv {
  /**
   * Base absoluta da API. Ausente por padrão — aí o `apiClient` usa `/api/v1`
   * relativo e o proxy do Vite encaminha ao backend local. Definida no
   * `.env.local` (ignorado pelo git) para apontar ao mock do contrato.
   */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
