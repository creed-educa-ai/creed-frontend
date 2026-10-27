import { useState } from 'react';

export type SortDirection = 'asc' | 'desc';

// Ordenação por uma coluna de cada vez. Cada clique avança:
// crescente → decrescente → ordem original.
export function useTableSort<Column extends string>() {
  const [sorting, setSorting] = useState<{
    column: Column;
    direction: SortDirection;
  } | null>(null);

  function toggle(column: Column) {
    setSorting((current) => {
      if (current?.column !== column) return { column, direction: 'asc' };
      if (current.direction === 'asc') return { column, direction: 'desc' };
      return null;
    });
  }

  return {
    sorting,
    toggle,
    directionOf: (column: Column) =>
      sorting?.column === column ? sorting.direction : null,
  };
}
