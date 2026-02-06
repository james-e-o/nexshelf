import React, { useMemo, useState, useEffect, useRef } from 'react'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const EditableCell = ({ row, column, table, getValue }) => {
  const initialValue = getValue()
  const [value, setValue] = useState(initialValue)
  const updateData = () => table.options.meta?.updateValue(row.index, column.id, value)
  
  return (
    <input 
      value={value} 
      onBlur={updateData} 
      className="w-full h-7 px-1 text-center rounded-sm bg-white/35 outline-none border text-xs border-zinc-400" 
      onChange={({ target }) => setValue(target.value)} 
    />
  )
}

export function VariantTable({ combinations = [], costPrice, pricingContexts, updateValue, productType = 'physical' }) {
  // track pending edits per row index: { rowIndex: { sku: 'value', ... }, ... }
  const [pendingEdits, setPendingEdits] = useState({})
  const [allTracked, setAllTracked] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [openContextId, setOpenContextId] = useState(pricingContexts && pricingContexts.length > 0 ? pricingContexts[0].id : null)
  const pendingEditsRef = useRef(pendingEdits)

  useEffect(() => {
    pendingEditsRef.current = pendingEdits
  }, [pendingEdits])

  // Update openContextId when pricingContexts change
  useEffect(() => {
    if (pricingContexts && pricingContexts.length > 0) {
      setOpenContextId(pricingContexts[0].id)
    }
  }, [pricingContexts])

  // Handle context switch - only one context can be open at a time
  const handleContextSwitch = (contextId) => {
    setOpenContextId(openContextId === contextId ? null : contextId)
  }

  const baseColumns = [
   
    {
      accessorKey: "details",
      id: "details",
      header: () => (
        <div className="grid grid-cols-4 gap-0 min-w-xl bg-white h-full">
          {/* Variant Header */}
          <div className="flex items-center justify-center border-r border-gray-200 p-2">
            <p className="text-[11px] text-center font-medium">{productType === 'service' ? "Quality Tier" : "Variant"}</p>
          </div>
          {/* SKU Header */}
          <div className="flex items-center justify-center border-r border-gray-200 p-2">
            <p className="text-[11px] text-center font-medium">SKU</p>
          </div>
          {/* Tracked Header */}
          <div className="flex items-center justify-center border-r border-gray-200 p-2">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-medium">Tracked</span>
            </div>
          </div>
          {/* Cost Price Header */}
          <div className="flex items-center justify-center p-2">
            <p className="text-[11px] text-center font-medium">Cost Price</p>
          </div>
        </div>
      ),
      cell: ({ row, table }) => (
        <div className="grid grid-cols-4 gap-0 min-w-xl bg-white h-full">
          {/* Variant Cell */}
          <div className="flex items-center justify-center border-r border-gray-100 p-2">
            <div className="text-sm">{row.original.variant}</div>
          </div>
          {/* SKU Cell */}
          <div className="flex items-center justify-center border-r border-gray-100 p-2">
            <Input
              defaultValue={(pendingEdits[row.index]?.sku) ?? row.original.sku}
              onBlur={(e) => {
                const val = e.target.value ?? row.original.sku
                updateValue(row.index, "sku", val)
                setPendingEdits(prev => ({ ...prev, [row.index]: { ...(prev[row.index] || {}), sku: val } }))
              }}
              className="h-7 w-34 text-[11px]"
            />
          </div>
          {/* Tracked Cell */}
          <div className="flex items-center justify-center border-r border-gray-100 p-2">
            <Checkbox
              className="scale-100"
              checked={row.original.managed}
              onCheckedChange={(v) => updateValue(row.index, "managed", v)}
            />
          </div>
          {/* Cost Price Cell */}
          <div className="flex items-center justify-center p-2">
            <span className="text-[11px]">{costPrice || '-'}</span>
          </div>
        </div>
      ),
      size: 850,
    },
  ];

  // Create grouped columns for each pricing context
  const pricingContextColumns = pricingContexts && pricingContexts.length > 0
    ? pricingContexts
        .filter(context => openContextId === context.id)
        .map(context => ({
          header: context.name,
          id: `group_${context.id}`,
          columns: [
            {
              header: () => (
                <div className="flex flex-col gap-1 justify-start items-center">
                  <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded w-fit">{context.name}</span>
                  <span className='text-xs'>Margin %</span>
                </div>
              ),
              accessorKey: `${context.id}_margin_percentage`,
              cell: ({ row, column, table, getValue }) => <EditableCell row={row} column={column} table={table} getValue={getValue} />,
            },
            {
              header: () => (
                <div className="flex flex-col gap-1 justify-start items-center">
                  <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded w-fit">{context.name}</span>
                  <span className='text-xs'>Margin<br/> Value</span>
                </div>
              ),
              accessorKey: `${context.id}_margin_value`,
              cell: ({ row, column, table, getValue }) => <EditableCell row={row} column={column} table={table} getValue={getValue} />,
              // size: 90,
            },
            {
              header: () => (
                <div className="flex flex-col gap-1 justify-start items-center">
                  <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded w-fit">{context.name}</span>
                  <span className='text-xs'>Selling <br/> Price</span>
                </div>
              ),
              accessorKey: `${context.id}_selling_price`,
              cell: ({ row, column, table, getValue }) => <div className="w-"><EditableCell row={row} column={column} table={table} getValue={getValue} /></div>,
              // size: 110,
            },
            {
              header: () => (
                <div className="flex flex-col gap-1 justify-start items-center">
                  <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded w-fit">{context.name}</span>
                  <span className='text-xs text-center'>Bulk <br/> Reduction %</span>
                </div>
              ),
              accessorKey: `${context.id}_bulk_reduction_percentage`,
              cell: ({ row, column, table, getValue }) => <EditableCell row={row} column={column} table={table} getValue={getValue} />,
              // size: 75,
            },
            {
              header: () => (
                <div className="flex flex-col gap-1 justify-start items-center">
                  <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded w-fit">{context.name}</span>
                  <span className='text-xs text-center'>Bulk <br/>Reduction Value</span>
                </div>
              ),
              accessorKey: `${context.id}_bulk_reduction_value`,
              cell: ({ row, column, table, getValue }) => <EditableCell row={row} column={column} table={table} getValue={getValue} />,
              // size: 80,
            },
            {
              header: () => (
                <div className="flex flex-col gap-1 justify-start items-center">
                  <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded w-fit">{context.name}</span>
                  <span className='text-xs text-center'>Bulk <br/> Price</span>
                </div>
              ),
              accessorKey: `${context.id}_bulk_price`,
              cell: ({ row, column, table, getValue }) => <EditableCell row={row} column={column} table={table} getValue={getValue} />,
              // size: 85,
            },
          ],
        }))
    : [];

  const columns = [...baseColumns, ...pricingContextColumns];

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
    return combinations.map((combo) => {
      const baseData = {
        variant: combo.combination.length > 0 ? combo.combination.map(item => `${item.value}`).join(' / ') : 'Product',
        sku: combo.sku || '',
        managed: combo.managed || false,
        costPrice: costPrice || '',
      };

      // Add pricing context fields for each context
      const pricingData = pricingContexts && pricingContexts.length > 0
        ? pricingContexts.reduce((acc, context) => ({
            ...acc,
            [`${context.id}_margin_percentage`]: combo[`${context.id}_margin_percentage`] || '',
            [`${context.id}_margin_value`]: combo[`${context.id}_margin_value`] || '',
            [`${context.id}_selling_price`]: combo[`${context.id}_selling_price`] || '',
            [`${context.id}_bulk_reduction_percentage`]: combo[`${context.id}_bulk_reduction_percentage`] || '',
            [`${context.id}_bulk_reduction_value`]: combo[`${context.id}_bulk_reduction_value`] || '',
            [`${context.id}_bulk_price`]: combo[`${context.id}_bulk_price`] || '',
          }), {})
        : {};

      return { ...baseData, ...pricingData };
    });
  }, [combinations, pricingContexts, costPrice]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    meta: {
      updateValue: updateValue,
    },
  });

  return (
    <div className="w-full border rounded-md overflow-hidden flex flex-col h-full">
      {/* Pricing Context Selector - Buttons */}
      {pricingContexts && pricingContexts.length > 0 && (
        <div className="p-3 bg-white border-b flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">Pricing Context:</span>
          {pricingContexts.map(context => (
            <Button
              key={context.id}
              variant={openContextId === context.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleContextSwitch(context.id)}
              className={openContextId === context.id ? "bg-army h-7 text-xs ml-1.5 text-white hover:bg-armylight" : ""}
            >
              {context.name}
            </Button>
          ))}
        </div>
      )}
      
      {/* Horizontal scroll container for pricing context columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">

      
      <Table className="w-full min-w-max text-xs border-collapse">
        <TableHeader className="sticky top-0 z-20">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="h-fit">
              {headerGroup.headers.map((header) => {
                const isDetails = header.id === 'details'
                return (
                  <TableHead
                    data-value={header.id}
                    className={`p-2 text-left font-medium border-r border-gray-200 whitespace-nowrap bg-white ${
                      isDetails ? 'sticky left-0 z-40 shadow-sm' : ''
                    }`}
                    key={header.id}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="bg-white border-b hover:bg-gray-50"
              >
                {row.getVisibleCells().map((cell) => {
                  const isDetails = cell.column.id === 'details'
                  return (
                    <TableCell
                      data-state={row.getIsSelected() && 'selected'}
                      className={`p-2 align-middle border-r border-gray-100 whitespace-nowrap ${
                        isDetails
                          ? 'sticky left-0 z-30 bg-white'
                          : ''
                      }`}
                      key={cell.id}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 whitespace-nowrap text-center">
                No variants found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
        {/* <div className='border-b-orange-400 h-10 w-[2000px]'></div> */}
     </div>
    </div>
  );
}

