import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  RevisaoRespostasView,
  type ReviewQuestion,
} from '@/features/responses/RevisaoRespostasView';
import i18n, { IDIOMA_PADRAO } from '@/i18n/config';

const MOCK_QUESTIONS: ReviewQuestion[] = [
  {
    id: 'mock-scale',
    section: 1,
    text: 'Mock: avalie a colaboração',
    type: 'quantitativa',
    options: ['1', '2', '3', '4', '5'],
    required: true,
    answer: '3',
  },
  {
    id: 'mock-essay',
    section: 2,
    text: 'Mock: descreva uma situação',
    type: 'dissertativa',
    options: [],
    required: true,
    answer: null,
  },
];

function renderizar(onSubmit = vi.fn()) {
  const result = render(
    <RevisaoRespostasView questions={MOCK_QUESTIONS} onSubmit={onSubmit} />,
  );
  return { ...result, onSubmit };
}

function obterLinha(pergunta: string) {
  return within(screen.getByRole('table')).getByRole('row', {
    name: new RegExp(pergunta),
  });
}

function obterBotaoRevisar(numero: number) {
  const [botao] = screen.getAllByRole('button', {
    name: `Revisar pergunta ${String(numero)}`,
  });
  if (!botao)
    throw new Error(
      `Botão para revisar pergunta ${String(numero)} não encontrado`,
    );
  return botao;
}

describe('RevisaoRespostasView', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(IDIOMA_PADRAO);
  });

  it('mostra estado vazio e bloqueia envio quando nenhuma linha é fornecida', () => {
    render(<RevisaoRespostasView questions={[]} onSubmit={vi.fn()} />);

    expect(
      screen.getByText('Não há respostas para revisar.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Enviar respostas' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renderiza perguntas e respostas recebidas por props em tabela e cards mobile', () => {
    renderizar();

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(obterLinha('Mock: avalie a colaboração')).toHaveTextContent(
      '3 (em escala 1 a 5)',
    );
    expect(
      screen.getAllByRole('button', { name: 'Revisar pergunta 1' }),
    ).toHaveLength(2);
    expect(
      screen.getByText('Esta pergunta é obrigatória.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Obrigatória')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Enviar respostas' }),
    ).toBeDisabled();
    // Uma lista de cards por seção, todas dentro do bloco que só aparece no
    // mobile (lista → seção → bloco).
    const listas = screen.getAllByRole('list');
    expect(listas).toHaveLength(2);
    for (const lista of listas) {
      expect(lista.parentElement?.parentElement).toHaveClass('md:hidden');
    }
    expect(screen.getByRole('table').parentElement?.parentElement).toHaveClass(
      'hidden',
      'md:block',
    );
  });

  it('separa as perguntas por seção na tabela e nos cards mobile', () => {
    renderizar();

    // Tabela: um cabeçalho de seção por grupo.
    const tabela = screen.getByRole('table');
    expect(
      within(tabela).getByRole('columnheader', { name: 'Seção 1' }),
    ).toBeInTheDocument();
    expect(
      within(tabela).getByRole('columnheader', { name: 'Seção 2' }),
    ).toBeInTheDocument();

    // Cards: cada seção é um título, e a numeração das perguntas continua
    // corrida entre as seções.
    expect(
      screen.getByRole('heading', { level: 2, name: 'Seção 1' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Seção 2' }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: 'Revisar pergunta 2' }),
    ).toHaveLength(2);
  });

  it('salva a edição de escala e cancelar descarta a edição dissertativa', async () => {
    const user = userEvent.setup();
    renderizar();

    await user.click(obterBotaoRevisar(1));
    let dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('radio', { name: '5' }));
    await user.click(
      within(dialog).getByRole('button', { name: 'Salvar resposta' }),
    );
    expect(obterLinha('Mock: avalie a colaboração')).toHaveTextContent(
      '5 (em escala 1 a 5)',
    );

    await user.click(obterBotaoRevisar(2));
    dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByRole('textbox'), 'Resposta temporária');
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }));
    expect(obterLinha('Mock: descreva uma situação')).toHaveTextContent(
      'Sem resposta',
    );
  });

  it('salva a resposta dissertativa e libera o envio após preencher obrigatórias', async () => {
    const user = userEvent.setup();
    renderizar();

    await user.click(obterBotaoRevisar(2));
    const dialog = screen.getByRole('dialog');
    await user.type(
      within(dialog).getByRole('textbox'),
      'Resposta mockada preenchida.',
    );
    await user.click(
      within(dialog).getByRole('button', { name: 'Salvar resposta' }),
    );

    expect(obterLinha('Mock: descreva uma situação')).toHaveTextContent(
      'Resposta mockada preenchida.',
    );
    expect(
      screen.getByRole('button', { name: 'Enviar respostas' }),
    ).toBeEnabled();
  });

  it('envia as respostas uma vez após confirmação mesmo com clique duplo', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderizar();

    await user.click(obterBotaoRevisar(2));
    const dialog = screen.getByRole('dialog');
    await user.type(
      within(dialog).getByRole('textbox'),
      'Resposta mockada preenchida.',
    );
    await user.click(
      within(dialog).getByRole('button', { name: 'Salvar resposta' }),
    );
    await user.click(screen.getByRole('button', { name: 'Enviar respostas' }));

    const confirmation = screen.getByRole('alertdialog');
    const confirmButton = within(confirmation).getByRole('button', {
      name: 'Confirmar envio',
    });
    fireEvent.click(confirmButton);
    fireEvent.click(confirmButton);

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith([
      '3',
      'Resposta mockada preenchida.',
    ]);
    expect(screen.getByText('Respostas enviadas.')).toBeInTheDocument();
  });

  it('aciona a impressão para salvar ou imprimir a revisão como PDF', async () => {
    const user = userEvent.setup();
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    renderizar();

    await user.click(screen.getByRole('button', { name: 'Gerar PDF' }));

    expect(print).toHaveBeenCalledOnce();
    print.mockRestore();
  });
});
