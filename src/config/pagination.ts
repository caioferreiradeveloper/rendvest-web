export function getPageSize(): number {
  const configuredPageSize = import.meta.env.VITE_PAGE_SIZE;
  const pageSize = Number(configuredPageSize);
  if (!Number.isSafeInteger(pageSize) || pageSize < 1) {
    throw new Error('PAGE_SIZE deve ser um número inteiro positivo seguro.');
  }

  return pageSize;
}
