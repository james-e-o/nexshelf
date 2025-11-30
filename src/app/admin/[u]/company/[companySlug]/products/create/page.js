'use client'

import React, { useState } from "react";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs,TabsTrigger,TabsList,TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet"
import {AlertDialog,AlertDialogAction,AlertDialogCancel,AlertDialogContent,AlertDialogDescription,AlertDialogFooter,AlertDialogHeader,AlertDialogTitle,AlertDialogTrigger,} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,} from "@/components/ui/command"
import {Popover,PopoverContent,PopoverTrigger,} from "@/components/ui/popover"
import { X ,Check, ChevronsUpDown, GripIcon, GripHorizontalIcon, ArrowRight, Upload} from "lucide-react"
import { useParams } from "next/navigation"
import AddImage from "@/components/add-image";

const CreateProductPage = () => {
    const [activeTab, setActiveTab] = useState("details");
    const params = useParams(); 
    const { u, companySlug } = params;
 

  return (
    <AlertDialog>
    <div className=' flex inset-0  bg-neutral-500 shadow-md shadow- absolute z-40 '>
        <div className='bg-white flex flex-col border-zinc-400 border absolute inset-2 shadow-0   overflow-clip rounded-lg'>



           <div className="relative w-full h-full flex flex-col">
                 <div className="flex items-center gap-4 border-b px-6 py-3 bg-white z-10">

                    {/* X Button */}
                    <Link href={`/admin/${u}/company/${companySlug}/products`}><Button variant={'ghost'} className="text-neutral-500 h-7 hover:text-black text-xs">✕</Button></Link>

                    {/* ESC Badge */}
                    <div className="px-2 py-[1px] border rounded-sm text-[10px] text-neutral-600">
                    esc
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-3 ml-3 text-xs font-medium">

                    {/* DETAILS */}
                    <Button variant={'outline'}
                        onClick={() => setActiveTab("details")}
                        className={`px-2 py-1 h-6 text-[11px] rounded-sm ${
                        activeTab === "details"
                            ? "bg-army text-neutral-50"
                            : "text-neutral-600"
                        }`}
                    >
                        <span className="top-[1px] relative">Details</span>
                    </Button>

                    <span className="text-neutral-300">|</span>

                    {/* ORGANIZE */}
                    <Button variant={'outline'}
                        onClick={() => setActiveTab("organize")}
                        className={`px-2 py-1 h-6 text-[11px] rounded-sm ${
                        activeTab === "organize"
                            ? "bg-army text-neutral-50"
                            : "text-neutral-600"
                        }`}
                    >
                        <span className="top-[1px] relative">Organize</span>
                    </Button>

                    <span className="text-neutral-300">|</span>

                    {/* VARIANTS */}
                    <Button variant={'outline'}
                        onClick={() => setActiveTab("variants")}
                        className={`px-2 py-1 h-6 text-[11px] rounded-sm ${
                        activeTab === "variants"
                            ? "bg-army text-neutral-50"
                            : "text-neutral-600"
                        }`}
                    >
                        <span className="top-[1px] relative">Variants</span>
                    </Button>
                    </div>
                </div>

                {/* ─── SCROLLABLE BODY ─────────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto pt-4">

                    <div className="mx-auto max-w-5xl space-y-10 text-xs text-neutral-900 pb-10">

                    {/* DETAILS TAB */}
                    {activeTab === "details" && (
                        <div className="space-y-10">

                        {/* GENERAL */}
                        <div className="space-y-5">
                            <h2 className="font-semibold text-xs">General</h2>

                            {/* 3-column section */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            {/* Title */}
                            <div className="flex flex-col space-y-1">
                                <label className="text-xs font-medium">Title</label>
                                <input
                                className="border rounded-sm px-2 py-2 text-xs"
                                placeholder="Winter jacket"
                                />
                            </div>

                            {/* Subtitle */}
                            <div className="flex flex-col space-y-1">
                                <label className="text-xs font-medium">
                                Subtitle <span className="text-neutral-400">(Optional)</span>
                                </label>
                                <input
                                className="border rounded-sm px-2 py-2 text-xs"
                                placeholder="Warm and cozy"
                                />
                            </div>

                            {/* Handle */}
                            <div className="flex flex-col space-y-1">
                                <label className="text-xs font-medium">
                                Handle <span className="text-neutral-400">(Optional)</span>
                                </label>
                                <div className="flex">
                                <span className="border border-r-0 rounded-sm rounded-r-none px-2 py-2 text-xs bg-neutral-100 text-neutral-500">
                                    /
                                </span>
                                <input
                                    className="border rounded-sm rounded-l-none px-2 py-2 text-xs w-full"
                                    placeholder="winter-jacket"
                                />
                                </div>
                            </div>
                            </div>

                            {/* Description */}
                            <div className="flex flex-col space-y-1">
                            <label className="text-xs font-medium">
                                Description <span className="text-neutral-400">(Optional)</span>
                            </label>
                            <textarea
                                rows={3}
                                className="border rounded-sm px-2 py-2 text-xs"
                                placeholder="A warm and cozy jacket"
                            ></textarea>
                            </div>

                            {/* Media uploader */}
                            <div>
                            <label className="text-xs font-medium">
                                Media <span className="text-neutral-400">(Optional)</span>
                            </label>
                            <div className="mt-2 border border-dashed rounded-sm h-40 flex flex-col items-center justify-center text-neutral-500">
                              
                              <AlertDialogTrigger asChild><Button variant={'ghost'} className="flex flex-col h-fit items-center justify-center gap-0.5">
                                <span className="text-lg mb-1"><Upload className="text-core size-4"/></span>
                                <span className="text-[11px] text-army">Click to Upload images</span>
                              </Button></AlertDialogTrigger>
                            </div>
                            </div>
                        </div>

                        {/* VARIANTS SECTION */}
                        <div className="space-y-5">
                            <h2 className="text-xs font-semibold">Variants</h2>

                            <div className="border rounded-sm px-4 py-3 space-y-1">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" defaultChecked className="scale-110" />
                                <span className="font-medium text-xs">
                                Yes, this is a product with variants
                                </span>
                            </div>
                            <p className="text-[10px] text-neutral-500">
                                When unchecked, we will create a default variant for you
                            </p>
                            </div>

                            <div className="space-y-2">
                            <h3 className="text-xs font-medium">Product options</h3>
                            <p className="text-[10px] text-neutral-500">
                                Define the options for the product, e.g. color, size, etc.
                            </p>

                            <Button className="border rounded-sm px-4 py-2 text-xs hover:bg-neutral-50 w-fit">
                                Add
                            </Button>
                            </div>
                        </div>
                        </div>
                    )}

                    {/* ORGANIZE TAB */}
                    {activeTab === "organize" && (
                        <div className="text-neutral-700 text-xs">
                        <h2 className="font-semibold mb-4">Organize</h2>
                        
                         <div className="space-y-4 text-xs text-gray-700">

                            {/* Discountable Toggle */}
                            <div className=" rounded-sm bg-white p-4 space-y-2">
                            <div className="flex items-center gap-3">
                                <input type="checkbox" className="toggle-checkbox" />
                                <div>
                                <p className="text-xs font-medium">Discountable</p>
                                <p className="text-gray-500 text-xs">
                                    When unchecked, discounts will not be applied to this product
                                </p>
                                </div>
                            </div>
                            </div>

                            {/* Type + Collection */}
                            <div className=" rounded-sm bg-white p-4 space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                <label className="text-gray-600 text-xs">Type (Optional)</label>
                                <select className="mt-1 w-full border rounded-sm p-2 text-xs">
                                    <option>Select product type</option>
                                </select>
                                </div>

                                <div className="flex-1">
                                <label className="text-gray-600 text-xs">Collection (Optional)</label>
                                <select className="mt-1 w-full border rounded-sm p-2 text-xs">
                                    <option>Select a collection</option>
                                </select>
                                </div>
                            </div>
                            </div>

                            {/* Categories + Tags */}
                            <div className=" rounded-sm bg-white p-4 space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                <label className="text-gray-600 text-xs">Categories (Optional)</label>
                                <select className="mt-1 w-full border rounded-sm p-2 text-xs">
                                    <option>Select category</option>
                                </select>
                                </div>

                                <div className="flex-1">
                                <label className="text-gray-600 text-xs">Tags (Optional)</label>
                                <select className="mt-1 w-full border rounded-sm p-2 text-xs">
                                    <option>Select tag</option>
                                </select>
                                </div>
                            </div>
                            </div>

                            {/* Shipping Profile */}
                            <div className=" rounded-sm bg-white p-4">
                            <label className="text-gray-600 text-xs">Shipping profile (Optional)</label>
                            <select className="mt-1 w-full border rounded-sm p-2 text-xs">
                                <option>Select shipping profile</option>
                            </select>
                            <p className="text-gray-500 text-[11px] mt-1">
                                Connect the product to a shipping profile
                            </p>
                            </div>

                            {/* Sales Channels */}
                            <div className=" rounded-sm bg-white p-4 space-y-3">
                            <p className="text-xs text-gray-500">
                                This product will only be available in the default sales channel if left untouched.
                            </p>

                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-1 bg-gray-200 rounded-sm text-[11px]">
                                Default Sales Channel
                                </span>
                                <button className="text-[11px] text-red-500">Clear all</button>
                            </div>

                            <button className="px-3 py-1 border rounded-sm text-xs w-fit">
                                Add
                            </button>
                            </div>

                        </div>
                        </div>
                    )}

                    {/* VARIANTS TAB */}
                    {activeTab === "variants" && (
                        <div className="text-neutral-700 text-xs">
                        <h2 className="font-semibold mb-4">Variants</h2>
                        <VariantTable />
                        </div>
                    )}
                    </div>
                </div>

                {/* FOOTER BUTTONS */}
                <div className="flex justify-end gap-2 border-t px-7 mr-3 py-3  bg-white">
                    <Button variant={'outline'} className="px-3 h-7 py-2 rounded-sm border text-xs">Cancel</Button>
                    <Button variant={''} className="px-3 h-7 py-2 bg-core rounded-sm border hover:bg-core/90 text-xs">Save as draft</Button>
                    <Button variant={''} className="px-3 h-7 py-2 bg-core rounded-sm hover:bg-core/90 text-white text-xs">
                    Continue
                    </Button>
                </div>
           </div>



        </div>
    </div>
      <AlertDialogContent  className="flex bg-white flex-col gap-0 p-0 overflow-hidden justify-between w-11/12 md:w-[80%] max-w-[90%] md:max-w-[80%] h-5/6 md:h-[87%]  rounded-lg ">
          <AlertDialogHeader>
            <AlertDialogTitle ></AlertDialogTitle>
            <AlertDialogDescription>
              <span className='md:mx-5 py-1 font-semibold text-xs text-start'>Media files</  span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AddImage />
          <AlertDialogFooter className={'p-3'}>
            <AlertDialogCancel className={'h-7 text-xs '} >Cancel</AlertDialogCancel>
            <AlertDialogAction className={'h-7 text-xs bg-core hover:bg-core/85'} >Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  )
}

export default CreateProductPage





// ---------------------- Dummy Variant Data ----------------------
const initialData = [
  { sizeColor: "small / red", title: "small / red", sku: "SM-RED", managed: false, backorder: false, kit: false, eur: "€", usd: "$", eur2: "€" },
  { sizeColor: "big / red", title: "big / red", sku: "BG-RED", managed: false, backorder: false, kit: false, eur: "€", usd: "$", eur2: "€" },
  { sizeColor: "medium / red", title: "medium / red", sku: "MD-RED", managed: false, backorder: false, kit: false, eur: "€", usd: "$", eur2: "€" },
  { sizeColor: "small / blue", title: "small / blue", sku: "SM-BLU", managed: false, backorder: false, kit: false, eur: "€", usd: "$", eur2: "€" },
  { sizeColor: "big / blue", title: "big / blue", sku: "BG-BLU", managed: false, backorder: false, kit: false, eur: "€", usd: "$", eur2: "€" },
  { sizeColor: "medium / blue", title: "medium / blue", sku: "MD-BLU", managed: false, backorder: false, kit: false, eur: "€", usd: "$", eur2: "€" },
  { sizeColor: "small / green", title: "small / green", sku: "SM-GRN", managed: false, backorder: false, kit: false, eur: "€", usd: "$", eur2: "€" },
  { sizeColor: "big / green", title: "big / green", sku: "BG-GRN", managed: false, backorder: false, kit: false, eur: "€", usd: "$", eur2: "€" },
  { sizeColor: "medium / green", title: "medium / green", sku: "MD-GRN", managed: false, backorder: false, kit: false, eur: "€", usd: "$", eur2: "€" }
];

// ---------------------- Column Definitions ----------------------
const columns = [
  {
    header: "Size / Color",
    accessorKey: "sizeColor",
    cell: ({ row }) => <span>{row.original.sizeColor}</span>,
  },
  {
    header: "Title",
    accessorKey: "title",
    cell: ({ row }) => <span>{row.original.title}</span>,
  },
  {
    header: "SKU",
    accessorKey: "sku",
    cell: ({ row, table }) => (
      <Input
        defaultValue={row.original.sku}
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
  {
    header: "Allow backorder",
    accessorKey: "backorder",
    cell: ({ row, table }) => (
      <Checkbox
        checked={row.original.backorder}
        onCheckedChange={(v) => table.options.meta.updateValue(row.index, "backorder", v)}
      />
    ),
  },
  {
    header: "Has inventory kit",
    accessorKey: "kit",
    cell: ({ row, table }) => (
      <Checkbox
        checked={row.original.kit}
        onCheckedChange={(v) => table.options.meta.updateValue(row.index, "kit", v)}
      />
    ),
  },
  {
    header: "Price EUR",
    accessorKey: "eur",
    cell: ({ row, table }) => (
      <Input
        defaultValue={row.original.eur}
        onChange={(e) => table.options.meta.updateValue(row.index, "eur", e.target.value)}
        className="h-8"
      />
    ),
  },
  {
    header: "Price USD",
    accessorKey: "usd",
    cell: ({ row, table }) => (
      <Input
        defaultValue={row.original.usd}
        onChange={(e) => table.options.meta.updateValue(row.index, "usd", e.target.value)}
        className="h-8"
      />
    ),
  },
  {
    header: "Price Europe",
    accessorKey: "eur2",
    cell: ({ row, table }) => (
      <Input
        defaultValue={row.original.eur2}
        onChange={(e) => table.options.meta.updateValue(row.index, "eur2", e.target.value)}
        className="h-8"
      />
    ),
  },
];

// ---------------------- Table Component ----------------------
export  function VariantTable() {
  const [data, setData] = useState(initialData);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateValue: (rowIndex, columnId, value) => {
        setData((old) =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return { ...row, [columnId]: value };
            }
            return row;
          })
        );
      },
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
