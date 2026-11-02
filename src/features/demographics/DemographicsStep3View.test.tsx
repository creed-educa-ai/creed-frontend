import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { DemographicsStep3View } from '@/features/demographics/DemographicsStep3View';
import demographicsReducer, {
  setPerspective,
} from '@/features/demographics/demographicsSlice';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

// Store novo a cada teste, com os mesmos reducers do app: o singleton de
// src/app/store.ts carregaria o texto de um teste para o seguinte.
function criarStore() {
  return configureStore({
    reducer: {
      demographics: demographicsReducer,
    },
  });
}

function renderizar(store = criarStore()) {
  const onContinue = vi.fn();
  const onSkip = vi.fn();
  // MemoryRouter: a seta de voltar do FormLayout usa o roteador.
  render(
    <MemoryRouter>
      <Provider store={store}>
        <DemographicsStep3View onContinue={onContinue} onSkip={onSkip} />
      </Provider>
    </MemoryRouter>,
  );
  return { store, onContinue, onSkip };
}

function campoPerspectiva() {
  return screen.getByLabelText(/educação familiar/i);
}

describe('DemographicsStep3View', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('salva a resposta no slice e avisa o fluxo uma vez ao clicar em Avançar', async () => {
    const { store, onContinue } = renderizar();

    await userEvent.type(
      campoPerspectiva(),
      'Cresci vendo meus pais empreender.',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Avançar' }));

    expect(store.getState().demographics.perspective).toBe(
      'Cresci vendo meus pais empreender.',
    );
    expect(onContinue).toHaveBeenCalledOnce();
    expect(onContinue).toHaveBeenCalledWith({
      perspective: 'Cresci vendo meus pais empreender.',
    });
  });

  // É a regra 6 de formularios.md: o texto não vai para o Redux a cada tecla.
  it('não grava no slice enquanto a pessoa ainda está digitando', async () => {
    const { store } = renderizar();

    await userEvent.type(campoPerspectiva(), 'Rascunho');

    expect(store.getState().demographics.perspective).toBe('');
  });

  it('reabre a tela com a resposta que já estava salva', () => {
    const store = criarStore();
    store.dispatch(setPerspective('Resposta de antes'));

    renderizar(store);

    expect(campoPerspectiva()).toHaveValue('Resposta de antes');
  });

  it('permite apagar a resposta salva e avançar com o campo vazio', async () => {
    const store = criarStore();
    store.dispatch(setPerspective('Resposta de antes'));
    renderizar(store);

    await userEvent.clear(campoPerspectiva());
    await userEvent.click(screen.getByRole('button', { name: 'Avançar' }));

    expect(store.getState().demographics.perspective).toBe('');
  });

  it('descarta a resposta salva e avisa o fluxo ao clicar em Pular', async () => {
    const store = criarStore();
    store.dispatch(setPerspective('Resposta de antes'));
    const { onContinue, onSkip } = renderizar(store);

    await userEvent.click(screen.getByRole('button', { name: 'Pular' }));

    expect(campoPerspectiva()).toHaveValue('');
    expect(store.getState().demographics.perspective).toBe('');
    expect(onSkip).toHaveBeenCalledOnce();
    expect(onContinue).not.toHaveBeenCalled();
  });

  it('remove os espaços das pontas antes de salvar', async () => {
    const { store } = renderizar();

    await userEvent.type(campoPerspectiva(), '   Texto com espaços   ');
    await userEvent.click(screen.getByRole('button', { name: 'Avançar' }));

    expect(store.getState().demographics.perspective).toBe('Texto com espaços');
  });
});
