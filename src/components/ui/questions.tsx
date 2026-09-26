import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState } from 'react';

interface QuestionProps {
  perguntaAtual: number;
  totalPerguntas: number;
  progresso: number;
  titulo: string;
  subtitulo: string;
  tipo: 'objetiva' | 'dissertativa' | 'quantitativa';
  respostas?: string[];
  onProximo: () => void;
  onVoltar: () => void;
}

export function Questions({
  perguntaAtual,
  totalPerguntas,
  progresso,
  titulo,
  subtitulo,
  tipo,
  respostas = [],
  onProximo,
  onVoltar,
}: QuestionProps) {
  const [texto, setTexto] = useState('');
  return (
    <div className="mx-auto my-auto flex w-full max-w-xl flex-col items-center justify-center gap-6 py-6">
      <div className="w-full space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <header className="flex w-full flex-col items-center justify-center gap-4 px-6 py-1 sm:flex-row sm:items-start sm:justify-between">
          <p className="text-2xl font-bold text-heading">Seção 1</p>
          <p className="text-xl font-bold text-heading">
            Pergunta {perguntaAtual} de {totalPerguntas}
          </p>
        </header>
        <Progress value={progresso} />
        <div className="bg-brand flex flex-col items-start justify-start gap-4 rounded-xl p-8 text-primary-foreground">
          <h2 className="text-xl font-bold">{titulo}</h2>
          <p>{subtitulo}</p>
        </div>
        {/* perguntas objetivas */}
        {tipo === 'objetiva' && (
          <RadioGroup>
            {respostas.map((resposta, index) => (
              <div
                key={`op${String(index)}`}
                className="flex cursor-pointer items-center space-x-2 rounded-lg border border-primary px-4 py-3 hover:bg-primary/5"
              >
                <RadioGroupItem value={resposta} id={`op${String(index)}`} />
                <label
                  htmlFor={`op${String(index)}`}
                  className="flex-1 cursor-pointer text-primary"
                >
                  {resposta}
                </label>
              </div>
            ))}
          </RadioGroup>
        )}
        {/* perguntas dissertativas */}
        {tipo === 'dissertativa' && (
          <textarea
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
            }}
            placeholder="Digite sua resposta aqui..."
            className="w-full rounded-lg border border-primary p-4 text-primary focus:ring-2 focus:ring-primary focus:outline-none"
            rows={6}
          />
        )}
        {/* perguntas quantitativas */}
        {tipo === 'quantitativa' && (
          <RadioGroup className="flex justify-center gap-2">
            {respostas.map((resposta, index) => (
              <div
                key={`op${String(index)}`}
                className="flex cursor-pointer items-center space-x-2 rounded-lg border border-primary px-4 py-3 hover:bg-primary/5"
              >
                <RadioGroupItem
                  variant="caixa"
                  value={resposta}
                  id={`op${String(index)}`}
                />
                <label
                  htmlFor={`op${String(index)}`}
                  className="flex-1 cursor-pointer text-primary"
                >
                  {resposta}
                </label>
              </div>
            ))}
          </RadioGroup>
        )}
        <footer className="flex w-full items-center justify-between rounded-2xl border border-border bg-background p-2">
          <Button
            variant={'outline'}
            className="text-brand"
            onClick={() => {
              onVoltar();
            }}
          >
            Voltar
          </Button>
          <p>~tempo restante</p>
          <Button
            className="bg-brand font-bold text-primary-foreground"
            onClick={() => {
              onProximo();
            }}
          >
            Avançar
          </Button>
        </footer>
      </div>
    </div>
  );
}
