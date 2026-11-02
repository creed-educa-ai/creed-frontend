// Store Redux configurado com RTK (ADR-003, secao 2).
// Uma chave por feature, com o nome do domínio do backend.
import { configureStore } from '@reduxjs/toolkit';
import authenticationReducer from '@/features/authentication/authenticationSlice';
import dashboardsReducer from '@/features/dashboards/dashboardsSlice';
import demographicsReducer from '@/features/demographics/demographicsSlice';
import organizationsReducer from '@/features/organizations/organizationsSlice';
import responsesReducer from '@/features/responses/responsesSlice';
import usersReducer from '@/features/users/usersSlice';

export const store = configureStore({
  reducer: {
    authentication: authenticationReducer,
    dashboards: dashboardsReducer,
    demographics: demographicsReducer,
    organizations: organizationsReducer,
    responses: responsesReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
