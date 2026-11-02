# Dados demográficos — CREED-20.4, 20.5 e 20.6

A feature espelha o domínio `demographics` do backend
(`app/domains/demographics/`). Lá já existem a tabela e os schemas
(`DemographicCreate`, `DemographicResponse`), mas **não há rota** — por isso
esta feature ainda não tem `demographicsApi.ts`, e nada é enviado.

As três telas do onboarding estão encadeadas por `demographicsFlow.tsx`
(etapa 1 → etapa 2 → etapa 3 → `/questionnaire`). A tela 1 coleta o nome
obrigatório, a tela 2 coleta respostas demográficas opcionais e a tela 3 recebe
uma resposta aberta opcional.

## Nomes dos campos = nomes do back

Os campos da tela 2 têm o nome e os valores do `DemographicCreate`:
`gender`, `age_range`, `ethnicities`, `religions`, `nationality`,
`brazil_state`, `portugal_region`, `other_nationality`. As listas de opções
(`demographicsOptions.ts`) são checadas contra os tipos de `src/types/api.ts`
com `satisfies`: valor que o back não aceita não compila.

`name` (tela 1) e `perspective` (tela 3) não são do `DemographicCreate`. O nome é
do `Participant` (`ParticipantCreate.name`); a perspectiva ainda não tem lugar no
back.

## Estado entre etapas

Durante a edição, todos os campos pertencem ao React Hook Form. `Avançar` valida
com Zod e confirma no slice somente os campos da etapa atual. Nas telas 2 e 3,
`Pular` limpa apenas a respectiva etapa, inclusive seu snapshot anterior. Trocar
a nacionalidade limpa os detalhes da escolha anterior. Login e logout descartam
todo o rascunho; nenhum dado demográfico é salvo em localStorage.

O snapshot no Redux (`demographicsSlice.ts`) é uma adaptação temporária à
convenção de formulários: não é resposta do servidor. Ele mantém um ponto de
compartilhamento entre as três etapas sem despachar a cada tecla. A tela 2 usa
somente `saveDemographicsStep`, que atualiza só os campos da etapa 2 e não
sobrescreve `name` nem `perspective`.

`onContinue(data)` e `onSkip()` são os pontos de conexão: as telas não navegam
sozinhas. Quem os preenche é `demographicsFlow.tsx`. As três rotas ficam atrás
do `ProtectedRoute` (ver `src/app/routes.tsx`).

## O que falta para integrar

- Rota no back para gravar o perfil demográfico de um participante.
- Decidir onde mora a `perspective`.
- Com a rota, criar `demographicsApi.ts` e um thunk que envie o rascunho no fim
  da etapa 3 — o corpo já tem a forma do `DemographicCreate`.

## Opções ainda sujeitas à validação do produto

- A referência da task mostra etnia e religião como seleções múltiplas.
- Confirmar a lista completa com o formulário oficial da cliente no Discord.
- As faixas `56_65` e `65_mais` foram preservadas; o limite de 65 anos ainda
  precisa ser esclarecido para não alterar unilateralmente o instrumento.
- Não foi inventada exclusividade entre “Prefiro não responder” e outras
  respostas, nem um limite de caracteres que o contrato ainda não definiu.

## Verificação

Executar `npm run check` e `npm run build` (Node 22, como no CI).
No navegador, conferir as três rotas em 375, 768 e 1280 px — elas exigem
sessão, então entre primeiro e aceite o termo. Na tela 2, testar opções longas,
navegação pelo teclado, busca por “portuguesa” e “Candomblé”, mudança de
nacionalidade e seleção em inglês.
