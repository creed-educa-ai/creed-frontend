import { Button } from '@/components/ui/button';

interface QuestionProps {
  perguntaAtual: number;
  totalPerguntas: number;
  progresso: number;
  titulo: string;
  subtitulo: string;
  conteudo: React.ReactNode;
  onProximo: () => void;
}

export function Questions({
  perguntaAtual,
  totalPerguntas,
  progresso,
  titulo,
  subtitulo,
  conteudo,
  onProximo,
}: QuestionProps) {
  return (
    <div className="mx-auto my-auto flex w-full max-w-xl flex-col items-center justify-center gap-6 py-6">
      <div className="w-full rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="text-center">
          <p>
            Pergunta {perguntaAtual} de {totalPerguntas}
          </p>
        </div>

        <progress value={progresso} />

        <div className="bg-brand flex flex-col items-start justify-start gap-4 rounded-xl p-8 text-primary-foreground">
          <h2 className="text-xl font-bold">{titulo}</h2>
          <p>{subtitulo}</p>
        </div>

        <div className="p-4 pt-6">{conteudo}</div>

        <div className="flex w-full items-center justify-end rounded-2xl border border-border bg-background p-2">
          <Button
            className="bg-brand text-primary-foreground"
            onClick={() => {
              onProximo();
            }}
          >
            próximo
          </Button>
        </div>
      </div>
    </div>
  );
}
