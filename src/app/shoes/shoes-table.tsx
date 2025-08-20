'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import useCompare, { CompareBar } from './compare-picker';

export type UiRow = {
  id: string;
  brand: string;
  model: string;
  version: string;
  year: number | null;
  terrain: string;
  category: string;
  weight_men: number | null;
  weight_women: number | null;
  heel: number | null;      // stack heel
  forefoot: number | null;  // stack forefoot
  drop: number | null;
};

type Props = { rows: UiRow[] };

type SortKey = keyof UiRow;
type SortDir = 'asc' | 'desc';

export default function ShoesTable({ rows }: Props) {
  // ⬇️ HOOKS MUST BE AT TOP LEVEL
  const [sortKey, setSortKey] = useState<SortKey>('brand');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // ⬇️ compare hook at top level (NOT inside callbacks/loops)
  const { ids, toggle, compareHref } = useCompare();

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const A = a[sortKey];
      const B = b[sortKey];
      // nulls last
      if (A == null && B == null) return 0;
      if (A == null) return 1;
      if (B == null) return -1;

      if (typeof A === 'number' && typeof B === 'number') {
        return sortDir === 'asc' ? A - B : B - A;
      }
      // string compare
      const sA = String(A).toLowerCase();
      const sB = String(B).toLowerCase();
      if (sA < sB) return sortDir === 'asc' ? -1 : 1;
      if (sA > sB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function Th({ label, k }: { label: string; k: SortKey }) {
    const active = sortKey === k;
    const arrow = active ? (sortDir === 'asc' ? '▲' : '▼') : '↕';
    return (
      <th
        className="px-3 py-2 text-left font-medium border-b border-gray-200 cursor-pointer select-none"
        onClick={() => handleSort(k)}
        title={`Sort by ${label}`}
      >
        {label} <span className="text-gray-400">{arrow}</span>
      </th>
    );
  }

  const fmt = {
    g: (n: number | null) => (n == null ? '—' : `${n} g`),
    mm: (n: number | null) => (n == null ? '—' : `${n} mm`),
    text: (s: string) => (s ? s : '—'),
    year: (n: number | null) => (n == null ? '—' : String(n)),
  };

  return (
    <div className="overflow-x-auto rounded-lg border relative">
      <table className="min-w-[1040px] w-full text-sm">
        <thead className="bg-gray-50 text-gray-700">
          <tr>
            <Th label="Brand" k="brand" />
            <Th label="Model" k="model" />
            <Th label="Version" k="version" />
            <Th label="Year" k="year" />
            <Th label="Terrain" k="terrain" />
            <Th label="Category" k="category" />
            <Th label="Wt M (g)" k="weight_men" />
            <Th label="Wt W (g)" k="weight_women" />
            <Th label="Heel (mm)" k="heel" />
            <Th label="Forefoot (mm)" k="forefoot" />
            <Th label="Drop (mm)" k="drop" />
            <th className="px-3 py-2 text-left font-medium border-b border-gray-200">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => {
            const selected = ids.includes(r.id);
            return (
              <tr key={r.id} className="odd:bg-white even:bg-gray-50">
                <td className="px-3 py-2 border-b border-gray-200">{fmt.text(r.brand)}</td>
                <td className="px-3 py-2 border-b border-gray-200">{fmt.text(r.model)}</td>
                <td className="px-3 py-2 border-b border-gray-200">{fmt.text(r.version)}</td>
                <td className="px-3 py-2 border-b border-gray-200">{fmt.year(r.year)}</td>
                <td className="px-3 py-2 border-b border-gray-200 capitalize">{fmt.text(r.terrain)}</td>
                <td className="px-3 py-2 border-b border-gray-200 capitalize">{fmt.text(r.category)}</td>
                <td className="px-3 py-2 border-b border-gray-200">{fmt.g(r.weight_men)}</td>
                <td className="px-3 py-2 border-b border-gray-200">{fmt.g(r.weight_women)}</td>
                <td className="px-3 py-2 border-b border-gray-200">{fmt.mm(r.heel)}</td>
                <td className="px-3 py-2 border-b border-gray-200">{fmt.mm(r.forefoot)}</td>
                <td className="px-3 py-2 border-b border-gray-200">{fmt.mm(r.drop)}</td>
                <td className="px-3 py-2 border-b border-gray-200">
                  <button
                    className={`mr-3 text-sm underline ${selected ? 'text-red-600' : 'text-blue-600'}`}
                    onClick={() => toggle(r.id)}
                  >
                    {selected ? 'Remove' : 'Compare'}
                  </button>
                  <Link className="text-sm underline text-blue-600" href={`/shoes/${r.id}`}>
                    Details
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Sticky compare bar */}
      <CompareBar ids={ids} compareHref={compareHref} />
    </div>
  );
}
