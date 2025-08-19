// src/app/shoes/page.tsx
import { supabase } from '@/lib/supabase';
import ShoesTable, { UiRow } from './shoes-table';

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

export default async function ShoesPage() {
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
    .order('brand', { ascending: true, foreignTable: 'shoes' })
    .order('model_name', { ascending: true, foreignTable: 'shoes' });

  if (error) {
    return <div className="p-6 text-red-600">Error: {error.message}</div>;
  }

  const rows = ((data ?? []) as QueryRow[]).map<UiRow>((r) => {
    const shoe = firstOrNull(r.shoes);
    const spec = firstOrNull(r.specs);
    return {
      id: r.id,
      brand: shoe?.brand ?? '',
      model: shoe?.model_name ?? '',
      version: r.version_name ?? '',
      year: r.release_year ?? null,
      terrain: shoe?.terrain ?? '',
      category: shoe?.category ?? '',
      weight_men: spec?.weight_men ?? null,
      weight_women: spec?.weight_women ?? null,
      heel: spec?.stack_height_heel ?? null,
      forefoot: spec?.stack_height_forefoot ?? null,
      drop: spec?.drop ?? null,
    };
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Shoes (Versions + Specs)</h1>
      <ShoesTable rows={rows} />
      <p className="mt-3 text-xs text-gray-500">
        Click a column header to sort. Units are shown for readability.
      </p>
    </div>
  );
}
