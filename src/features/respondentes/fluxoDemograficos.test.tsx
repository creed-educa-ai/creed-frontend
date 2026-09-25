import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';
import respondentesDemograficosReducer from '@/features/respondentes/respondentesDemograficosSlice';
import {
  Demograficos1Etapa,
  Demograficos2Etapa,
  Demograficos3Etapa,
} from '@/features/respondentes/fluxoDemograficos';

// O que cada tela valida já está nos testes delas; aqui só a ordem do fluxo.
function renderizarNa(rota: string) {
  const store = configureStore({
    reducer: { respondentesDemograficos: respondentesDemograficosReducer },
  });
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[rota]}>
        <Routes>
          <Route path="/demograficos-1" element={<Demograficos1Etapa />} />
          <Route path="/demograficos-2" element={<Demograficos2Etapa />} />
          <Route path="/demograficos-3" element={<Demograficos3Etapa />} />
          <Route path="/respondentes" element={<p>área logada</p>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe('fluxo dos dados demográficos', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('percorre as três etapas até a área logada', async () => {
    const user = userEvent.setup();
    renderizarNa('/demograficos-1');

    await user.type(screen.getByRole('textbox', { name: 'Nome' }), 'Ana');
    await user.click(screen.getByRole('button', { name: 'Avançar' }));

    // Etapa 2 e 3 são opcionais: pular também avança.
    await user.click(await screen.findByRole('button', { name: 'Pular' }));
    await user.click(await screen.findByRole('button', { name: 'Pular' }));

    expect(await screen.findByText('área logada')).toBeInTheDocument();
  });

  it('avançar na etapa 2 leva à etapa 3', async () => {
    const user = userEvent.setup();
    const { container } = renderizarNa('/demograficos-2');
    const tituloEtapa2 = container.querySelector('h1')?.textContent;

    await user.click(screen.getByRole('button', { name: 'Avançar' }));

    const tituloEtapa3 = await screen.findByRole('heading', { level: 1 });
    expect(tituloEtapa3.textContent).not.toBe(tituloEtapa2);
  });
});
