'use client'

import React, { useState, useEffect, useRef } from "react";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs,TabsTrigger,TabsList,TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link"
import { Label } from "@/components/ui/label"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet"
import {AlertDialog,AlertDialogAction,AlertDialogCancel,AlertDialogContent,AlertDialogDescription,AlertDialogFooter,AlertDialogHeader,AlertDialogTitle,AlertDialogTrigger,} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,} from "@/components/ui/command"
import {Popover,PopoverContent,PopoverTrigger,} from "@/components/ui/popover"
import { X ,Check, ChevronsUpDown, GripIcon,GripVertical,GripHorizontal, GripHorizontalIcon, ArrowRight, Upload} from "lucide-react"
import { useParams } from "next/navigation"
import AddImage from "@/components/add-image";
import { supabase } from "../../../../../../../../../../../config/supabaseClient";
import { set } from "date-fns";

const CreateProductPage = () => {
    const [activeTab, setActiveTab] = useState("details");
    const params = useParams(); 
    const { u, companySlug,branch } = params;
    const [hasVariants, setHasVariants] = useState(true);
    const [variantCombinations, setVariantCombinations] = useState([]);

    // Options state
    const [options, setOptions] = useState([]);
    const InputRefs = useRef([]);


    //Inputs Values State
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [handle, setHandle] = useState('');
    const [description, setDescription] = useState('');

    // Generate combinations
    const generateCombinations = (optionsets) => {
        const validOptions = optionsets.filter(opt => opt.name && opt.values.length > 0);
        if (validOptions.length === 0) return [];
        let combinations = [[]];
        for (let option of validOptions) {
            let newCombinations = [];
            for (let combo of combinations) {
                for (let value of option.values) {
                    newCombinations.push([...combo, { optionName: option.name, value }]);
                }
            }
            combinations = newCombinations;
        }
        return combinations.map((combo) => ({ combination: combo, id: combo.map(item => `${item.optionName}-${item.value}`).join('-') }));
    };

    useEffect(() => {
        setVariantCombinations(generateCombinations(options));
    }, [options]);

    // Functions for combinations
    const moveCombination = (fromIndex, toIndex) => {
        const newCombos = [...variantCombinations];
        const [moved] = newCombos.splice(fromIndex, 1);
        newCombos.splice(toIndex, 0, moved);
        setVariantCombinations(newCombos);
    };

    // Functions to handle options
    const addOption = () => {
        setOptions([...options, { id: Date.now(), name: '', values: [], Input: '' }]);
    };

    const removeOption = (index) => {
        setOptions(options.filter((_, i) => i !== index));
    };

    const updateOptionName = (index, name) => {
        setOptions(options.map((opt, i) => i === index ? { ...opt, name } : opt));
    };

    const updateOptionInput = (index, Input) => {
        setOptions(options.map((opt, i) => i === index ? { ...opt, Input } : opt));
    };

    const addValue = (index) => {
        const opt = options[index];
        if (opt.Input.trim()) {
            setOptions(options.map((o, i) => i === index ? { ...o, values: [...o.values, o.Input.trim()], Input: '' } : o));
        }
    };

    const removeValue = (index, valIndex) => {
        setOptions(options.map((o, i) => i === index ? { ...o, values: o.values.filter((_, vi) => vi !== valIndex) } : o));
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addValue(index);
            InputRefs.current[index]?.focus();
        }
    };

     function convertToSlug(input) {
      let newValue= input.toString().toLowerCase().replace(/['"]/g, '').trim().replace(/\band\b/g, '&').replace(/[^a-z0-9\&-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').replace(/&/g, 'and') 
      return(newValue)
    }
    function capitalize(input) {
      let newValue= input.toString().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ').replace(/\bAnd\b/g, '&')
      return(newValue)
    }

  return (
    <AlertDialog>
    <div className=' flex font-WixMade inset-0  bg-neutral-500 shadow-md shadow- absolute z-40 '>
        <div className='bg-white flex flex-col border-zinc-400 border absolute inset-2 shadow-0   overflow-clip rounded-lg'>



           <div className="relative w-full h-full flex flex-col">
                 <div className="flex items-center gap-4 border-b px-6 py-3 bg-white z-10">

                    {/* X Button */}
                    <Link href={`/admin/${u}/company/${companySlug}/branches/${branch}/modules/products`}><Button variant={'ghost'} className="text-neutral-500 h-7 hover:text-black text-xs">✕</Button></Link>

                    {/* ESC Badge */}
                    <div className="px-2 py-px border rounded-sm text-[10px] text-neutral-600">
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
                        <span className="top-px relative">Details</span>
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
                        <span className="top-px relative">Organize</span>
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
                        <span className="top-px relative">Variants</span>
                    </Button>
                    </div>
                </div>

                {/* ─── SCROLLABLE BODY ─────────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto pt-4">

                    <div className="mx-auto max-w-5xl space-y-10 text-xs text-neutral-900 pb-10">

                    {/* DETAILS TAB */}
                    {activeTab === "details" && (
                        <div className="space-y-10 py-9">

                        {/* GENERAL */}
                        <div className="space-y-5 mx-8">
                            <h2 className="font-semibold text-sm">General</h2>

                            {/* 3-column section */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            {/* Title */}
                            <div className="flex flex-col space-y-1">
                                <label className="text-xs font-medium">Title</label>
                                <Input className="border rounded-sm px-2 py-2 text-xs" placeholder="Winter jacket" value={title} onChange={({target})=>{setTitle(capitalize(target.value),setHandle(convertToSlug(target.value)))}}/>
                            </div>

                            {/* Subtitle */}
                            <div className="flex flex-col space-y-1">
                                <label className="text-xs font-medium">
                                Subtitle <span className="text-neutral-400">(Optional)</span>
                                </label>
                                <Input className="border rounded-sm px-2 py-2 text-xs"  placeholder="Warm and cozy" value={subtitle}  onChange={({target})=>{setSubtitle(target.value)}}/>
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
                                <Input className="border rounded-sm rounded-l-none px-2 py-2 text-xs w-full" value={handle}  onChange={({target})=>{setHandle(convertToSlug(target.value))}}   placeholder="winter-jacket" />
                                </div>
                            </div>
                            </div>

                            {/* Description */}
                            <div className="flex flex-col space-y-1">
                            <label className="text-xs font-medium">
                                Description <span className="text-neutral-400">(Optional)</span>
                            </label>
                            <Textarea
                                rows={4}
                                className="border rounded-sm px-2 py-2 text-xs"
                                placeholder="A warm and cozy jacket"
                            ></Textarea>
                            </div>

                            {/* Media uploader */}
                            <div>
                            <label className="text-xs font-medium">
                                Media <span className="text-neutral-400">(Optional)</span>
                            </label>
                            <div className="mt-2 border border-dashed rounded-sm h-24 flex flex-col items-center justify-center text-neutral-500">
                              
                              <AlertDialogTrigger asChild><Button variant={'ghost'} className="flex flex-col h-fit items-center justify-center gap-0.5">
                                <span className="text-lg mb-1"><Upload className="text-core size-4"/></span>
                                <span className="text-[11px] text-army">Click to Upload images</span>
                              </Button></AlertDialogTrigger>
                            </div>
                            </div>
                        </div>

                        {/* VARIANTS SECTION */}
                          <div className="space-y-5 mx-8">
                              <h2 className="text-xs font-semibold">Variants</h2>

                              <div className="border rounded-sm px-4 py-3 space-y-1">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        className={''}
                                        checked={hasVariants}
                                        onCheckedChange={setHasVariants}
                                    />
                                    <span className="font-medium text-xs">
                                    Yes, this is a product with variants
                                    </span>
                                </div>
                                <p className="text-[10px] text-neutral-500">
                                    When unchecked, we will create a default variant for you
                                </p>
                              </div>

                              <div className={hasVariants ? "grid grid-rows-[1fr] transition-all duration-300" : "grid grid-rows-[0fr] transition-all duration-300"}>
                                <div className="overflow-hidden">
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <h3 className="text-xs font-medium">Product options</h3>
                                      <p className="text-[10px] text-neutral-500">
                                          Define the options for the product, e.g. color, size, etc.
                                      </p>

                                      <Button className="border rounded-sm px-4 text-white h-7 bg-army text-xs hover:bg-army/85 w-fit" onClick={addOption}>
                                          Add
                                      </Button>
                                    </div>

                                    {/* Dynamic Options */}
                                    {options.map((option, index) => (
                                      <div key={option.id} className="border rounded-sm">
                                        <div className="flex items-center justify-between px-4 py-3 border-b">
                                          <Input
                                            type="text"
                                            defaultValue={option.name}
                                            onInput={(e) => {
                                              e.target.value = e.target.value.toUpperCase();
                                              updateOptionName(index, e.target.value);
                                            }}
                                            className="font-medium text-xs border-0 outline-0 flex-1"
                                            placeholder="Option name"
                                          />
                                          <Button variant="ghost" size="sm" onClick={() => removeOption(index)} className="h-6 w-6 p-0">
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                        <div className="px-4 py-3 space-y-2">
                                          <label className="text-xs font-medium">Values</label>
                                          <Input
                                            ref={(el) => InputRefs.current[index] = el}
                                            type="text"
                                            value={option.Input}
                                            onChange={(e) => updateOptionInput(index, e.target.value.toLowerCase())}
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                            className="w-full border-0 outline-0 text-xs placeholder-neutral-400"
                                            placeholder="Add values..."
                                          />
                                          <div className="flex flex-wrap gap-2">
                                            {option.values.map((value, valIndex) => (
                                              <span key={valIndex} className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 rounded-sm text-xs">
                                                {value}
                                                <button onClick={() => removeValue(index, valIndex)} className="text-neutral-500 hover:text-neutral-700">
                                                  <X className="h-3 w-3" />
                                                </button>
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {options.length > 0 && (
                                <div className="mt-4">
                                  <h3 className="text-xs mb-2 font-medium">Variant Combinations <span className="text-[10px] ml-1 text-core italic">{`(drag and drop to modify hierarchy)`}</span></h3>
                                  <DndProvider backend={HTML5Backend}>
                                    <div className="space-y-2">
                                      {variantCombinations.map((combo, index) => (
                                        <DraggableCombination
                                          key={combo.id}
                                          combo={combo}
                                          index={index}
                                          moveCombination={moveCombination}
                                        />
                                      ))}
                                    </div>
                                  </DndProvider>
                                </div>
                              )}
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
                                <Input type="checkbox" className="toggle-checkbox" />
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
                        <VariantTable options={options} />
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
      <AlertDialogContent  className="flex duration-100 bg-white flex-col gap-0 p-0 overflow-hidden justify-between w-11/12 md:w-[83%] max-w-[90%] md:max-w-[80%] h-5/6 md:h-[87%]  rounded-lg ">
          <AlertDialogHeader>
            <AlertDialogTitle ></AlertDialogTitle>
            <AlertDialogDescription>
              <span className='md:mx-5 py-1 font-semibold text-xs text-start'>Media files</  span>
            </AlertDialogDescription>
          </AlertDialogHeader>

            <AddImage />
         
        </AlertDialogContent>
    </AlertDialog>
  )
}

export default CreateProductPage



// ---------------------- Column Definitions ----------------------
const columns = [
  {
    header: "Variant",
    accessorKey: "variant",
    cell: ({ row }) => <span>{row.original.sizeColor}</span>,
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
export  function VariantTable({ options }) {
  // Generate combinations from options
  const generateCombinations = (optionsets) => {
    const validOptions = optionsets.filter(opt => opt.name && opt.values.length > 0);
    if (validOptions.length === 0) return [];
    let combinations = [[]];
    for (let option of validOptions) {
      let newCombinations = [];
      for (let combo of combinations) {
        for (let value of option.values) {
          newCombinations.push([...combo, { optionName: option.name, value }]);
        }
      }
      combinations = newCombinations;
    }
    return combinations;
  };

  const combinations = generateCombinations(options);
  const data = combinations.map((combo, index) => ({
    variant: combo.map(item => item.value).join(' / '),
    sku: '',
    managed: false,
    eur: '€',
    usd: '$',
    eur2: '€'
  }));

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateValue: (rowIndex, columnId, value) => {
        // Since data is generated, we can't update it directly, but for demo, we can log or handle
        console.log('Update', rowIndex, columnId, value);
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

// Draggable Combination Component
function DraggableCombination({ combo, index, moveCombination }) {
  const ref = useRef(null);
  const [{ isDragging }, drag] = useDrag({
    type: 'COMBINATION',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const [, drop] = useDrop({
    accept: 'COMBINATION',
    hover(item, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      moveCombination(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  drag(drop(ref));
  return (
    <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }} className="border rounded p-2 cursor-move bg-white">
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4" />
        <div className="text-sm">
          {combo.combination.map((item, i) => (
            <div key={i}>{item.optionName}: {item.value}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
