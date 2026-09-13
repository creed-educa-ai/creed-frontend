// Store Redux configurado com RTK (ADR-003, secao 2).
import { configureStore } from '@reduxjs/toolkit';
import respondentesReducer from '@/features/respondentes/respondentesSlice';
import authReducer from '@/features/login/loginSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    respondentes: respondentesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
