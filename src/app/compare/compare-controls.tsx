'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function useCompareQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const ids = (searchParams.get('ids') ?? '')
    .split(',')
    .filter(Boolean);

  function setIds(next: string[]) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.length) params.set('ids', next.join(','));
    else params.delete('ids');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function remove(id: string) {
    setIds(ids.filter((x) => x !== id));
  }

  function clearAll() {
    setIds([]);
  }

  // Build a link that preserves the current selection back to /shoes
  const backToListHref = `/shoes${ids.length ? `?ids=${ids.join(',')}` : ''}`;

  return { ids, remove, clearAll, backToListHref };
}

export function RemoveButton({ id }: { id: string }) {
  const { remove } = useCompareQuery();
  return (
    <button
      onClick={() => remove(id)}
      className="ml-2 text-xs underline text-red-600 hover:text-red-700"
      title="Remove from comparison"
    >
      remove
    </button>
  );
}

export function ClearAllButton() {
  const { ids, clearAll } = useCompareQuery();
  if (!ids.length) return null;
  return (
    <button
      onClick={clearAll}
      className="text-sm underline text-red-600 hover:text-red-700"
      title="Clear all"
    >
      Clear all
    </button>
  );
}
