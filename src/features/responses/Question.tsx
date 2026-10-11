import { Check, CircleAlert, CircleCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export type QuestionType = 'objetiva' | 'dissertativa' | 'quantitativa';

interface QuestionAnswerEditorProps {
  tipo: QuestionType;
  opcoes: string[];
  valor: string;
  placeholder: string;
  onMudar: (value: string) => void;
}

export function QuestionAnswerEditor({
  tipo,
  opcoes,
  valor,
  placeholder,
  onMudar,
}: QuestionAnswerEditorProps) {
  const { t } = useTranslation(['formulario']);

  if (tipo === 'dissertativa') {
    // O Textarea do projeto cresce com o texto (field-sizing-content).
    // A altura mínima é a mesma dos botões da escala de 1 a 5.
    return (
      <Textarea
        value={valor}
        onChange={(event) => {
          onMudar(event.currentTarget.value);
        }}
        placeholder={placeholder}
        className="min-h-16 p-4 text-primary sm:min-h-20"
      />
    );
  }

  if (tipo === 'quantitativa') {
    // Grade de 5 colunas na largura toda do card: a escala é o principal da
    // tela, então os botões esticam em vez de ficarem num grupo pequeno no
    // meio. A legenda usa a mesma largura, então "Discordo" cai embaixo do 1
    // e "Concordo" embaixo do 5.
    return (
      <div className="flex w-full flex-col gap-2">
        <RadioGroup
          value={valor}
          onValueChange={onMudar}
          className="grid w-full grid-cols-5 gap-2 sm:gap-3"
        >
          {opcoes.map((opcao, index) => (
            <RadioGroupItem
              key={`op${String(index)}`}
              variant="caixa"
              value={opcao}
              id={`op${String(index)}`}
              // `transition` (e não só -colors) para o afundar ao clicar
              // (active:scale) também ser suave.
              className="h-16 w-full cursor-pointer transition hover:bg-accent motion-safe:active:scale-95 sm:h-20 data-checked:hover:bg-primary-hover"
            >
              <span className="text-xl font-bold">{opcao}</span>
            </RadioGroupItem>
          ))}
        </RadioGroup>
        <div className="flex justify-between gap-4 text-sm text-muted-foreground">
          <span>{t('formulario:escalaMinima')}</span>
          <span>{t('formulario:escalaMaxima')}</span>
        </div>
      </div>
    );
  }

  return (
    <RadioGroup value={valor} onValueChange={onMudar}>
      {opcoes.map((opcao, index) => {
        // Selecionada fica roxa com texto branco, como na escala de 1 a 5.
        const selecionada = valor === opcao;
        return (
          <div
            key={`op${String(index)}`}
            className={cn(
              // Afunda menos que a escala (98% e não 95%): numa opção larga,
              // 5% já seria um encolhimento bem visível.
              'flex cursor-pointer items-center gap-3 rounded-lg border border-primary px-4 py-3 transition motion-safe:active:scale-98',
              selecionada
                ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
                : 'text-primary hover:bg-accent',
            )}
          >
            {/* Borda branca na bolinha marcada: sem ela, roxo sobre roxo
                some e só o ponto branco do meio aparece. */}
            <RadioGroupItem
              value={opcao}
              id={`op${String(index)}`}
              className={cn(selecionada && 'border-primary-foreground')}
            />
            <label
              htmlFor={`op${String(index)}`}
              className="flex-1 cursor-pointer"
            >
              {opcao}
            </label>
          </div>
        );
      })}
    </RadioGroup>
  );
}

interface SectionTabsProps {
  totalSecoes: number;
  // Seção aberta agora. Na tela de concluído é `totalSecoes + 1`: nenhuma.
  secaoAtual: number;
  // A seção mais adiante a que a pessoa já chegou: ela e as anteriores podem
  // ser clicadas; as depois dela ainda não foram vistas e ficam bloqueadas.
  // Na tela de concluído é `totalSecoes + 1`: todas liberadas.
  secaoMaisAvancada: number;
  // Seções com todas as perguntas respondidas: só elas ganham o check.
  secoesConcluidas: number[];
  onSelecionar: (secao: number) => void;
}

// Abas coladas no topo do card: sem espaço entre as duas partes, e sem borda
// embaixo da aba, para ela parecer sair de dentro do card.
function SectionTabs({
  totalSecoes,
  secaoAtual,
  secaoMaisAvancada,
  secoesConcluidas,
  onSelecionar,
}: SectionTabsProps) {
  const { t } = useTranslation(['formulario']);

  return (
    // pt-2: espaço para o selo de concluída, que fica por cima da borda de
    // cima da aba. Sem ele o overflow-x-auto cortaria o selo.
    <div className="flex max-w-full gap-1 overflow-x-auto px-4 pt-2">
      {Array.from({ length: totalSecoes }).map((_, i) => {
        const numero = i + 1;
        const atual = numero === secaoAtual;
        // Concluída continua concluída mesmo sendo a aba aberta agora.
        const feita = secoesConcluidas.includes(numero);
        const liberada = numero <= secaoMaisAvancada;
        return (
          <button
            key={numero}
            type="button"
            aria-current={atual ? 'step' : undefined}
            disabled={!liberada}
            onClick={() => {
              onSelecionar(numero);
            }}
            className={cn(
              'relative rounded-t-lg border border-b-0 border-border px-4 py-2 text-sm font-bold whitespace-nowrap',
              atual && 'bg-primary text-primary-foreground',
              // Já visitada mas não é a atual: lavanda, com check se foi
              // concluída.
              !atual && liberada && 'bg-accent text-accent-foreground',
              !liberada && 'bg-card text-muted-foreground',
              liberada && !atual && 'cursor-pointer hover:bg-border',
            )}
          >
            {/* Selo no canto, fora do fluxo do texto: a aba não muda de
                largura ao ser concluída. O anel da cor do card separa o selo
                do fundo, inclusive na aba roxa da seção atual. */}
            {feita && (
              <span
                aria-hidden="true"
                className="absolute -top-2 -right-2 flex size-4.5 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-card"
              >
                <Check className="size-3" strokeWidth={3} />
              </span>
            )}
            {t('formulario:secao')} {numero}
          </button>
        );
      })}
    </div>
  );
}

export type Direcao = 'avancar' | 'voltar';

interface QuestionProps {
  secao: number;
  totalSecoes: number;
  perguntaAtual: number;
  totalPerguntas: number;
  progresso: number;
  titulo: string;
  subtitulo: string;
  tipo: QuestionType;
  respostas?: string[];
  valor?: string;
  onMudar: (valor: string) => void;
  onProximo: () => void;
  onVoltar: () => void;
  direcao: Direcao;
  secaoMaisAvancada: number;
  secoesConcluidas: number[];
  onIrParaSecao: (secao: number) => void;
  avisoSecaoIncompleta: boolean;
}

export function Questions({
  secao,
  totalSecoes,
  perguntaAtual,
  totalPerguntas,
  progresso,
  titulo,
  subtitulo,
  tipo,
  respostas = [],
  valor = '',
  onMudar,
  onProximo,
  onVoltar,
  direcao,
  secaoMaisAvancada,
  secoesConcluidas,
  onIrParaSecao,
  avisoSecaoIncompleta,
}: QuestionProps) {
  const { t } = useTranslation(['formulario']);

  // Entrada da pergunta nova: avançar vem da direita, voltar da esquerda.
  // Curta de propósito, porque se repete a cada pergunta. Começa em 50% de
  // opacidade, não em 0: o bloco roxo sumindo inteiro parecia piscar. O
  // deslocamento (1rem) cabe no padding do card.
  const animacaoDeEntrada = cn(
    'animate-in duration-300 ease-out fade-in-50 motion-reduce:animate-none',
    direcao === 'avancar' ? 'slide-in-from-right-4' : 'slide-in-from-left-4',
  );

  return (
    <div className="mx-auto my-auto flex w-full max-w-2xl flex-col items-center justify-center gap-6">
      <div className="w-full">
        <SectionTabs
          totalSecoes={totalSecoes}
          secaoAtual={secao}
          secaoMaisAvancada={secaoMaisAvancada}
          secoesConcluidas={secoesConcluidas}
          onSelecionar={onIrParaSecao}
        />

        <div className="w-full space-y-6 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
          {/* Textos e barra no mesmo bloco, sempre na mesma linha: a pergunta
              (o que a pessoa está fazendo agora) em destaque no início, e a
              seção com a porcentagem da barra no fim. */}
          <div className="flex flex-col gap-2">
            <header className="flex w-full items-baseline justify-between gap-4">
              <p className="text-2xl font-bold text-heading">
                {t('formulario:pergunta')} {perguntaAtual} {t('formulario:de')}{' '}
                {totalPerguntas}
              </p>
              {/* A porcentagem é o que muda: ela em destaque, a seção de apoio
                  (a aba já mostra qual é). */}
              <div className="flex items-baseline gap-2">
                <p className="text-sm font-bold text-muted-foreground">
                  {t('formulario:secao')} {secao}
                </p>
                <span className="text-2xl font-bold text-heading">
                  {Math.round(progresso)}%
                </span>
              </div>
            </header>

            <Progress value={progresso} />
          </div>

          {/* Bloco roxo: anima a cada pergunta. O `key` muda a cada pergunta,
              o React recria o bloco e a animação de entrada roda de novo. */}
          <div
            key={`${String(secao)}-${String(perguntaAtual)}`}
            data-direcao={direcao}
            className={cn(
              animacaoDeEntrada,
              'flex flex-col items-start justify-start gap-2 rounded-xl bg-primary p-8 text-primary-foreground',
            )}
          >
            <p className="text-xs whitespace-pre-line">{subtitulo}</p>
            <h2 className="text-xl font-bold">{titulo}</h2>
          </div>

          {/* Respostas: só animam quando as opções mudam (outro tipo de
              pergunta, ou alternativas diferentes). Entre duas perguntas de
              1 a 5 o `key` é o mesmo, os botões ficam parados e só a seleção
              some. */}
          <div
            key={`${tipo}-${respostas.join('|')}`}
            className={animacaoDeEntrada}
          >
            <QuestionAnswerEditor
              tipo={tipo}
              opcoes={respostas}
              valor={valor}
              placeholder={t('formulario:textbox')}
              onMudar={onMudar}
            />
          </div>

          <footer className="flex w-full items-center justify-between gap-2 rounded-2xl border border-border bg-background p-2">
            <Button
              variant="outline"
              className="text-brand"
              onClick={() => {
                onVoltar();
              }}
              disabled={perguntaAtual === 1 && secao === 1}
            >
              {t('formulario:voltar')}
            </Button>
            {/* Meio da faixa: o aviso de seção incompleta, quando houver.
                Vazio, o flex-1 mantém os botões nas pontas. */}
            <div className="flex flex-1 justify-center">
              {avisoSecaoIncompleta && (
                <p
                  role="status"
                  className="flex animate-in items-center gap-1.5 text-center text-xs text-destructive duration-300 fade-in motion-reduce:animate-none sm:text-sm"
                >
                  <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
                  {t('formulario:responderTudoAviso')}
                </p>
              )}
            </div>
            <Button
              className="font-bold"
              onClick={() => {
                onProximo();
              }}
            >
              {t('formulario:avancar')}
            </Button>
          </footer>
        </div>
      </div>
    </div>
  );
}

interface QuestionsCompletedProps {
  totalSecoes: number;
  totalPerguntas: number;
  // Quantas têm resposta: quem pulou alguma não pode ver "todas respondidas".
  respondidas: number;
  onRevisar: () => void;
  onIrParaSecao: (secao: number) => void;
  secoesConcluidas: number[];
}

// Fim das perguntas, antes de revisar e enviar. Mesmo card das perguntas,
// mas com tudo concluído — todas as abas feitas e a barra cheia — para a
// pessoa ler "terminei" no que já aprendeu a ler. O envio ainda não
// aconteceu: a comemoração fica para a tela "Obrigado por responder".
export function QuestionsCompleted({
  totalSecoes,
  totalPerguntas,
  respondidas,
  onRevisar,
  onIrParaSecao,
  secoesConcluidas,
}: QuestionsCompletedProps) {
  const { t } = useTranslation(['formulario']);
  const todasRespondidas = respondidas === totalPerguntas;

  return (
    <div className="mx-auto my-auto flex w-full max-w-2xl flex-col items-center justify-center gap-6">
      <div className="w-full">
        <SectionTabs
          totalSecoes={totalSecoes}
          secaoAtual={totalSecoes + 1}
          secaoMaisAvancada={totalSecoes + 1}
          secoesConcluidas={secoesConcluidas}
          onSelecionar={onIrParaSecao}
        />

        <div className="w-full space-y-6 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
          <div className="flex flex-col gap-2">
            <header className="flex w-full items-baseline justify-between gap-4">
              <p className="text-2xl font-bold text-heading">
                {t('formulario:concluido')}
              </p>
              <p className="text-xl font-bold text-heading">
                {t('formulario:perguntasRespondidas', {
                  respondidas,
                  total: totalPerguntas,
                })}
              </p>
            </header>

            <Progress value={(respondidas / totalPerguntas) * 100} />
          </div>

          {/* Comemoração em dois tempos: o bloco cresce e, logo depois, o
              check "estala" girando e passando um pouco do tamanho final (a
              curva com 1.56 é o que dá esse repique). fill-mode-backwards
              esconde o check durante o atraso. Só aparece uma vez, então
              pode ser mais longa que a troca de pergunta. */}
          <div className="flex animate-in flex-col items-center justify-center gap-2 rounded-xl bg-primary p-8 text-center text-primary-foreground duration-500 ease-out fade-in-0 zoom-in-75 motion-reduce:animate-none">
            <CircleCheck
              aria-hidden="true"
              className="size-12 animate-in delay-300 duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] fill-mode-backwards zoom-in-0 spin-in-90 motion-reduce:animate-none"
            />
            <h2 className="text-xl font-bold text-balance">
              {todasRespondidas
                ? t('formulario:concluidoTitulo')
                : t('formulario:fimDasPerguntasTitulo')}
            </h2>
            <p className="text-balance">{t('formulario:concluidoMensagem')}</p>
          </div>

          {/* Botão no mesmo lugar do "Avançar": quem acabou de clicar nele
              na última pergunta já está com o cursor (ou o dedo) ali. */}
          <div className="flex w-full items-center justify-end rounded-2xl border border-border bg-background p-2">
            <Button type="button" className="font-bold" onClick={onRevisar}>
              {t('formulario:revisarEEnviar')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
