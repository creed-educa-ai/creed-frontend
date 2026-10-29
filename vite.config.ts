// defineConfig vem de vitest/config, não de vite: só essa versão conhece a
// chave `test` usada abaixo.
import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Resolvido a partir de import.meta.url: o projeto é "type": "module" e
    // __dirname não existe em ESM.
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
    proxy: {
      // Evita CORS em desenvolvimento: o front chama /api e o Vite
      // encaminha para o backend FastAPI.
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    // Mesma razão do ignore no ESLint: sem isso o Vitest coleta também os
    // testes das worktrees em .claude/ e roda o projeto duas vezes.
    exclude: [...configDefaults.exclude, '.claude/**'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/test/', '**/*.d.ts'],
    },
  },
});
