// Store Redux configurado com RTK (ADR-003, secao 2).
import { configureStore } from '@reduxjs/toolkit';
import respondentesReducer from '@/features/respondentes/respondentesSlice';
import respondentesDemograficosReducer from '@/features/respondentes/respondentesDemograficosSlice';

export const store = configureStore({
  reducer: {
    respondentes: respondentesReducer,
    respondentesDemograficos: respondentesDemograficosReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
