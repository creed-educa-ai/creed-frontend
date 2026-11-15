# Dados demográficos — CREED-20.4, 20.5 e 20.6

A feature espelha o domínio `demographics` do backend
(`app/domains/demographics/`), pelas rotas `GET` e `PUT /demographics/me`
(`demographicsApi.ts`). O perfil é sempre o de quem está logado.

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

`perspective` (tela 3) também é do `DemographicCreate`. `name` (tela 1) não é: o
nome é do `Participant`, e o back não tem rota para a pessoa alterar o próprio
nome. Por isso a tela 1 ainda não grava nada (o nome do convite continua valendo).

## Estado entre etapas

Durante a edição, todos os campos pertencem ao React Hook Form. `Avançar` valida
com Zod e confirma no slice somente os campos da etapa atual. Nas telas 2 e 3,
`Pular` limpa apenas a respectiva etapa, inclusive seu snapshot anterior. Trocar
a nacionalidade limpa os detalhes da escolha anterior. Login e logout descartam
todo o rascunho; nenhum dado demográfico é salvo em localStorage.

O snapshot no Redux (`demographicsSlice.ts`) é o rascunho do onboarding: começa
do perfil salvo e só vai ao servidor no fim. Ele mantém um ponto de
compartilhamento entre as três etapas sem despachar a cada tecla. A tela 2 usa
somente `saveDemographicsStep`, que atualiza só os campos da etapa 2 e não
sobrescreve `name` nem `perspective`.

`onContinue(data)` e `onSkip()` são os pontos de conexão: as telas não navegam
sozinhas. Quem os preenche é `demographicsFlow.tsx`. As três rotas ficam atrás
do `ProtectedRoute` (ver `src/app/routes.tsx`).

## Integração com o back

- **Ao abrir a etapa 1**, `loadDemographics` traz o perfil já salvo para o
  rascunho, uma vez por sessão. 404 é quem ainda não passou pelo onboarding.
- **No fim da etapa 3** (Avançar ou Pular), `saveDemographics` manda o rascunho
  inteiro no `PUT`. O `PUT` substitui o perfil, por isso o rascunho parte do que
  já estava salvo. Texto vazio vai como nulo.
- **Se o envio falhar**, a pessoa fica na etapa 3, com um toast, e pode tentar de
  novo.

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
