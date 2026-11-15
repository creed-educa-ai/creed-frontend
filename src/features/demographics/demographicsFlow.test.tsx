import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { Toaster } from '@/components/ui/sonner';
import { demographicsApi } from '@/features/demographics/demographicsApi';
import demographicsReducer from '@/features/demographics/demographicsSlice';
import { ApiError } from '@/lib/apiClient';
import type { DemographicResponse } from '@/types/api';
import {
  DemographicsStep1Route,
  DemographicsStep2Route,
  DemographicsStep3Route,
} from '@/features/demographics/demographicsFlow';

// O perfil já salvo de quem refaz o onboarding.
const salvo: DemographicResponse = {
  id: 'perfil-1',
  participant_id: 'participante-1',
  gender: 'feminino',
  age_range: '26_35',
  ethnicities: [],
  religions: [],
  nationality: 'brasileira',
  brazil_state: 'RS',
  portugal_region: null,
  other_nationality: null,
  perspective: 'Muito',
  created_at: '2026-11-01T12:00:00Z',
  updated_at: null,
};

// O que cada tela valida já está nos testes delas; aqui a ordem do fluxo e o
// que ele lê e grava no back.
function renderizarNa(rota: string) {
  const store = configureStore({
    reducer: { demographics: demographicsReducer },
  });
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[rota]}>
        <Routes>
          <Route
            path="/demographics/step-1"
            element={<DemographicsStep1Route />}
          />
          <Route
            path="/demographics/step-2"
            element={<DemographicsStep2Route />}
          />
          <Route
            path="/demographics/step-3"
            element={<DemographicsStep3Route />}
          />
          <Route path="/questionnaire" element={<p>onboarding</p>} />
        </Routes>
      </MemoryRouter>
      <Toaster />
    </Provider>,
  );
}

describe('fluxo dos dados demográficos', () => {
  beforeEach(async () => {
    // Por padrão, quem ainda não passou pelo onboarding.
    vi.spyOn(demographicsApi, 'getMine').mockRejectedValue(
      new ApiError('Perfil demográfico não encontrado', 404),
    );
    vi.spyOn(demographicsApi, 'saveMine').mockResolvedValue(salvo);
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('percorre as três etapas até o onboarding do questionário', async () => {
    const user = userEvent.setup();
    renderizarNa('/demographics/step-1');

    await user.type(screen.getByRole('textbox', { name: 'Nome' }), 'Ana');
    await user.click(screen.getByRole('button', { name: 'Avançar' }));

    // Etapa 2 e 3 são opcionais: pular também avança.
    await user.click(await screen.findByRole('button', { name: 'Pular' }));
    await user.click(await screen.findByRole('button', { name: 'Pular' }));

    expect(await screen.findByText('onboarding')).toBeInTheDocument();
    // Pular tudo também grava: o perfil vazio registra que o onboarding passou.
    expect(demographicsApi.saveMine).toHaveBeenCalledWith({
      gender: null,
      age_range: null,
      ethnicities: [],
      religions: [],
      nationality: null,
      brazil_state: null,
      portugal_region: null,
      other_nationality: null,
      perspective: null,
    });
  });

  it('começa do perfil salvo e grava a resposta da etapa 3 junto', async () => {
    vi.spyOn(demographicsApi, 'getMine').mockResolvedValue(salvo);
    const user = userEvent.setup();
    renderizarNa('/demographics/step-1');

    await user.type(screen.getByRole('textbox', { name: 'Nome' }), 'Ana');
    await user.click(screen.getByRole('button', { name: 'Avançar' }));
    await user.click(await screen.findByRole('button', { name: 'Avançar' }));
    const resposta = await screen.findByRole('textbox');
    expect(resposta).toHaveValue('Muito');
    await user.clear(resposta);
    await user.type(resposta, 'Pouco');
    await user.click(screen.getByRole('button', { name: 'Avançar' }));

    expect(await screen.findByText('onboarding')).toBeInTheDocument();
    expect(demographicsApi.saveMine).toHaveBeenCalledWith(
      expect.objectContaining({
        gender: 'feminino',
        nationality: 'brasileira',
        brazil_state: 'RS',
        perspective: 'Pouco',
      }),
    );
  });

  it('se o envio falhar, fica na etapa 3 e avisa', async () => {
    vi.spyOn(demographicsApi, 'saveMine').mockRejectedValue(
      new ApiError('Falha técnica', 503),
    );
    const user = userEvent.setup();
    renderizarNa('/demographics/step-3');

    await user.click(screen.getByRole('button', { name: 'Avançar' }));

    expect(
      await screen.findByText('Não foi possível salvar seus dados'),
    ).toBeInTheDocument();
    expect(screen.queryByText('onboarding')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Avançar' })).toBeEnabled();
  });

  it('avançar na etapa 2 leva à etapa 3', async () => {
    const user = userEvent.setup();
    const { container } = renderizarNa('/demographics/step-2');
    const tituloEtapa2 = container.querySelector('h1')?.textContent;

    await user.click(screen.getByRole('button', { name: 'Avançar' }));

    const tituloEtapa3 = await screen.findByRole('heading', { level: 1 });
    expect(tituloEtapa3.textContent).not.toBe(tituloEtapa2);
  });
});
