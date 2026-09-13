import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { Demograficos3View } from '@/features/respondentes/Demograficos3View';
import respondentesDemograficosReducer, {
  definirPerspectiva,
} from '@/features/respondentes/respondentesDemograficosSlice';
import respondentesReducer from '@/features/respondentes/respondentesSlice';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

// Store novo a cada teste, com os mesmos reducers do app: o singleton de
// src/app/store.ts carregaria o texto de um teste para o seguinte.
function criarStore() {
  return configureStore({
    reducer: {
      respondentes: respondentesReducer,
      respondentesDemograficos: respondentesDemograficosReducer,
    },
  });
}

function renderizar(store = criarStore()) {
  render(
    <Provider store={store}>
      <Demograficos3View />
    </Provider>,
  );
  return store;
}

function campoPerspectiva() {
  return screen.getByLabelText(/educação familiar/i);
}

describe('Demograficos3View', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('salva a resposta no slice ao clicar em Avançar', async () => {
    const store = renderizar();

    await userEvent.type(
      campoPerspectiva(),
      'Cresci vendo meus pais empreender.',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Avançar' }));

    expect(store.getState().respondentesDemograficos.perspectiva).toBe(
      'Cresci vendo meus pais empreender.',
    );
  });

  // É a regra 6 de formularios.md: o texto não vai para o Redux a cada tecla.
  it('não grava no slice enquanto a pessoa ainda está digitando', async () => {
    const store = renderizar();

    await userEvent.type(campoPerspectiva(), 'Rascunho');

    expect(store.getState().respondentesDemograficos.perspectiva).toBe('');
  });

  it('reabre a tela com a resposta que já estava salva', () => {
    const store = criarStore();
    store.dispatch(definirPerspectiva('Resposta de antes'));

    renderizar(store);

    expect(campoPerspectiva()).toHaveValue('Resposta de antes');
  });

  it('permite apagar a resposta salva e avançar com o campo vazio', async () => {
    const store = criarStore();
    store.dispatch(definirPerspectiva('Resposta de antes'));
    renderizar(store);

    await userEvent.clear(campoPerspectiva());
    await userEvent.click(screen.getByRole('button', { name: 'Avançar' }));

    expect(store.getState().respondentesDemograficos.perspectiva).toBe('');
  });
});
