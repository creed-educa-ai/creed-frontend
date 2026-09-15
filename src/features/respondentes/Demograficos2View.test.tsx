import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { Demograficos2View } from './Demograficos2View';
import demographicsReducer from './respondentesDemograficosSlice';
import i18n from '@/i18n/config';
import { emptyDemographics } from './demographicsSchema';

function createStore() {
  return configureStore({
    reducer: { respondentesDemograficos: demographicsReducer },
  });
}

function renderView(store = createStore()) {
  const onContinue = vi.fn();
  const onSkip = vi.fn();
  return {
    store,
    onContinue,
    onSkip,
    ...render(
      <Provider store={store}>
        <Demograficos2View onContinue={onContinue} onSkip={onSkip} />
      </Provider>,
    ),
  };
}

describe('Demograficos2View', () => {
  beforeAll(() => {
    // Radix move o item ativo para a área visível; jsdom não calcula layout.
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('finds ethnic backgrounds by their displayed descriptions', async () => {
    const user = userEvent.setup();
    renderView();
    await user.type(
      screen.getByRole('combobox', { name: 'Origem Étnica (opcional)' }),
      'portuguesa',
    );
    expect(
      await screen.findByRole('option', { name: /Europeia/ }),
    ).toBeInTheDocument();
  });

  it('translates selected chips and labels without changing their values', async () => {
    const user = userEvent.setup();
    renderView();
    await user.click(
      screen.getByRole('combobox', { name: 'Religião (opcional)' }),
    );
    await user.click(await screen.findByRole('option', { name: 'Judaica' }));
    await act(async () => {
      await i18n.changeLanguage('en');
    });
    expect(screen.getByText('Jewish')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Remove Jewish' }),
    ).toBeInTheDocument();
  });

  it('accepts the empty optional step and calls continue once', async () => {
    const user = userEvent.setup();
    const { onContinue } = renderView();
    await user.click(screen.getByRole('button', { name: 'Avançar' }));
    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(onContinue).toHaveBeenCalledWith(emptyDemographics);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('edits locally, saves only on continue and restores the committed step', async () => {
    const user = userEvent.setup();
    const { store, unmount, onContinue } = renderView();
    await user.click(
      screen.getByRole('combobox', { name: 'Religião (opcional)' }),
    );
    await user.click(await screen.findByRole('option', { name: 'Judaica' }));
    expect(store.getState().respondentesDemograficos.religiao).toEqual([]);
    await user.click(screen.getByRole('button', { name: 'Avançar' }));
    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(onContinue).toHaveBeenCalledWith({
      ...emptyDemographics,
      religiao: ['judaica'],
    });
    unmount();
    renderView(store);
    expect(
      screen.getByRole('button', { name: 'Remover Judaica' }),
    ).toBeInTheDocument();
  });

  it('selects several backgrounds and removes only the chosen chip without submitting', async () => {
    const user = userEvent.setup();
    const { onContinue } = renderView();
    for (const name of ['Romani / Cigana', 'Indígena / Ameríndia']) {
      await user.click(
        screen.getByRole('combobox', { name: 'Origem Étnica (opcional)' }),
      );
      await user.click(await screen.findByRole('option', { name }));
    }
    await user.click(
      screen.getByRole('button', { name: 'Remover Romani / Cigana' }),
    );
    expect(screen.queryByText('Romani / Cigana')).not.toBeInTheDocument();
    expect(screen.getByText('Indígena / Ameríndia')).toBeInTheDocument();
    expect(onContinue).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Avançar' }));
    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(onContinue).toHaveBeenCalledWith({
      ...emptyDemographics,
      origemEtnica: ['indigena_amerindia'],
    });
  });

  it('clears the current step when skipped, including a previously committed draft', async () => {
    const user = userEvent.setup();
    const { onSkip, store } = renderView();
    await user.click(
      screen.getByRole('combobox', { name: 'Religião (opcional)' }),
    );
    await user.click(await screen.findByRole('option', { name: 'Budismo' }));
    await user.click(screen.getByRole('button', { name: 'Avançar' }));
    await user.click(screen.getByRole('button', { name: 'Pular' }));
    expect(onSkip).toHaveBeenCalledOnce();
    expect(screen.queryByText('Budismo')).not.toBeInTheDocument();
    expect(store.getState().respondentesDemograficos).toMatchObject(
      emptyDemographics,
    );
  });

  it('searches translated religion labels and submits stable values', async () => {
    await i18n.changeLanguage('en');
    const user = userEvent.setup();
    const { onContinue } = renderView();
    await user.type(
      screen.getByRole('combobox', { name: 'Religion (optional)' }),
      'Candomblé',
    );
    await user.click(
      await screen.findByRole('option', { name: /African-derived/ }),
    );
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(onContinue).toHaveBeenCalledWith({
      ...emptyDemographics,
      religiao: ['matriz_africana'],
    });
  });

  it('shows an empty search result without treating the query as an answer', async () => {
    const user = userEvent.setup();
    const { onContinue } = renderView();
    await user.type(
      screen.getByRole('combobox', { name: 'Religião (opcional)' }),
      'xyzxyz',
    );
    expect(
      await screen.findByText('Nenhuma opção encontrada'),
    ).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Avançar' }));
    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(onContinue).toHaveBeenCalledWith(emptyDemographics);
  });

  it('clears dependent answers when nationality changes and labels each control', async () => {
    const user = userEvent.setup();
    const { onContinue } = renderView();
    async function choose(label: string, option: string) {
      screen.getByRole('combobox', { name: label }).focus();
      await user.keyboard('{ArrowDown}');
      await user.click(await screen.findByRole('option', { name: option }));
    }
    await choose('Nacionalidade (opcional)', 'Brasileira');
    await choose('Estado', 'Rio Grande do Sul');
    await choose('Nacionalidade (opcional)', 'Portuguesa');
    expect(
      screen.queryByRole('combobox', { name: 'Estado' }),
    ).not.toBeInTheDocument();
    await choose('Região', 'Norte');
    await choose('Nacionalidade (opcional)', 'Outra');
    expect(
      screen.queryByRole('combobox', { name: 'Região' }),
    ).not.toBeInTheDocument();
    await user.type(
      screen.getByRole('textbox', { name: 'Qual nacionalidade?' }),
      'Argentina',
    );
    await choose('Nacionalidade (opcional)', 'Brasileira');
    expect(screen.getByRole('combobox', { name: 'Estado' })).toHaveTextContent(
      'Escolher',
    );
    await user.click(screen.getByRole('button', { name: 'Avançar' }));
    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(onContinue).toHaveBeenCalledWith({
      ...emptyDemographics,
      nacionalidade: 'brasileira',
    });
    await user.click(
      screen.getByRole('button', { name: 'Limpar Nacionalidade (opcional)' }),
    );
    expect(
      screen.queryByRole('combobox', { name: 'Estado' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: 'Nacionalidade (opcional)' }),
    ).toHaveTextContent('Escolher');
  });
});
