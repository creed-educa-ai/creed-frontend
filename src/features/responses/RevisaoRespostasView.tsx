import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Printer } from 'lucide-react';
import CreedSymbol from '@/components/logos/logo';
import wordmarkEscura from '@/components/logos/wordmark-dark.svg';
import wordmarkClara from '@/components/logos/wordmark-light.svg';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  QuestionAnswerEditor,
  type QuestionType,
} from '@/features/responses/Question';
import { cn } from '@/lib/utils';

export type QuestionAnswer = string | null;

export interface ReviewQuestion {
  id: string;
  // Número da seção do questionário; a revisão agrupa as perguntas por ele.
  section: number;
  text: string;
  type: QuestionType;
  options: string[];
  required: boolean;
  answer: QuestionAnswer;
}

interface RevisaoRespostasViewProps {
  questions: ReviewQuestion[];
  // Pode devolver uma promessa: a tela espera por ela para dizer "enviado".
  // Se ela for rejeitada, o botão volta a funcionar para tentar de novo.
  onSubmit: (answers: QuestionAnswer[]) => void | Promise<void>;
  /** Chave de i18n do erro do último envio, quando houver. */
  submitError?: string | null;
}

export function RevisaoRespostasView({
  questions,
  onSubmit,
  submitError = null,
}: RevisaoRespostasViewProps) {
  const { t } = useTranslation(['questionarioRevisao', 'formulario']);
  const [answers, setAnswers] = useState<QuestionAnswer[]>(() =>
    questions.map(({ answer }) => answer),
  );
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [draftAnswer, setDraftAnswer] = useState<QuestionAnswer>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const submitLock = useRef(false);
  const activeQuestion = questions.find(
    (question) => question.id === activeQuestionId,
  );
  const unansweredRequired = questions.filter(
    (question, index) =>
      question.required && (answers[index] === null || answers[index] === ''),
  );
  const canSubmit =
    questions.length > 0 &&
    unansweredRequired.length === 0 &&
    !sending &&
    !submitted;

  // Agrupa as perguntas por seção, na ordem em que aparecem. Cada item guarda
  // a posição original (`index`): é ela que liga a pergunta à sua resposta em
  // `answers` e que numera o "Revisar pergunta N".
  const secoes: {
    numero: number;
    itens: { question: ReviewQuestion; index: number }[];
  }[] = [];
  questions.forEach((question, index) => {
    let secao = secoes.find(({ numero }) => numero === question.section);
    if (!secao) {
      secao = { numero: question.section, itens: [] };
      secoes.push(secao);
    }
    secao.itens.push({ question, index });
  });

  function answerLabel(question: ReviewQuestion, answer: QuestionAnswer) {
    if (answer === null || answer === '') {
      return t('questionarioRevisao:semResposta');
    }
    if (question.type === 'quantitativa') {
      return t('questionarioRevisao:respostaEscala', { valor: answer });
    }
    return answer;
  }

  function openQuestion(question: ReviewQuestion, index: number) {
    setDraftAnswer(answers[index] ?? null);
    setActiveQuestionId(question.id);
  }

  function saveAnswer() {
    if (!activeQuestion) return;
    const index = questions.findIndex(({ id }) => id === activeQuestion.id);
    setAnswers((current) =>
      current.map((answer, answerIndex) =>
        answerIndex === index ? draftAnswer : answer,
      ),
    );
    setActiveQuestionId(null);
  }

  // A trava (ref, e não state) segura o clique duplo antes de o React
  // redesenhar. Ela só é solta quando o envio falha.
  async function confirmSubmission() {
    if (!canSubmit || submitLock.current) return;
    submitLock.current = true;
    setConfirmOpen(false);
    setSending(true);
    try {
      await onSubmit(answers);
      setSubmitted(true);
    } catch {
      // O motivo chega por `submitError`; aqui só libera nova tentativa.
      submitLock.current = false;
    } finally {
      setSending(false);
    }
  }

  function mensagemDeEnvio() {
    if (submitted) return t('questionarioRevisao:enviado');
    if (sending) return t('questionarioRevisao:enviando');
    return '';
  }

  return (
    <main className="min-h-svh overflow-x-hidden bg-background px-3 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        {/* Mesmo card do onboarding e das perguntas: bloco roxo com o título
            em cima, conteúdo no meio e faixa de ações embaixo. */}
        {/* Entra de baixo com fade, como o formulário do login (authLayout). */}
        <div className="flex w-full animate-in flex-col gap-6 rounded-2xl border border-border bg-card p-5 shadow-sm duration-500 ease-out fade-in slide-in-from-bottom-8 motion-reduce:animate-none sm:p-8">
          {/* Na impressão o navegador tira o fundo roxo: o texto volta a ser
              roxo sobre branco para não sumir no PDF.
              A marca fica aqui dentro, à direita, como num papel timbrado:
              é a tela de entrega do questionário (e o cabeçalho do PDF). */}
          <div className="flex items-center justify-between gap-4 rounded-xl bg-primary p-8 text-primary-foreground print:bg-transparent print:p-0 print:text-heading">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-bold text-balance">
                {t('questionarioRevisao:titulo')}
              </h1>
              <p className="text-balance">
                {t('questionarioRevisao:descricao')}
              </p>
            </div>
            {/* O símbolo usa a cor do texto: branco aqui, roxo no PDF. O nome
                é imagem, então troca de arquivo: clara na tela, escura na
                impressão. No celular, só o símbolo, para caber com o título. */}
            {/* Versão empilhada: símbolo em cima, nome embaixo. Mesma
                proporção das telas "Sobre" e "Obrigado" (símbolo com cerca
                de 3x a altura do nome). */}
            <div className="flex shrink-0 flex-col items-center gap-1.5">
              <CreedSymbol aria-hidden="true" className="size-14" />
              <span className="hidden sm:block print:hidden">
                <img src={wordmarkClara} alt="CREED.ai" className="h-5" />
              </span>
              <span className="hidden print:block">
                <img src={wordmarkEscura} alt="CREED.ai" className="h-5" />
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {questions.length === 0 ? (
              <p className="rounded-lg border border-border px-4 py-8 text-center text-sm text-muted-foreground">
                {t('questionarioRevisao:semPerguntas')}
              </p>
            ) : (
              <>
                {unansweredRequired.length > 0 && (
                  <p
                    className="rounded-md border border-warning/50 bg-warning/10 px-3 py-2 text-sm text-foreground"
                    role="status"
                  >
                    {t('questionarioRevisao:obrigatoriasPendentes', {
                      count: unansweredRequired.length,
                    })}
                  </p>
                )}

                <div className="hidden overflow-hidden rounded-xl border border-border md:block">
                  <Table className="table-fixed">
                    {/* Cabeçalho sem fundo, só texto e a linha de baixo: o fundo
                    colorido fica para as faixas de seção. */}
                    <TableHeader className="bg-card text-base text-heading">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[55%] px-5 text-heading">
                          {t('questionarioRevisao:pergunta')}
                        </TableHead>
                        <TableHead className="w-[30%] text-heading">
                          {t('questionarioRevisao:resposta')}
                        </TableHead>
                        <TableHead className="w-[15%] text-heading">
                          {t('questionarioRevisao:acoes')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    {secoes.map((secao) => (
                      <TableBody key={secao.numero}>
                        <TableRow className="bg-accent hover:bg-accent">
                          <TableHead
                            colSpan={3}
                            scope="colgroup"
                            className="h-auto px-5 py-1.5 text-sm text-accent-foreground"
                          >
                            {t('formulario:secao')} {secao.numero}
                          </TableHead>
                        </TableRow>
                        {secao.itens.map(({ question, index }) => {
                          const missing =
                            question.required &&
                            (answers[index] === null || answers[index] === '');
                          return (
                            // Sem hover: a linha não é clicável, só o "Revisar".
                            <TableRow
                              key={question.id}
                              className="hover:bg-transparent"
                            >
                              <TableCell className="px-5">
                                <span className="block break-words">
                                  {question.text}
                                </span>
                                {missing && (
                                  <span className="mt-1 block text-xs font-medium text-destructive">
                                    {t(
                                      'questionarioRevisao:respostaObrigatoria',
                                    )}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell
                                className={
                                  missing
                                    ? 'text-destructive'
                                    : 'text-muted-foreground'
                                }
                              >
                                {answerLabel(question, answers[index] ?? null)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="no-print h-7 rounded-full px-3 text-xs"
                                  aria-label={t(
                                    'questionarioRevisao:revisarPergunta',
                                    {
                                      numero: index + 1,
                                    },
                                  )}
                                  onClick={() => {
                                    openQuestion(question, index);
                                  }}
                                >
                                  {t('questionarioRevisao:revisar')}
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    ))}
                  </Table>
                </div>

                <div className="grid gap-6 md:hidden">
                  {secoes.map((secao) => (
                    <section key={secao.numero} className="grid gap-3">
                      <h2 className="rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground">
                        {t('formulario:secao')} {secao.numero}
                      </h2>
                      <ul className="grid gap-3">
                        {secao.itens.map(({ question, index }) => {
                          const missing =
                            question.required &&
                            (answers[index] === null || answers[index] === '');
                          return (
                            <li
                              key={question.id}
                              className={cn(
                                'min-w-0 rounded-lg border bg-card p-4',
                                missing
                                  ? 'border-destructive'
                                  : 'border-border',
                              )}
                            >
                              <div className="flex min-w-0 items-start justify-between gap-3">
                                <p className="min-w-0 flex-1 text-sm leading-5 font-medium text-foreground">
                                  {question.text}
                                </p>
                                {missing && (
                                  <span className="shrink-0 text-xs font-medium text-destructive">
                                    {t('questionarioRevisao:obrigatoria')}
                                  </span>
                                )}
                              </div>
                              <p
                                className={cn(
                                  'mt-2 text-sm break-words',
                                  missing
                                    ? 'text-destructive'
                                    : 'text-muted-foreground',
                                )}
                              >
                                {answerLabel(question, answers[index] ?? null)}
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="no-print mt-3 h-8"
                                aria-label={t(
                                  'questionarioRevisao:revisarPergunta',
                                  {
                                    numero: index + 1,
                                  },
                                )}
                                onClick={() => {
                                  openQuestion(question, index);
                                }}
                              >
                                {t('questionarioRevisao:revisar')}
                              </Button>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  ))}
                </div>
              </>
            )}

            {/* Faixa de ações, como a do questionário: PDF no lugar do
              "Voltar" e envio no lugar do "Avançar". */}
            <div className="no-print flex w-full flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-background p-2">
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                aria-label={t('questionarioRevisao:gerarPdf')}
                onClick={() => {
                  window.print();
                }}
              >
                <Printer aria-hidden="true" />
                <span className="hidden sm:inline">
                  {t('questionarioRevisao:gerarPdf')}
                </span>
                <span className="sm:hidden">PDF</span>
              </Button>
              {submitError && !sending ? (
                <p role="alert" className="text-sm text-destructive">
                  {/* Chave de i18n vinda do slice; mesma saída do LoginView. */}
                  {t(submitError as never)}
                </p>
              ) : (
                <p aria-live="polite" className="text-sm text-muted-foreground">
                  {mensagemDeEnvio()}
                </p>
              )}
              {questions.length > 0 && (
                <Button
                  type="button"
                  className="font-bold"
                  disabled={!canSubmit}
                  onClick={() => {
                    setConfirmOpen(true);
                  }}
                >
                  {t('questionarioRevisao:enviar')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={activeQuestionId !== null}
        onOpenChange={(open) => {
          if (!open) setActiveQuestionId(null);
        }}
      >
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
          {activeQuestion && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {t('questionarioRevisao:modalTitulo', {
                    numero:
                      questions.findIndex(
                        ({ id }) => id === activeQuestion.id,
                      ) + 1,
                  })}
                </DialogTitle>
                <DialogDescription>{activeQuestion.text}</DialogDescription>
              </DialogHeader>
              <QuestionAnswerEditor
                tipo={activeQuestion.type}
                opcoes={activeQuestion.options}
                valor={draftAnswer ?? ''}
                placeholder={t('formulario:textbox')}
                onMudar={setDraftAnswer}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setActiveQuestionId(null);
                  }}
                >
                  {t('questionarioRevisao:cancelar')}
                </Button>
                <Button type="button" onClick={saveAnswer}>
                  {t('questionarioRevisao:salvarResposta')}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('questionarioRevisao:confirmarEnvioTitulo')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('questionarioRevisao:confirmarEnvioDescricao')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('questionarioRevisao:cancelar')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void confirmSubmission();
              }}
            >
              {t('questionarioRevisao:confirmarEnvio')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
