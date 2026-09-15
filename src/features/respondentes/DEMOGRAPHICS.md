# Dados demográficos — CREED-20.5

A tela 2 coleta respostas opcionais. Os valores permitidos e o tipo do formulário
são definidos em `demographicsSchema.ts`; os rótulos ficam nos dois locales.
As opções preservam os valores da PR original. Não são ainda o contrato da API.

## Estado entre etapas

Durante a edição, todos os campos pertencem ao React Hook Form. `Avançar` valida
com Zod, normaliza os campos condicionais e confirma um snapshot da etapa no slice.
`Pular` limpa apenas os campos da etapa 2, inclusive seu snapshot anterior.
Trocar a nacionalidade limpa os detalhes da escolha anterior. Login e logout
descartam o rascunho; nenhum dado demográfico é salvo em localStorage.

O snapshot no Redux é uma adaptação temporária à convenção de formulários: não é
resposta do servidor. Ele mantém o mesmo ponto de compartilhamento das branches
CREED-20.4 e 20.6, sem despachar a cada tecla. Os setters existentes permanecem
exportados para compatibilidade; a tela 2 usa somente `saveDemographicsStep`.

`onContinue(data)` e `onSkip()` são pontos de conexão para a CREED-20.7. Na rota
isolada, avançar confirma o rascunho e pular o limpa; nenhum deles chama uma API
ou promete que os dados foram persistidos. A montagem da rota ainda é pública,
como as outras telas isoladas de onboarding. A integração deve posicioná-la
no fluxo de sessão/consentimento e usar a guarda compartilhada já existente.

## Integração das branches das telas 1 e 3

As duas branches derivam da versão original desta PR. Primeiro atualizar esta PR
com `dev`; depois incorporar a base corrigida às duas branches, preservando:

- as novas rotas e o reducer `authentication` de `dev`;
- os campos `nome` e `perspectiva` e suas actions nas respectivas entregas;
- `saveDemographicsStep`, que atualiza somente os campos da etapa 2;
- os campos adicionais também nos valores iniciais usados ao limpar a sessão;
- as traduções e os testes das três etapas.

Ao ampliar o slice, usar `DemographicsForm & { nome: string; perspectiva: string }`
ou composição equivalente e incluir os valores iniciais das outras etapas.
Tipar os fixtures de teste para não alargar enums a `string`.
Não restaurar a View antiga ao resolver conflitos: ela contém os bugs corrigidos.

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
Os testes da View cobrem busca pelos rótulos, troca de idioma, seleção/remoção,
campos condicionais, limpeza, rascunho e respostas vazias. O schema recusa opções
inválidas. Os testes do slice verificam isolamento entre etapas e limpeza da sessão.

No navegador, conferir `/demograficos-2` em 375, 768 e 1280 px, opções longas,
navegação pelo teclado, busca por “portuguesa” e “Candomblé”, mudança de
nacionalidade e seleção em inglês. Conferir também que `/login`, `/sobre`,
`/boas-vindas` e a guarda de `/respondentes` seguem disponíveis conforme `dev`.
