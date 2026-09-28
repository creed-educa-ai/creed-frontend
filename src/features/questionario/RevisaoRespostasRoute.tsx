import { useLocation } from 'react-router-dom';
import {
  RevisaoRespostasView,
  type ReviewQuestion,
} from '@/features/questionario/RevisaoRespostasView';

interface RevisaoRouteState {
  questions?: ReviewQuestion[];
}

export function RevisaoRespostasRoute() {
  const location = useLocation();
  const state = location.state as RevisaoRouteState | null;
  const questions = Array.isArray(state?.questions) ? state.questions : [];

  return (
    <RevisaoRespostasView questions={questions} onSubmit={() => undefined} />
  );
}
