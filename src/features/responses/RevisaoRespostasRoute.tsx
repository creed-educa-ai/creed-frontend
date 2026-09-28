import { useLocation, useNavigate } from 'react-router-dom';
import {
  RevisaoRespostasView,
  type ReviewQuestion,
} from '@/features/responses/RevisaoRespostasView';

interface RevisaoRouteState {
  questions?: ReviewQuestion[];
}

export function RevisaoRespostasRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as RevisaoRouteState | null;
  const questions = Array.isArray(state?.questions) ? state.questions : [];

  // TODO: enviar as respostas ao backend quando a rota existir. Por enquanto
  // só leva à tela de confirmação. replace: a seta de voltar não reabre a
  // revisão de um questionário já enviado.
  return (
    <RevisaoRespostasView
      questions={questions}
      onSubmit={() => {
        navigate('/questionario/enviado', { replace: true });
      }}
    />
  );
}
