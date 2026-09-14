import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authenticationApi } from '@/features/authentication/authenticationApi';
import { clearSession, getSession, setSession } from '@/lib/session';
import type { LoginRequest, UserSessionResponse } from '@/types/api';

interface AuthenticationState {
  user: UserSessionResponse | null;
  status: 'idle' | 'loading' | 'authenticated' | 'error';
  error: string | null;
}

const savedSession = getSession();

const initialState: AuthenticationState = {
  user: savedSession?.user ?? null,
  status: savedSession ? 'authenticated' : 'idle',
  error: null,
};

export const login = createAsyncThunk(
  'authentication/login',
  async (credentials: LoginRequest) => {
    const session = await authenticationApi.login(credentials);
    setSession(session);
    return session.user;
  },
);

const authenticationSlice = createSlice({
  name: 'authentication',
  initialState,
  reducers: {
    logout(state) {
      clearSession();
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'authenticated';
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message ?? 'Unable to log in.';
      });
  },
});

export const { logout } = authenticationSlice.actions;
export default authenticationSlice.reducer;
