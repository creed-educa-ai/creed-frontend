# Feature: relatorios

STUB — espelha o domínio `relatorios` do backend, que hoje também é stub
(`app/domains/relatorios/router.py` sem rota). Não crie `relatoriosApi.ts` antes de o back
ter contrato: ver `creed-ai-context/conventions/contrato-front-back.md`.

Quando existir, a forma é a do molde `features/authentication/`:

```
relatorios/
├── <Nome>View.tsx
├── relatoriosSlice.ts
├── relatoriosApi.ts
└── relatoriosSlice.test.ts
```

O front recebe os dados **já agregados e calculados** pelo backend. Nunca
agregar aqui (princípio 1 do CONTEXT.md).
