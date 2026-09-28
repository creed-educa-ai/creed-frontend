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
              className="h-16 w-full cursor-pointer transition-colors hover:bg-accent sm:h-20 data-checked:hover:bg-primary-hover"
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
              'flex cursor-pointer items-center gap-3 rounded-lg border border-primary px-4 py-3 transition-colors',
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
}: QuestionProps) {
  const { t } = useTranslation(['formulario']);

  return (
    <div className="mx-auto my-auto flex w-full max-w-2xl flex-col items-center justify-center gap-6">
      {/* Seletor de seções */}
      {/* Abas coladas no topo do card: sem espaço entre as duas partes, e sem
          borda embaixo da aba, para ela parecer sair de dentro do card. */}
      <div className="w-full">
        <div className="flex max-w-full gap-1 overflow-x-auto px-4">
          {Array.from({ length: totalSecoes }).map((_, i) => {
            const numero = i + 1;
            return (
              <button
                key={numero}
                type="button"
                aria-current={numero === secao ? 'step' : undefined}
                className={cn(
                  'rounded-t-lg border border-b-0 border-border px-4 py-2 text-sm font-bold whitespace-nowrap',
                  numero < secao && 'bg-accent text-accent-foreground',
                  numero === secao && 'bg-primary text-primary-foreground',
                  numero > secao && 'bg-card text-muted-foreground',
                )}
              >
                {t('formulario:secao')} {numero}
              </button>
            );
          })}
        </div>

        <div className="w-full space-y-6 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
          {/* Textos e barra no mesmo bloco: "Seção" fica no início da barra e
            "Pergunta x de y" no fim, sempre na mesma linha. */}
          <div className="flex flex-col gap-2">
            <header className="flex w-full items-baseline justify-between gap-4">
              <p className="text-2xl font-bold text-heading">
                {t('formulario:secao')} {secao}
              </p>
              <p className="text-xl font-bold text-heading">
                {t('formulario:pergunta')} {perguntaAtual} {t('formulario:de')}{' '}
                {totalPerguntas}
              </p>
            </header>

            <Progress value={progresso} />
          </div>

          <div className="flex flex-col items-start justify-start gap-2 rounded-xl bg-primary p-8 text-primary-foreground">
            <p className="text-xs whitespace-pre-line">{subtitulo}</p>
            <h2 className="text-xl font-bold">{titulo}</h2>
          </div>

          <QuestionAnswerEditor
            tipo={tipo}
            opcoes={respostas}
            valor={valor}
            placeholder={t('formulario:textbox')}
            onMudar={onMudar}
          />

          <footer className="flex w-full items-center justify-between rounded-2xl border border-border bg-background p-2">
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
            <p>{t('formulario:restante')}</p>
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
