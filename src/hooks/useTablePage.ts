import { useState } from 'react';

// Paginação no cliente, igual em todas as tabelas. Se a lista encolher e a
// página atual deixar de existir, mostra a última que existe.
export function useTablePage<T>(items: T[], pageSize = 5) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  return {
    page: currentPage,
    totalPages,
    pageItems: items.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize,
    ),
    previous: () => {
      setPage(Math.max(1, currentPage - 1));
    },
    next: () => {
      setPage(Math.min(totalPages, currentPage + 1));
    },
    reset: () => {
      setPage(1);
    },
  };
}
