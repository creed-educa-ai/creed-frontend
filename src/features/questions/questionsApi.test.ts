import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { questionsApi } from '@/features/questions/questionsApi';
import { lastCall, stubFetch } from '@/test/stubFetch';

const FORM_ID = '00000000-0000-0000-0000-000000000003';
const QUESTION_ID = '7ae21494-975f-46ab-97cc-4c42b5ae7aaa';

describe('questionsApi', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('listQuestions lê todas as perguntas do formulário', async () => {
    const fetchMock = stubFetch(200, []);

    await questionsApi.listQuestions(FORM_ID);

    expect(lastCall(fetchMock)).toEqual({
      url: `/api/v1/forms/${FORM_ID}/questions`,
      method: 'GET',
      body: undefined,
    });
  });

  it('listQuestions filtra pela seção quando pedida', async () => {
    const fetchMock = stubFetch(200, []);

    await questionsApi.listQuestions(FORM_ID, 'assessment');

    expect(lastCall(fetchMock).url).toBe(
      `/api/v1/forms/${FORM_ID}/questions?section=assessment`,
    );
  });

  it('createQuestion manda a pergunta para /questions', async () => {
    const fetchMock = stubFetch(201);
    const question = {
      form_id: FORM_ID,
      text: 'Como você avalia sua adaptabilidade?',
      order_index: 0,
      type: 'objective' as const,
      section: 'assessment' as const,
      dimensao: 'S2' as const,
    };

    await questionsApi.createQuestion(question);

    expect(lastCall(fetchMock)).toEqual({
      url: '/api/v1/questions',
      method: 'POST',
      body: question,
    });
  });

  it('createOption leva a pergunta no caminho, não no corpo', async () => {
    const fetchMock = stubFetch(201);

    await questionsApi.createOption(QUESTION_ID, {
      label: 'Sim',
      value: 'sim',
      order_index: 0,
    });

    expect(lastCall(fetchMock)).toEqual({
      url: `/api/v1/questions/${QUESTION_ID}/options`,
      method: 'POST',
      body: { label: 'Sim', value: 'sim', order_index: 0 },
    });
  });
});
