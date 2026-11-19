# Feature: prognosticos

STUB — espelha o domínio `prognosticos` do backend, que hoje também é stub
(`app/domains/prognosticos/router.py` sem rota). Não crie `prognosticosApi.ts` antes de o back
ter contrato: ver `creed-ai-context/conventions/contrato-front-back.md`.

Quando existir, a forma é a do molde `features/authentication/`:

```
prognosticos/
├── <Nome>View.tsx
├── prognosticosSlice.ts
├── prognosticosApi.ts
└── prognosticosSlice.test.ts
```

O front recebe os dados **já agregados e calculados** pelo backend. Nunca
agregar aqui (princípio 1 do CONTEXT.md).
