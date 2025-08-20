// src/app/compare/page.tsx
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

type Row = {
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

function fmt(n: number | null, unit: 'g' | 'mm' | '') {
    if (n == null) return '—';
    return unit ? `${n} ${unit}` : String(n);
}

type SearchParams = Record<string, string | string[] | undefined>;

export default async function ComparePage(
  { searchParams }: { searchParams: Promise<SearchParams> }
) {
  const sp = await searchParams;

  const idsParam = sp.ids;
  const idsStr =
    typeof idsParam === 'string'
      ? idsParam
      : Array.isArray(idsParam)
      ? idsParam[0] ?? ''
      : '';

  const ids = idsStr.split(',').filter(Boolean).slice(0, 4);

    // Fetch the selected versions with joined shoe + specs
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
        .in('id', ids);

    if (error) {
        return <div className="p-6 text-red-600">Error: {error.message}</div>;
    }

    // Preserve order from the URL
    const rows = (data ?? []) as Row[];
    const map = new Map(rows.map((r) => [r.id, r]));
    const cols = ids.map((id) => map.get(id)).filter(Boolean) as Row[];

    return (
        <div className="p-6">
            <div className="mb-4">
                <Link href="/shoes" className="text-blue-600 underline">← Back to list</Link>
            </div>

            <h1 className="text-2xl font-semibold mb-4">Compare Shoes</h1>

            <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-[900px] w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <Th>Spec</Th>
                            {cols.map((c) => {
                                const s = firstOrNull(c.shoes);
                                return (
                                    <Th key={c.id}>
                                        {s?.brand ?? '—'} {s?.model_name ?? '—'} {c.version_name ? `(${c.version_name})` : ''}
                                    </Th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        <SpecRow label="Release Year" values={cols.map((c) => c.release_year ?? null)} unit="" />
                        <SpecRowText label="Terrain" values={cols.map((c) => firstOrNull(c.shoes)?.terrain ?? '')} />
                        <SpecRowText label="Category" values={cols.map((c) => firstOrNull(c.shoes)?.category ?? '')} />
                        <SpecRow label="Weight (Men)" values={cols.map((c) => firstOrNull(c.specs)?.weight_men ?? null)} unit="g" />
                        <SpecRow label="Weight (Women)" values={cols.map((c) => firstOrNull(c.specs)?.weight_women ?? null)} unit="g" />
                        <SpecRow label="Heel Stack" values={cols.map((c) => firstOrNull(c.specs)?.stack_height_heel ?? null)} unit="mm" />
                        <SpecRow label="Forefoot Stack" values={cols.map((c) => firstOrNull(c.specs)?.stack_height_forefoot ?? null)} unit="mm" />
                        <SpecRow label="Drop" values={cols.map((c) => firstOrNull(c.specs)?.drop ?? null)} unit="mm" />
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function Th({ children }: { children: React.ReactNode }) {
    return <th className="px-3 py-2 text-left font-medium border-b border-gray-200">{children}</th>;
}

function SpecRow({
    label,
    values,
    unit,
}: {
    label: string;
    values: (number | null)[];
    unit: 'g' | 'mm' | '';
}) {
    return (
        <tr className="odd:bg-white even:bg-gray-50">
            <td className="px-3 py-2 border-b border-gray-200 w-48 font-medium">{label}</td>
            {values.map((v, i) => (
                <td key={i} className="px-3 py-2 border-b border-gray-200">
                    {fmt(v, unit)}
                </td>
            ))}
        </tr>
    );
}

function SpecRowText({
    label,
    values,
}: {
    label: string;
    values: string[];
}) {
    return (
        <tr className="odd:bg-white even:bg-gray-50">
            <td className="px-3 py-2 border-b border-gray-200 w-48 font-medium">{label}</td>
            {values.map((v, i) => (
                <td key={i} className="px-3 py-2 border-b border-gray-200 capitalize">
                    {v || '—'}
                </td>
            ))}
        </tr>
    );
}
