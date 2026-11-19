import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import { demographicsApi } from '@/features/demographics/demographicsApi';
import demographicsReducer from '@/features/demographics/demographicsSlice';
import {
  DemographicsStep2Route,
  DemographicsStep3Route,
} from '@/features/demographics/demographicsFlow';
import { ApiError } from '@/lib/apiClient';
import type { DemographicResponse } from '@/types/api';

const perfilGravado: DemographicResponse = {
  id: '5d8e2a1b-7c4f-4e9a-8b3d-6f1c0e2a9b47',
  participant_id: '7f9c2b1e-4a3d-4c8e-9b6f-2d1e0a5c8b73',
  gender: 'feminino',
  age_range: '26_35',
  ethnicities: ['europeia'],
  religions: [],
  nationality: 'brasileira',
  brazil_state: 'RS',
  portugal_region: null,
  other_nationality: null,
  perspective: 'Meus pais tinham um pequeno comércio.',
  created_at: '2026-10-18T14:30:00Z',
  updated_at: null,
};

// O que cada tela valida já está nos testes delas; aqui é o fluxo: a ordem
// das etapas, quando o back é chamado e para onde a pessoa vai.
function semPerfilNoBack() {
  return vi
    .spyOn(demographicsApi, 'getMyDemographics')
    .mockRejectedValue(new ApiError('Perfil não encontrado', 404));
}

function comPerfilNoBack() {
  return vi
    .spyOn(demographicsApi, 'getMyDemographics')
    .mockResolvedValue(perfilGravado);
}

function salvarFunciona() {
  return vi
    .spyOn(demographicsApi, 'saveMyDemographics')
    .mockResolvedValue(perfilGravado);
}

