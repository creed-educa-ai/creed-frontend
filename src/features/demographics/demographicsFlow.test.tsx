import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import demographicsReducer from '@/features/demographics/demographicsSlice';
import {
  DemographicsStep1Route,
  DemographicsStep2Route,
  DemographicsStep3Route,
} from '@/features/demographics/demographicsFlow';

// O que cada tela valida já está nos testes delas; aqui só a ordem do fluxo.
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
    </Provider>,
  );
}

describe('fluxo dos dados demográficos', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
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
