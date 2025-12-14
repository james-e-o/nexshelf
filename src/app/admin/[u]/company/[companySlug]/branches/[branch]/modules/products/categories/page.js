"use client"

import { useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { ChevronDown, MoreHorizontal } from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

// ======================================================================
//  Dummy Category Data (12 categories)
// ======================================================================

const categoryData = [
  {
    id: "CAT-001",
    name: "Electronics",
    parent: null,
    slug: "electronics",
    description: "Devices, gadgets, and accessories.",
    status: "Active",
  },
  {
    id: "CAT-002",
    name: "Mobile Phones",
    parent: "Electronics",
    slug: "mobile-phones",
    description: "Smartphones and basic phones.",
    status: "Active",
  },
  {
    id: "CAT-003",
    name: "Laptops",
    parent: "Electronics",
    slug: "laptops",
    description: "Portable and gaming laptops.",
    status: "Active",
  },
  {
    id: "CAT-004",
    name: "Furniture",
    parent: null,
    slug: "furniture",
    description: "Office, home and outdoor furniture.",
    status: "Inactive",
  },
  {
    id: "CAT-005",
    name: "Office Chairs",
    parent: "Furniture",
    slug: "office-chairs",
    description: "Ergonomic workplace chairs.",
    status: "Active",
  },
  {
    id: "CAT-006",
    name: "Kitchen Appliances",
    parent: null,
    slug: "kitchen-appliances",
    description: "Home and commercial kitchen devices.",
    status: "Active",
  },
  {
    id: "CAT-007",
    name: "Blenders",
    parent: "Kitchen Appliances",
    slug: "blenders",
    description: "Electric food and drink blenders.",
    status: "Active",
  },
  {
    id: "CAT-008",
    name: "Accessories",
    parent: null,
    slug: "accessories",
    description: "General purpose accessories.",
    status: "Inactive",
  },
  {
    id: "CAT-009",
    name: "Computer Accessories",
    parent: "Accessories",
    slug: "computer-accessories",
    description: "Keyboards, mice, chargers etc.",
    status: "Active",
  },
  {
    id: "CAT-010",
    name: "Stationery",
    parent: null,
    slug: "stationery",
    description: "School and office stationery products.",
    status: "Active",
  },
  {
    id: "CAT-011",
    name: "Notebooks",
    parent: "Stationery",
    slug: "notebooks",
    description: "Writing notebooks and pads.",
    status: "Active",
  },
  {
    id: "CAT-012",
    name: "Smart Home",
    parent: "Electronics",
    slug: "smart-home",
    description: "Smart bulbs, hubs, and IoT items.",
    status: "Active",
  },
]

// ======================================================================
//  Table Columns — PURE JSX (NO TS)
// ======================================================================

export const columns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        className="ml-5"
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className="ml-5"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableHiding: false,
  },

  {
    accessorKey: "name",
    header: "Category Name",
  },

  {
    accessorKey: "parent",
    header: "Parent Category",
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.original.parent ?? "None"}
      </Badge>
    ),
  },

  {
    accessorKey: "slug",
    header: "Slug",
  },

  {
    accessorKey: "description",
    header: "Description",
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "Active" ? "default" : "destructive"}>
        {row.original.status}
      </Badge>
    ),
  },

  {
    id: "actions",
    header: "",
    cell: () => (
      <button className="p-2 hover:bg-muted rounded-md">
        <MoreHorizontal size={18} />
      </button>
    ),
  },
]

// ======================================================================
//  Category Table Component (JSX)
// ======================================================================

export default function CategoryTable() {
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data: categoryData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageSize: 200,
        pageIndex: 0,
      },
    },
  })

  return (
    <div className="overflow-hidden rounded-md text-xs text-neutral-800  border bg-card">
      <div className="flex items-center p-7">
        <Input
          placeholder="Search categories..."
          value={table.getColumn("name")?.getFilterValue() ?? ""}
          onChange={(e) =>
            table.getColumn("name")?.setFilterValue(e.target.value)
          }
          className="max-w-sm"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto text-xs h-7">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  className="capitalize"
                  checked={col.getIsVisible()}
                  onCheckedChange={(value) => col.toggleVisibility(!!value)}
                >
                  {col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Table className={'text-xs'}>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No categories found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
