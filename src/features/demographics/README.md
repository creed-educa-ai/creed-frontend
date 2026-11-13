# Dados demográficos (onboarding)

Onboarding que vem depois do aceite do termo e antes do questionário. São duas
etapas, as duas opcionais:

| Rota | Tela | O que pede |
|---|---|---|
| `/demographics/step-2` | `DemographicsStep2View` | perfil: gênero, faixa etária, origem étnica, religião e nacionalidade |
| `/demographics/step-3` | `DemographicsStep3View` | perspectiva: uma pergunta aberta |

Os nomes `step-2` e `step-3` vêm de quando existia uma etapa 1, que pedia o
nome. Ela saiu na CREED-68: o nome já vem do cadastro.

## Fluxo

```
termo aceito → perfil → perspectiva → PUT /demographics/me → /questionnaire
```

Quem liga as telas às rotas e ao back é o `demographicsFlow.tsx`. As telas não
navegam nem chamam a API: recebem `onContinue` e `onSkip` por prop.

Três regras, todas no `demographicsFlow.tsx`:

1. **Quem já tem perfil não passa pelo onboarding de novo.** Ao abrir o perfil,
   o fluxo chama `GET /demographics/me`. Com 200, a pessoa volta para onde
   estava (ou vai para o questionário). Com 404, vê o onboarding.
2. **O perfil é salvo no fim da perspectiva**, com `PUT /demographics/me`.
   **Pular também salva**: os campos vão vazios, e é assim que o back registra
   que a pessoa pulou. Se o `PUT` falhar, a pessoa fica na tela, com a mensagem
   de erro e o que preencheu.
3. **Revisão.** O modal da entrada do questionário
   (`QuestionnaireOnboardingView`) busca o perfil e abre as telas com
   `state: { review: true }`. Nesse modo elas aparecem já preenchidas, mesmo
   para quem tem perfil, e ao salvar a pessoa volta para o questionário.

## Onde mora cada coisa

| Arquivo | Responsabilidade |
|---|---|
| `demographicsApi.ts` | as duas chamadas ao back |
| `demographicsSlice.ts` | o rascunho das duas etapas, o que se sabe do perfil no back (`profile`) e o estado do envio (`saving`) |
| `demographicsFlow.tsx` | as rotas: busca, redirecionamento, navegação e envio |
| `demographicsSchema.ts` | validação do formulário de perfil e limites de tamanho do back |
| `demographicsOptions.ts` | as opções de cada campo, iguais às do back |

O rascunho vive no Redux só enquanto a sessão dura: logout e novo login o
apagam, junto com o que se sabia do perfil.

## Premissas desta entrega (CREED-68)

🟡 Decididas sem confirmação, por falta de definição na tarefa. Confirmar na
revisão:

- **"Pular também salva" vale para o fim do onboarding.** Cada etapa tem o seu
  "Pular", que limpa só aquela etapa. O `PUT` acontece uma vez, no fim da
  perspectiva, com o rascunho como estiver. Custo de mudar: baixo.
- **Quem já tem perfil volta para a rota de onde veio**, e não sempre para o
  questionário. Vale para quem aceita o termo de novo em outro navegador (o
  aceite mora no `localStorage`, o perfil mora no back). Custo de mudar: baixo.
- **Erro ao buscar o perfil trava o onboarding**, com botão de tentar de novo.
  Deixar passar sem saber se há perfil arriscaria apagar, no `PUT`, o que a
  pessoa já tinha gravado. Custo de mudar: baixo.
- **Os campos de texto param nos limites do back** (100 caracteres na
  nacionalidade por extenso, 2000 na perspectiva), sem mensagem própria.
  Custo de mudar: baixo.
