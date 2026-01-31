import React, { useMemo, useState, useEffect, useRef } from 'react'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'

export function VariantTable({ combinations = [], costPrice, pricingContexts, updateValue }) {
  // track pending edits per row index: { rowIndex: { sku: 'value', ... }, ... }
  const [pendingEdits, setPendingEdits] = useState({})
  const [allTracked, setAllTracked] = useState(false)
  const pendingEditsRef = useRef(pendingEdits)

  useEffect(() => {
    pendingEditsRef.current = pendingEdits
  }, [pendingEdits])
  // useEffect(() => {
  //   console.log(updateValue)
  // }, [updateValue])

  const baseColumns = [
    {
      header: "Variant",
      accessorKey: "variant",
      cell: ({ row }) => <span>{row.original.variant}</span>,
    },
    {
      header: "SKU",
      accessorKey: "sku",
      cell: ({ row, table }) => {
        const skuRef = useRef(null)
        return (
          <Input
            ref={skuRef}
            defaultValue={(pendingEdits[row.index]?.sku) ?? row.original.sku}
            onBlur={() => {
              const val = skuRef.current?.value ?? row.original.sku
              table.options.meta.updateValue(row.index, "sku", val)
              setPendingEdits(prev => ({ ...prev, [row.index]: { ...(prev[row.index] || {}), sku: val } }))
            }}
            className="h-8"
          />
        )
      },
    },
    {
      header: () => (
        <div className="flex items-center gap-1">
          <Checkbox
            className="size-4"
            checked={allTracked}
            onCheckedChange={(v) => {
              setAllTracked(v)
              combinations.forEach((_, idx) => {
                updateValue(idx, "managed", v)
              })
            }}
          />
          <p className="flex text-[11px] flex-col gap-0">
            <span>Tracked</span>
            <span className="text-muted-foreground">Inventory</span>
          </p>
        </div>
      ),
      accessorKey: "managed",
      cell: ({ row, table }) => (
        <p className="flex justify-center">
          <Checkbox
            className="size-6 text-center"
            checked={row.original.managed}
            onCheckedChange={(v) => table.options.meta.updateValue(row.index, "managed", v)}
          />
        </p>
      ),
    },
    {
      header: "Cost Price",
      accessorKey: "costPrice",
      cell: ({ row }) => (
        <Input
          value={costPrice || ''}
          disabled
          className="h-8 bg-gray-100"
        />
      ),
    },
    {
      header: "Bulk Quantity",
      accessorKey: "bulkQuantity",
      cell: ({ row, table }) => {
        const bulkQtyRef = useRef(null)
        return (
          <Input
            ref={bulkQtyRef}
            defaultValue={(pendingEdits[row.index]?.bulkQuantity) ?? row.original.bulkQuantity}
            onBlur={() => {
              const val = bulkQtyRef.current?.value ?? row.original.bulkQuantity
              table.options.meta.updateValue(row.index, "bulkQuantity", val)
              setPendingEdits(prev => ({ ...prev, [row.index]: { ...(prev[row.index] || {}), bulkQuantity: val } }))
            }}
            className="h-8"
            type="number"
          />
        )
      },
    },
  ];

  const priceColumns = pricingContexts && pricingContexts.length > 0
    ? pricingContexts.map(context => ({
        header: context.name,
        accessorKey: context.id,
        cell: ({ row, table }) => {
          const priceRef = useRef(null)
          const contextKey = `price_${context.id}`
          return (
            <Input
              ref={priceRef}
              defaultValue={(pendingEdits[row.index]?.[contextKey]) ?? (row.original[contextKey] || '')}
              onBlur={() => {
                const val = priceRef.current?.value ?? (row.original[contextKey] || '')
                table.options.meta.updateValue(row.index, contextKey, val)
                setPendingEdits(prev => ({ ...prev, [row.index]: { ...(prev[row.index] || {}), [contextKey]: val } }))
              }}
              className="h-8"
            />
          )
        },
      }))
    : [];

  const columns = [...baseColumns, ...priceColumns];

  // Preserve pending edits when combinations change; only clear edits for rows beyond the new combination count
  useEffect(() => {
    setPendingEdits(prev => {
      const next = { ...prev }
      // Remove edits for rows that no longer exist
      Object.keys(next).forEach(idx => {
        if (parseInt(idx) >= combinations.length) {
          delete next[idx]
        }
      })
      return next
    })
  }, [combinations.length])

  const data = useMemo(() => {
    return combinations.map((combo) => ({
      variant: combo.combination.length > 0 ? combo.combination.map(item => `${item.value}`).join(' / ') : 'Product',
      sku: combo.sku || '',
      managed: combo.managed || false,
      costPrice: costPrice || '',
      bulkQuantity: combo.bulkQuantity || '',
      ...(pricingContexts && pricingContexts.reduce((acc, context) => ({
        ...acc,
        [`price_${context.id}`]: combo[`price_${context.id}`] || ''
      }), {}))
    }));
  }, [combinations, pricingContexts, costPrice]);

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
