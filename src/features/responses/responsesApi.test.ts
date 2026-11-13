import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { responsesApi } from '@/features/responses/responsesApi';

const FORM_ID = '00000000-0000-0000-0000-000000000003';
const FORM_RESPONSE_ID = '3b1bb89a-471f-48b0-9025-cfda3b20d240';
const QUESTION_ID = '7ae21494-975f-46ab-97cc-4c42b5ae7aaa';

// Troca só o `fetch`: a chamada passa pelo apiClient de verdade, então o teste
// confere o endereço, o método e o corpo que de fato saem para o back.
function stubFetch(status = 200) {
  const fetchMock = vi.fn(() =>
    Promise.resolve(
      new Response(JSON.stringify({}), {
        status,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function lastCall(fetchMock: ReturnType<typeof stubFetch>) {
  const [url, init] = fetchMock.mock.lastCall as unknown as [
    string,
    RequestInit | undefined,
  ];
  return { url, method: init?.method ?? 'GET', body: init?.body };
}

describe('responsesApi', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getCurrentForm pergunta ao back qual é o questionário atual', async () => {
    const fetchMock = stubFetch();

    await responsesApi.getCurrentForm();

    expect(lastCall(fetchMock)).toEqual({
      url: '/api/v1/forms/current',
      method: 'GET',
      body: undefined,
    });
  });

  it('createFormResponse manda só o form_id, sem vínculo', async () => {
    const fetchMock = stubFetch(201);

    await responsesApi.createFormResponse(FORM_ID);

    const call = lastCall(fetchMock);
    expect(call.url).toBe('/api/v1/form-responses');
    expect(call.method).toBe('POST');
    expect(JSON.parse(call.body as string)).toEqual({ form_id: FORM_ID });
  });

  it('recordAnswer grava o texto na resposta de formulário', async () => {
    const fetchMock = stubFetch(201);

    await responsesApi.recordAnswer(FORM_RESPONSE_ID, {
      question_id: QUESTION_ID,
      value: 'Minha resposta',
    });

    const call = lastCall(fetchMock);
    expect(call.url).toBe(`/api/v1/form-responses/${FORM_RESPONSE_ID}/answers`);
    expect(call.method).toBe('POST');
    expect(JSON.parse(call.body as string)).toEqual({
      question_id: QUESTION_ID,
      value: 'Minha resposta',
    });
  });

  it('listAnswers lê as respostas gravadas', async () => {
    const fetchMock = stubFetch();

    await responsesApi.listAnswers(FORM_RESPONSE_ID);

    expect(lastCall(fetchMock)).toEqual({
      url: `/api/v1/form-responses/${FORM_RESPONSE_ID}/answers`,
      method: 'GET',
      body: undefined,
    });
  });

  it('submitFormResponse envia sem corpo', async () => {
    const fetchMock = stubFetch();

    await responsesApi.submitFormResponse(FORM_RESPONSE_ID);

    expect(lastCall(fetchMock)).toEqual({
      url: `/api/v1/form-responses/${FORM_RESPONSE_ID}`,
      method: 'PATCH',
      body: undefined,
    });
  });
});
