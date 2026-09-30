import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  RevisaoRespostasView,
  type ReviewQuestion,
} from '@/features/responses/RevisaoRespostasView';
import {
  clearSubmissionError,
  DEMO_FORM_ID,
  submitResponses,
} from '@/features/responses/responsesSlice';

interface RevisaoRouteState {
  questions?: ReviewQuestion[];
}

export function RevisaoRespostasRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const submitError = useAppSelector(
    (state) => state.responses.submission.error,
  );
  const state = location.state as RevisaoRouteState | null;
  const questions = Array.isArray(state?.questions) ? state.questions : [];

  useEffect(() => {
    dispatch(clearSubmissionError());
  }, [dispatch]);

  return (
    <RevisaoRespostasView
      questions={questions}
      submitError={submitError}
      onSubmit={async (answers) => {
        // `answers` segue a ordem de `questions`: o índice liga os dois.
        // `unwrap` rejeita quando o envio falha, e a View libera o botão.
        await dispatch(
          submitResponses({
            formId: DEMO_FORM_ID,
            answers: questions.map((question, index) => ({
              question_id: question.id,
              value: answers[index] ?? null,
            })),
          }),
        ).unwrap();
        // replace: a seta de voltar não reabre a revisão de um questionário
        // já enviado.
        navigate('/questionario/enviado', { replace: true });
      }}
    />
  );
}
