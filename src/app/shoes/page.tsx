// src/app/shoes/page.tsx
import { supabase } from '@/lib/supabase';

type Shoe = {
  brand: string;
  model_name: string;
  terrain: string;
  category: string;
};

type Spec = {
  weight_men: number | null;
  weight_women: number | null;
  stack_height_heel: number | null;
  stack_height_forefoot: number | null;
  drop: number | null;
};

// What Supabase actually returns for this query
type QueryRow = {
  id: string;
  version_name: string | null;
  release_year: number | null;
  // Relations can come back as a single object or an array
  shoes: Shoe | Shoe[] | null;
  specs: Spec[] | null;
};

function firstOrNull<T>(v: T | T[] | null): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

export default async function ShoesPage() {
  const { data, error } = await supabase
    .from('shoe_versions')
    .select(
      `
      id,
      version_name,
      release_year,
      shoes:shoe_id (
        brand,
        model_name,
        terrain,
        category
      ),
      specs (
        weight_men,
        weight_women,
        stack_height_heel,
        stack_height_forefoot,
        drop
      )
    `
    )
    .order('brand', { ascending: true, foreignTable: 'shoes' })
    .order('model_name', { ascending: true, foreignTable: 'shoes' });

  if (error) {
    return <div className="p-6 text-red-600">Error: {error.message}</div>;
  }

  const rows = (data as QueryRow[]) ?? [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Shoes (Versions + Specs)</h1>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-[960px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <Th>Brand</Th>
              <Th>Model</Th>
              <Th>Version</Th>
              <Th>Year</Th>
              <Th>Terrain</Th>
              <Th>Category</Th>
              <Th>Wt M (g)</Th>
              <Th>Wt W (g)</Th>
              <Th>Heel (mm)</Th>
              <Th>Forefoot (mm)</Th>
              <Th>Drop (mm)</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const shoe = firstOrNull(r.shoes);
              const spec = firstOrNull(r.specs);

              return (
                <tr key={r.id} className="odd:bg-white even:bg-gray-50">
                  <Td>{shoe?.brand ?? '—'}</Td>
                  <Td>{shoe?.model_name ?? '—'}</Td>
                  <Td>{r.version_name ?? '—'}</Td>
                  <Td>{r.release_year ?? '—'}</Td>
                  <Td className="capitalize">{shoe?.terrain ?? '—'}</Td>
                  <Td className="capitalize">{shoe?.category ?? '—'}</Td>
                  <Td>{spec?.weight_men ?? '—'}</Td>
                  <Td>{spec?.weight_women ?? '—'}</Td>
                  <Td>{spec?.stack_height_heel ?? '—'}</Td>
                  <Td>{spec?.stack_height_forefoot ?? '—'}</Td>
                  <Td>{spec?.drop ?? '—'}</Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Tip: relations like <code>specs</code> can come back as arrays; we take the first row for
        MVP. Later we can enforce a 1:1 DB constraint if desired.
      </p>
    </div>
  );
}

// Presentational helpers that accept className
function Th({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-3 py-2 text-left font-medium border-b border-gray-200 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-3 py-2 border-b border-gray-200 ${className}`}>
      {children}
    </td>
  );
}
