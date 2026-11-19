import { useState } from 'react';

// Linhas marcadas numa tabela, pelo id. A seleção sobrevive à troca de página.
export function useRowSelection() {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  function toggle(ids: string[], checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      for (const id of ids) {
        if (checked) {
          next.add(id);
        } else {
          next.delete(id);
        }
      }
      return next;
    });
  }

  return {
    isSelected: (id: string) => selected.has(id),
    toggle,
    remove: (id: string) => {
      toggle([id], false);
    },
    clear: () => {
      setSelected(new Set());
    },
  };
}
