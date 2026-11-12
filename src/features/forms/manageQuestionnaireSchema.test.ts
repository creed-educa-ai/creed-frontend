import { describe, expect, it } from 'vitest';
import { toPeriodDates } from '@/features/forms/manageQuestionnaireSchema';

describe('toPeriodDates', () => {
  it('manda data e hora no fuso de quem marcou, com o deslocamento', () => {
    const { opens_at, closes_at } = toPeriodDates({
      dataInicio: '2026-11-10',
      horaInicio: '09:00',
      dataLimite: '2026-11-20',
      horaLimite: '18:30',
    });

    // '2026-11-10T09:00:00-03:00' em Brasília; o deslocamento é o do fuso
    // de quem roda o teste, mas sempre vem escrito.
    expect(opens_at).toMatch(/^2026-11-10T09:00:00(Z|[+-]\d{2}:\d{2})$/);
    expect(closes_at).toMatch(/^2026-11-20T18:30:00(Z|[+-]\d{2}:\d{2})$/);
    // E aponta para o mesmo instante que as 9h locais.
    expect(new Date(opens_at).getTime()).toBe(
      new Date(2026, 10, 10, 9, 0).getTime(),
    );
  });
});
