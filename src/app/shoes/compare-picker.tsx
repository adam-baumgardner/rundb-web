'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

export default function useCompare() {
  const [ids, setIds] = useState<string[]>([]);

  // Optional: hydrate from URL on mount so refresh doesn't lose selection
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('ids');
    if (raw) setIds(raw.split(',').filter(Boolean));
  }, []);

  function toggle(id: string) {
    setIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((x) => x !== id) : [...prev, id];
      return next.slice(0, 4); // cap at 4 for MVP
    });
  }

  const compareHref = useMemo(() => {
    if (ids.length === 0) return '/compare';
    const params = new URLSearchParams();
    params.set('ids', ids.join(','));
    return `/compare?${params.toString()}`;
  }, [ids]);

  return { ids, toggle, compareHref };
}

export function CompareBar({ ids, compareHref }: { ids: string[]; compareHref: string }) {
  return (
    <div className="sticky bottom-4 mx-auto max-w-5xl">
      <div className="inline-flex items-center gap-3 rounded-full border bg-white/90 backdrop-blur px-4 py-2 shadow">
        <span className="text-sm text-gray-700">Selected: {ids.length}/4</span>
        <Link
          href={compareHref}
          className={`text-sm underline ${ids.length ? 'text-blue-600' : 'pointer-events-none text-gray-400'}`}
        >
          Compare
        </Link>
      </div>
    </div>
  );
}
