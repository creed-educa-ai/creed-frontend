import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRepeatWhile } from './useRepeatWhile';

// Cada repetição devolve algo cancelável, como a promessa de um dispatch.
function repeticao() {
  const abort = vi.fn();
  const repeat = vi.fn(() => ({ abort }));
  return { repeat, abort };
}

describe('useRepeatWhile', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('repete a cada intervalo enquanto está ativo', () => {
    const { repeat } = repeticao();
    renderHook(() => useRepeatWhile(true, 15_000, repeat));

    expect(repeat).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(15_000);
    });
    expect(repeat).toHaveBeenCalledTimes(1);
    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(repeat).toHaveBeenCalledTimes(3);
  });

  it('inativo, não repete nada', () => {
    const { repeat } = repeticao();
    const { result } = renderHook(() => useRepeatWhile(false, 15_000, repeat));

    act(() => {
      vi.advanceTimersByTime(5 * 60 * 1000);
    });
    expect(repeat).not.toHaveBeenCalled();
    expect(result.current).toBe(false);
  });

  it('para no teto de 2 minutos e avisa', () => {
    const { repeat } = repeticao();
    const { result } = renderHook(() => useRepeatWhile(true, 15_000, repeat));

    act(() => {
      vi.advanceTimersByTime(2 * 60 * 1000 - 1);
    });
    expect(repeat).toHaveBeenCalledTimes(7);
    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    // 2 min / 15 s: a oitava é a última.
    expect(repeat).toHaveBeenCalledTimes(8);
    expect(result.current).toBe(true);

    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(repeat).toHaveBeenCalledTimes(8);
  });

  it('para quando deixa de estar ativo', () => {
    const { repeat } = repeticao();
    const { rerender } = renderHook(
      ({ active }) => useRepeatWhile(active, 5_000, repeat),
      { initialProps: { active: true } },
    );

    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    rerender({ active: false });
    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(repeat).toHaveBeenCalledTimes(1);
  });

  it('ao sair da tela, cancela a última e para de repetir', () => {
    const { repeat, abort } = repeticao();
    const { unmount } = renderHook(() => useRepeatWhile(true, 5_000, repeat));

    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    unmount();
    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(abort).toHaveBeenCalledOnce();
    expect(repeat).toHaveBeenCalledTimes(1);
  });
});
