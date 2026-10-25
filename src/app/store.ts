// Store Redux configurado com RTK (ADR-003, secao 2).
import { configureStore } from '@reduxjs/toolkit';
import authenticationReducer from '@/features/authentication/authenticationSlice';
import respondentesReducer from '@/features/respondentes/respondentesSlice';
import respondentesDemograficosReducer from '@/features/respondentes/respondentesDemograficosSlice';
import responsesReducer from '@/features/responses/responsesSlice';
import membrosReducer from '@/features/membros/membrosSlice';

export const store = configureStore({
  reducer: {
    authentication: authenticationReducer,
    respondentes: respondentesReducer,
    respondentesDemograficos: respondentesDemograficosReducer,
    responses: responsesReducer,
    membros: membrosReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