function renderizarNa(rota: string, state?: unknown) {
  const store = configureStore({
    reducer: { demographics: demographicsReducer },
  });
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[{ pathname: rota, state }]}>
        <Routes>
          <Route
            path="/demographics/step-2"
            element={<DemographicsStep2Route />}
          />
          <Route
            path="/demographics/step-3"
            element={<DemographicsStep3Route />}
          />
          <Route path="/questionnaire" element={<p>questionário</p>} />
          <Route path="/dashboard" element={<p>dashboard</p>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

function campoPerspectiva() {
  return screen.findByLabelText(/educação familiar/i);
}

describe('fluxo dos dados demográficos', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('primeiro acesso (sem perfil no back)', () => {
    it('começa no perfil, sem pedir o nome', async () => {
      semPerfilNoBack();
      renderizarNa('/demographics/step-2');

      expect(
        await screen.findByRole('combobox', { name: /Gênero/ }),
      ).toBeInTheDocument();
      expect(screen.queryByRole('textbox', { name: 'Nome' })).toBeNull();
    });

    it('avançar no perfil leva à perspectiva', async () => {
      semPerfilNoBack();
      const user = userEvent.setup();
      renderizarNa('/demographics/step-2');

      await user.click(await screen.findByRole('button', { name: 'Avançar' }));

      expect(await campoPerspectiva()).toBeInTheDocument();
    });

    it('preencher e avançar grava no back e leva ao questionário', async () => {
      semPerfilNoBack();
      const salvar = salvarFunciona();
      const user = userEvent.setup();
      renderizarNa('/demographics/step-2');

      await user.click(await screen.findByRole('button', { name: 'Avançar' }));
      await user.type(await campoPerspectiva(), 'Minha família empreendia.');
      await user.click(screen.getByRole('button', { name: 'Avançar' }));

      expect(await screen.findByText('questionário')).toBeInTheDocument();
      expect(salvar).toHaveBeenCalledTimes(1);
      expect(salvar).toHaveBeenCalledWith(
        expect.objectContaining({ perspective: 'Minha família empreendia.' }),
      );
    });

    it('pular as duas etapas também grava, com os campos vazios', async () => {
      semPerfilNoBack();
      const salvar = salvarFunciona();
      const user = userEvent.setup();
      renderizarNa('/demographics/step-2');

      await user.click(await screen.findByRole('button', { name: 'Pular' }));
      await campoPerspectiva();
      await user.click(screen.getByRole('button', { name: 'Pular' }));

      expect(await screen.findByText('questionário')).toBeInTheDocument();
      expect(salvar).toHaveBeenCalledWith({
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

    it('se salvar falha, fica na perspectiva com a mensagem e o texto', async () => {
      semPerfilNoBack();
      vi.spyOn(demographicsApi, 'saveMyDemographics').mockRejectedValue(
        new ApiError('Erro interno', 500),
      );
      const user = userEvent.setup();
      renderizarNa('/demographics/step-2');

      await user.click(await screen.findByRole('button', { name: 'Avançar' }));
      await user.type(await campoPerspectiva(), 'Minha família empreendia.');
      await user.click(screen.getByRole('button', { name: 'Avançar' }));

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Não foi possível salvar seus dados. Tente novamente.',
      );
      expect(await campoPerspectiva()).toHaveValue('Minha família empreendia.');
      expect(screen.queryByText('questionário')).toBeNull();
    });
  });

  describe('quem já tem perfil no back', () => {
    it('não passa pelo onboarding de novo: volta para onde estava', async () => {
      comPerfilNoBack();
      renderizarNa('/demographics/step-2', { from: '/dashboard' });

      expect(await screen.findByText('dashboard')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Avançar' })).toBeNull();
    });

    it('sem origem conhecida, vai para o questionário', async () => {
      comPerfilNoBack();
      renderizarNa('/demographics/step-2');

      expect(await screen.findByText('questionário')).toBeInTheDocument();
    });

    // Origem que é a própria etapa faria a tela redirecionar para si mesma.
    it('ignora uma origem que é rota de demográficos', async () => {
      comPerfilNoBack();
      renderizarNa('/demographics/step-2', { from: '/demographics/step-2' });

      expect(await screen.findByText('questionário')).toBeInTheDocument();
    });
  });

  describe('revisão dos dados (vinda do modal do questionário)', () => {
    it('abre o perfil já preenchido com o que está no back', async () => {
      comPerfilNoBack();
      renderizarNa('/demographics/step-2', { review: true });

      expect(
        await screen.findByRole('combobox', { name: /Gênero/ }),
      ).toHaveTextContent('Feminino');
      expect(
        screen.getByRole('combobox', { name: 'Estado' }),
      ).toHaveTextContent('Rio Grande do Sul');
    });

    it('abre a perspectiva preenchida, salva e volta ao questionário', async () => {
      comPerfilNoBack();
      const salvar = salvarFunciona();
      const user = userEvent.setup();
      renderizarNa('/demographics/step-2', { review: true });

      await user.click(await screen.findByRole('button', { name: 'Avançar' }));
      expect(await campoPerspectiva()).toHaveValue(
        'Meus pais tinham um pequeno comércio.',
      );
      await user.click(screen.getByRole('button', { name: 'Avançar' }));

      expect(await screen.findByText('questionário')).toBeInTheDocument();
      // O que não foi mexido volta para o back igual: o PUT substitui tudo.
      expect(salvar).toHaveBeenCalledWith(
        expect.objectContaining({
          gender: 'feminino',
          brazil_state: 'RS',
          perspective: 'Meus pais tinham um pequeno comércio.',
        }),
      );
    });
  });

  describe('quando o back não responde', () => {
    it('mostra o erro e busca de novo ao tentar novamente', async () => {
      const buscar = vi
        .spyOn(demographicsApi, 'getMyDemographics')
        .mockRejectedValueOnce(new ApiError('Erro interno', 500))
        .mockRejectedValueOnce(new ApiError('Perfil não encontrado', 404));
      const user = userEvent.setup();
      renderizarNa('/demographics/step-2');

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Não foi possível carregar seus dados.',
      );
      await user.click(
        screen.getByRole('button', { name: 'Tentar novamente' }),
      );

      expect(
        await screen.findByRole('button', { name: 'Avançar' }),
      ).toBeInTheDocument();
      expect(buscar).toHaveBeenCalledTimes(2);
    });
  });

  // Recarregar a página na perspectiva zera o rascunho. Salvar dali apagaria
  // o perfil gravado, porque o PUT substitui tudo.
  it('quem abre a perspectiva direto volta ao perfil, que busca o back antes', async () => {
    const buscar = semPerfilNoBack();
    const salvar = salvarFunciona();
    renderizarNa('/demographics/step-3');

    expect(
      await screen.findByRole('combobox', { name: /Gênero/ }),
    ).toBeInTheDocument();
    expect(buscar).toHaveBeenCalledTimes(1);
    expect(salvar).not.toHaveBeenCalled();
  });
});
