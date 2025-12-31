import React, { useMemo } from 'react'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'

export function VariantTable({ combinations = [], currencies, updateValue, baseCurrency, exchangeRates, manualPricing }) {
  const baseColumns = [
    {
      header: "Variant",
      accessorKey: "variant",
      cell: ({ row }) => <span>{row.original.variant}</span>,
    },
    {
      header: "SKU",
      accessorKey: "sku",
      cell: ({ row, table }) => (
        <Input
          value={row.original.sku}
          onChange={(e) => table.options.meta.updateValue(row.index, "sku", e.target.value)}
          className="h-8"
        />
      ),
    },
    {
      header: "Managed inventory",
      accessorKey: "managed",
      cell: ({ row, table }) => (
        <Checkbox
          checked={row.original.managed}
          onCheckedChange={(v) => table.options.meta.updateValue(row.index, "managed", v)}
        />
      ),
    },
  ];

  const priceColumns = currencies.map(currency => ({
    header: `Price ${currency}${currency === baseCurrency ? '' : ` (${exchangeRates[currency]?.rate || ''})`}`,
    accessorKey: currency.toLowerCase(),
    cell: ({ row, table }) => (
      <Input
        value={row.original[currency.toLowerCase()] || ''}
        onChange={(e) => table.options.meta.updateValue(row.index, currency.toLowerCase(), e.target.value)}
        className="h-8"
        disabled={!manualPricing}
      />
    ),
  }));

  const columns = [...baseColumns, ...priceColumns];

  const data = useMemo(() => {
    return combinations.map((combo) => ({
      variant: combo.combination.length > 0 ? combo.combination.map(item => `${item.optionName}: ${item.value}`).join(' / ') : 'Product',
      sku: combo.sku || '',
      managed: combo.managed || false,
      ...currencies.reduce((acc, curr) => ({ ...acc, [curr.toLowerCase()]: combo[curr.toLowerCase()] || '' }), {})
    }));
  }, [combinations, currencies]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateValue: updateValue,
    },
  });

  return (
    <div className="w-full border rounded-md">
      <table className="w-full text-xs">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b">
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="p-3 text-left font-medium">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b hover:bg-muted/50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-3 align-middle">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

