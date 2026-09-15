# Dados demográficos — CREED-20.4, 20.5 e 20.6

As três telas isoladas do onboarding estão disponíveis nesta branch. A tela 1
coleta o nome obrigatório, a tela 2 coleta respostas demográficas opcionais e a
tela 3 recebe uma resposta aberta opcional. Os valores permitidos da tela 2 e o
tipo do formulário são definidos em `demographicsSchema.ts`; todos os rótulos
ficam nos dois locales. As opções preservam os valores da PR original e ainda
não representam o contrato da API.

## Estado entre etapas

Durante a edição, todos os campos pertencem ao React Hook Form. `Avançar` valida
com Zod e confirma no slice somente os campos da etapa atual. Nas telas 2 e 3,
`Pular` limpa apenas a respectiva etapa, inclusive seu snapshot anterior. Trocar
a nacionalidade limpa os detalhes da escolha anterior. Login e logout descartam
todo o rascunho; nenhum dado demográfico é salvo em localStorage.

O snapshot no Redux é uma adaptação temporária à convenção de formulários: não é
resposta do servidor. Ele mantém um ponto de compartilhamento entre as três
etapas sem despachar a cada tecla. Os setters existentes permanecem exportados
para compatibilidade; a tela 2 usa somente `saveDemographicsStep`.

`onContinue(data)` e `onSkip()` são pontos de conexão para a CREED-20.7. Nas rotas
isoladas, avançar confirma o rascunho e pular o limpa; nenhum deles chama uma API
ou promete que os dados foram persistidos. A montagem das rotas ainda é pública.
A integração deve posicioná-las no fluxo de sessão/consentimento e usar a guarda
compartilhada já existente.

## Estado compartilhado das três telas

O tipo `DemographicsDraft` combina `DemographicsForm` com `nome` e `perspectiva`.
Ao alterar esse estado, preservar:

- as novas rotas e o reducer `authentication` de `dev`;
- os campos `nome` e `perspectiva` e suas actions;
- `saveDemographicsStep`, que atualiza somente os campos da etapa 2;
- os campos adicionais também nos valores iniciais usados ao limpar a sessão;
- as traduções e os testes das três etapas.

Os fixtures de teste devem usar `DemographicsDraft` para não alargar enums a
`string`. A tela 2 recebe apenas `DemographicsForm` em `saveDemographicsStep`,
evitando sobrescrever `nome` ou `perspectiva` ao avançar ou pular.

O endpoint, payload e adaptação ao domínio `Demographic`/`Participant` dependem da
CREED-20.1/20.2/20.3. A pasta atual e os nomes legados foram mantidos para evitar
uma migração de todas as telas dentro de uma correção da tela 2. Na integração,
alinhar o domínio final, centralizar o formulário completo e remover a adaptação
de snapshot se o formulário puder permanecer montado durante todo o fluxo.

## Opções ainda sujeitas à validação do produto

- A referência da task mostra etnia e religião como seleções múltiplas.
- Confirmar a lista completa com o formulário oficial da cliente no Discord.
- As faixas `56_65` e `65_mais` foram preservadas; o limite de 65 anos ainda
  precisa ser esclarecido para não alterar unilateralmente o instrumento.
- Não foi inventada exclusividade entre “Prefiro não responder” e outras
  respostas, nem um limite de caracteres que o contrato ainda não definiu.

## Verificação

Executar `npm run check` e `npm run build` (Node 22, como no CI).
Os testes das Views cobrem o nome obrigatório, tradução, busca pelos rótulos,
seleção/remoção, campos condicionais, limpeza, rascunho e respostas opcionais.
O schema recusa opções inválidas. Os testes do slice verificam o isolamento entre
etapas e a limpeza da sessão.

No navegador, conferir as três rotas em 375, 768 e 1280 px. Na tela 2, testar
opções longas, navegação pelo teclado, busca por “portuguesa” e “Candomblé”,
mudança de nacionalidade e seleção em inglês. Conferir também que `/login`,
`/sobre`, `/boas-vindas` e a guarda de `/respondentes` seguem disponíveis
conforme `dev`.
