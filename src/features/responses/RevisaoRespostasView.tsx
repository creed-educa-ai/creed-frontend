import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Printer } from 'lucide-react';
import CreedSymbol from '@/components/logos/logo';
import wordmark from '@/components/logos/wordmark-dark.svg';
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
  onSubmit: (answers: QuestionAnswer[]) => void;
}

export function RevisaoRespostasView({
  questions,
  onSubmit,
}: RevisaoRespostasViewProps) {
  const { t } = useTranslation(['questionarioRevisao', 'formulario']);
  const [answers, setAnswers] = useState<QuestionAnswer[]>(() =>
    questions.map(({ answer }) => answer),
  );
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [draftAnswer, setDraftAnswer] = useState<QuestionAnswer>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
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
    questions.length > 0 && unansweredRequired.length === 0 && !submitted;

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

  function confirmSubmission() {
    if (!canSubmit || submitLock.current) return;
    submitLock.current = true;
    onSubmit(answers);
    setSubmitted(true);
    setConfirmOpen(false);
  }

  return (
    <main className="min-h-svh overflow-x-hidden bg-background px-3 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-7 flex items-center justify-center gap-3 print:mb-5">
          <CreedSymbol aria-hidden="true" className="h-10 w-8 text-heading" />
          <img src={wordmark} alt="CREED.ai" className="w-28" />
        </header>

        <div className="mb-4 flex items-center gap-3">
          <h1 className="flex min-h-10 flex-1 items-center rounded-lg bg-primary px-4 py-2 text-base font-semibold text-primary-foreground sm:min-h-11 sm:text-lg">
            {t('questionarioRevisao:titulo')}
          </h1>
          <Button
            type="button"
            variant="outline"
            className="no-print h-10 shrink-0 gap-2 px-3 sm:h-11 sm:px-4"
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
        </div>

        <p className="mb-4 text-sm text-muted-foreground">
          {t('questionarioRevisao:descricao')}
        </p>

        {questions.length === 0 ? (
          <p className="rounded-lg border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            {t('questionarioRevisao:semPerguntas')}
          </p>
        ) : (
          <>
            {unansweredRequired.length > 0 && (
              <p
                className="mb-4 rounded-md border border-warning/50 bg-warning/10 px-3 py-2 text-sm text-foreground"
                role="status"
              >
                {t('questionarioRevisao:obrigatoriasPendentes', {
                  count: unansweredRequired.length,
                })}
              </p>
            )}

            <div className="hidden overflow-hidden rounded-lg border bg-card shadow-sm md:block">
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[55%] px-5">
                      {t('questionarioRevisao:pergunta')}
                    </TableHead>
                    <TableHead className="w-[30%]">
                      {t('questionarioRevisao:resposta')}
                    </TableHead>
                    <TableHead className="w-[15%]">
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
                        <TableRow key={question.id}>
                          <TableCell className="px-5">
                            <span className="block break-words">
                              {question.text}
                            </span>
                            {missing && (
                              <span className="mt-1 block text-xs font-medium text-destructive">
                                {t('questionarioRevisao:respostaObrigatoria')}
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
                          className={`min-w-0 rounded-lg border bg-card p-4 shadow-sm ${
                            missing ? 'border-destructive/60' : 'border-border'
                          }`}
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
                            className={`mt-2 text-sm break-words ${missing ? 'text-destructive' : 'text-muted-foreground'}`}
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

            <div className="mt-5 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
              <p aria-live="polite" className="text-sm text-muted-foreground">
                {submitted ? t('questionarioRevisao:enviado') : ''}
              </p>
              <Button
                type="button"
                className="no-print sm:min-w-40"
                disabled={!canSubmit}
                onClick={() => {
                  setConfirmOpen(true);
                }}
              >
                {t('questionarioRevisao:enviar')}
              </Button>
            </div>
          </>
        )}
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
                confirmSubmission();
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
