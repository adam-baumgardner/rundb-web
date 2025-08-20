import { supabase } from '@/lib/supabase';
import Link from 'next/link';

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

type QueryRow = {
  id: string;
  version_name: string | null;
  release_year: number | null;
  shoes: Shoe | Shoe[] | null;
  specs: Spec[] | null;
};

function firstOrNull<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function ShoeDetailsPage(props: any) {
  // Next App Router sometimes provides params as a promise — unwrap safely.
  const { id } = (await props.params) as { id: string };

  const { data, error } = await supabase
    .from('shoe_versions')
    .select(`
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
    `)
    .eq('id', id)
    .single();

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">Error: {error.message}</p>
        <Link className="text-blue-600 underline" href="/shoes">
          ← Back to list
        </Link>
      </div>
    );
  }

  const row = (data ?? null) as QueryRow | null;
  const shoe = firstOrNull(row?.shoes);
  const spec = firstOrNull(row?.specs);

  return (
    <div className="p-6 space-y-4">
      <Link className="text-blue-600 underline" href="/shoes">
        ← Back to list
      </Link>

      <h1 className="text-2xl font-semibold">
        {shoe?.brand} {shoe?.model_name} {row?.version_name ? `(${row.version_name})` : ''}
      </h1>

      <div className="text-sm text-gray-900">
        <div>Year: {row?.release_year ?? '—'}</div>
        <div>Terrain: {shoe?.terrain ?? '—'}</div>
        <div>Category: {shoe?.category ?? '—'}</div>
      </div>

      <div className="rounded-lg border">
        <table className="min-w-[700px] w-full text-[15px] leading-6 text-gray-900">
          <thead className="bg-gray-100 text-gray-900">
            <tr>
              <Th>Spec</Th>
              <Th>Value</Th>
            </tr>
          </thead>
          <tbody>
            <Tr label="Weight (Men)">{spec?.weight_men != null ? `${spec.weight_men} g` : '—'}</Tr>
            <Tr label="Weight (Women)">{spec?.weight_women != null ? `${spec.weight_women} g` : '—'}</Tr>
            <Tr label="Stack (Heel)">{spec?.stack_height_heel != null ? `${spec.stack_height_heel} mm` : '—'}</Tr>
            <Tr label="Stack (Forefoot)">{spec?.stack_height_forefoot != null ? `${spec.stack_height_forefoot} mm` : '—'}</Tr>
            <Tr label="Drop">{spec?.drop != null ? `${spec.drop} mm` : '—'}</Tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 text-left font-medium border-b text-gray-900">
      {children}
    </th>
  );
}

function Tr({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="odd:bg-white even:bg-gray-50">
      <td className="px-3 py-2 border-b text-gray-900 w-48 font-medium">{label}</td>
      <td className="px-3 py-2 border-b text-gray-900">{children}</td>
    </tr>
  );
}
