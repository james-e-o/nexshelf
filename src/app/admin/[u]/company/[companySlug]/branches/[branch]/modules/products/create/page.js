'use client'

import React, { useState, useEffect, useRef,useContext, useCallback } from "react";
import { DndProvider, useDrag, useDrop, useDragLayer } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs,TabsTrigger,TabsList,TabsContent } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link"
import { Label } from "@/components/ui/label"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet"
import {AlertDialog,AlertDialogAction,AlertDialogCancel,AlertDialogContent,AlertDialogDescription,AlertDialogFooter,AlertDialogHeader,AlertDialogTitle,AlertDialogTrigger,} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,} from "@/components/ui/command"
import {Popover,PopoverContent,PopoverTrigger,} from "@/components/ui/popover"
import { X ,Check, ChevronsUpDown, Plus,Rocket,GripIcon,GripVertical,GripHorizontal, GripHorizontalIcon, ArrowRight, Upload} from "lucide-react"
import { toast } from 'sonner'
import { useRouter,useParams } from 'next/navigation'
import AddImage from "@/components/add-image";
import { VariantTable } from '@/components/variants';
import { supabase } from "../../../../../../../../../../../config/supabaseClient";
import { BranchContext } from "../../../layout";
import { set } from "date-fns";
import { fi } from "date-fns/locale";
import { motion, AnimatePresence } from 'framer-motion';


// Helper: build category tree
function buildCategoryTree(categories) {
  const map = {};
  const roots = [];
  categories.forEach(c => map[c.id] = { ...c, children: [] });
  categories.forEach(c => {
    if (c.parent && map[c.parent]) map[c.parent].children.push(map[c.id]);
    else roots.push(map[c.id]);
  });
  return roots;
}

// Utility: create URL-friendly slug
  function convertToSlug(input) {
    let newValue = input.toString().toLowerCase().replace(/['"]/g, '').trim().replace(/\band\b/g, '&').replace(/[^a-z0-9\&-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').replace(/&/g, 'and')
    return newValue
  }
  function capitalize(input) {
    let newValue = input.toString().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ').replace(/\bAnd\b/g, '&')
    return newValue
  }

// Category selection sheet component

const CreateProductPage = () => {
    const [activeTab, setActiveTab] = useState("details");
    const params = useParams(); 
    const router = useRouter();
    const { u, companySlug,branch } = params;
    const { currentBranch } = useContext(BranchContext);
  
  // Product state
    const [collectionSheetOpen, setCollectionSheetOpen] = useState(false)
    const [tagSheetOpen, setTagSheetOpen] = useState(false)
    const [categorySheetOpen, setCategorySheetOpen] = useState(false)
    const [hasVariants, setHasVariants] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [variantCombinations, setVariantCombinations] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('')
    const [selectedCategoryName, setSelectedCategoryName] = useState('')
    const [selectedCollectionId, setSelectedCollectionId] = useState('')
    const [selectedCollectionName, setSelectedCollectionName] = useState('')
    const [selectedTags, setSelectedTags] = useState([])
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [currencies, setCurrencies] = useState([]); // Get from branch context
    const [baseCurrency, setBaseCurrency] = useState('');
    const [exchangeRates, setExchangeRates] = useState({});
    const [manualPricing, setManualPricing] = useState(false);
    const [basePrice, setBasePrice] = useState('');
    const [discountable, setDiscountable] = useState(true);
    
    // Options state
    const [options, setOptions] = useState([]);
    const [justAdded, setJustAdded] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const lastOptionRef = useRef(null);
    const InputRefs = useRef([]);


    //Inputs Values State
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [handle, setHandle] = useState('');
    const [description, setDescription] = useState('');

    // Get currencies from branch context
    useEffect(() => {
      if (currentBranch?.currencies) {
        const branchCurrencies = Object.keys(currentBranch.currencies);
        const base = branchCurrencies.find(c => currentBranch.currencies[c].base);
        setBaseCurrency(base || '');
        setExchangeRates(currentBranch.currencies);
        const sortedCurrencies = [...branchCurrencies].sort((a, b) => {
          if (a === base) return -1;
          if (b === base) return 1;
          return 0;
        });
        setCurrencies(sortedCurrencies);
      }
    }, [currentBranch]);

    // (removed localStorage-based draft restore — creation now stays in-page)


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

    //Update variant combinations
    const updateVariantValue = useCallback((rowIndex, columnId, value) => {
        setVariantCombinations(prev => {
            const newCombos = [...prev];
            if (!newCombos[rowIndex]) return prev;
            newCombos[rowIndex] = { ...newCombos[rowIndex], [columnId]: value };
            console.log(newCombos);
            return newCombos;
        });
    }, []);

    useEffect(() => {
        let combos;
        if (hasVariants) {
          combos = generateCombinations(options);
        } else {
            combos = [{ combination: [], id: 'default' }];
        }
        setVariantCombinations(prev => {
            // preserve existing data (prices, sku, managed)
            return combos.map(combo => {
                const existing = prev.find(p => p.id === combo.id);
                return existing ? existing : combo;
            });
        });
    }, [options, hasVariants]);

    // Separate effect for manual pricing
    useEffect(() => {
        if (!manualPricing || !basePrice || !baseCurrency) return;
        setVariantCombinations(prev =>
            prev.map(combo => ({
                ...combo,
                [baseCurrency.toLowerCase()]: combo[baseCurrency.toLowerCase()] ?? basePrice
            }))
        );
    }, [manualPricing, basePrice, baseCurrency]);

    // Listen for selected images from the AddImage modal — merge new images with existing, avoid duplicates
    useEffect(() => {
      const handler = (e) => {
        if (e?.detail && Array.isArray(e.detail)) {
          const incoming = e.detail || [];
          const merged = [...selectedImages];
          incoming.forEach(img => {
            if (!merged.find(m => m.id === img.id)) merged.push(img);
          });
          setSelectedImages(merged);
        }
      };
      window.addEventListener('nexshelf:selectedImages', handler);
      return () => window.removeEventListener('nexshelf:selectedImages', handler);
    }, []);

    useEffect(() => {
        if (justAdded && lastOptionRef.current) {
            lastOptionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setJustAdded(false);
        }
    }, [justAdded]);

    // Functions for combinations
    const moveCombination = (fromIndex, toIndex) => {
        const newCombos = [...variantCombinations];
        const [moved] = newCombos.splice(fromIndex, 1);
        newCombos.splice(toIndex, 0, moved);
        setVariantCombinations(newCombos);
        setDraggedIndex(toIndex);
    };

    // Functions for images
    const moveImage = (fromIndex, toIndex) => {
        const newImages = [...selectedImages];
        const [moved] = newImages.splice(fromIndex, 1);
        newImages.splice(toIndex, 0, moved);
        setSelectedImages(newImages);
    };

    // Functions to handle options
    const addOption = () => {
        setOptions([...options, { id: Date.now(), name: '', values: [], Input: '' }]);
        setJustAdded(true);
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
        if (opt.Input.trim() && opt.name.trim()) {
            setOptions(options.map((o, i) => i === index ? { ...o, values: [...o.values, o.Input.trim()], Input: '' } : o));
        }
    };

    const removeValue = (index, valIndex) => {
        setOptions(options.map((o, i) => i === index ? { ...o, values: o.values.filter((_, vi) => vi !== valIndex) } : o));
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
            e.preventDefault();
            addValue(index);
            InputRefs.current[index]?.focus();
        }
    };

    // (removed external 'new' navigation — creation happens inside sheets)
    function capitalize(input) {
      let newValue= input.toString().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ').replace(/\bAnd\b/g, '&')
      return(newValue)
    }

  return (
    <>
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
                        onClick={() => setActiveTab("price-variants")}
                        className={`px-2 py-1 h-6 text-[11px] rounded-sm ${
                        activeTab === "price-variants"
                            ? "bg-army text-neutral-50"
                            : "text-neutral-600"
                        }`}
                    >
                        <span className="top-px relative">Pricing & Variants</span>
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
                                Handle 
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
                              <Textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className="border rounded-sm px-2 py-2 text-xs" placeholder="A warm and cozy jacket"></Textarea>
                            </div>

                            {/* Media uploader */}
                            <div>
                                <label className="text-xs font-medium">
                                    Media <span className="text-neutral-400">(Required if product will appear on e-commerce)</span>
                                </label>
                                {hasVariants && selectedImages.length > 0 && variantCombinations.length > 0 && (
                                  <p className="text-[10px] text-neutral-500 mt-1">
                                    Images are mapped to variants in order: the first image corresponds to the first variant, the second to the second, and so on.
                                  </p>
                                )}
                            <div className="mt-2 border border-dashed rounded-sm min-h-32 flex text-neutral-500 p-2">
                                  {selectedImages && selectedImages.length > 0 ? (
                                    <div className="w-full flex items-center gap-3">
                                      <div className="flex-1">
                                        <DndProvider backend={HTML5Backend}>
                                          <div className="flex gap-2 overflow-x-auto py-1">
                                            {selectedImages.map((img, idx) => (
                                              <DraggableImage
                                                key={img.id || idx}
                                                img={img}
                                                index={idx}
                                                moveImage={moveImage}
                                                isFirst={idx === 0}
                                                onClick={() => { setSelectedImage(img); setImageDialogOpen(true); }}
                                              />
                                            ))}
                                          </div>
                                        </DndProvider>
                                      </div>

                                      <div className="w-fit">
                                        <AlertDialogTrigger asChild>
                                          <Button variant={'ghost'} className="flex flex-col h-fit items-center justify-center gap-0.5 px-3 py-2">
                                            <span className="text-[11px] text-army">Add / Edit Images</span>
                                          </Button>
                                        </AlertDialogTrigger>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-full h-24 flex flex-col items-center justify-center text-neutral-500">
                                      <AlertDialogTrigger asChild>
                                        <Button variant={'ghost'} className="flex flex-col h-fit items-center justify-center gap-0.5">
                                          <span className="text-lg mb-1"><Upload className="text-core size-4"/></span>
                                          <span className="text-[11px] text-army">Click to Upload images</span>
                                        </Button>
                                      </AlertDialogTrigger>
                                    </div>
                                  )}
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
                                    Toggle if this is a product with variants
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
                                          Define the options and values for the product, e.g. color, size, etc.
                                      </p>

                                      {/* Dynamic Options */}
                                      {options.map((option, index) => (
                                        <div key={option.id} ref={index === options.length - 1 ? lastOptionRef : null} className="border rounded-sm">
                                          <div className="flex items-center justify-between px-4 py-3 border-b">
                                            <Input
                                              type="text"
                                              autoFocus={justAdded}
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
                                            <label className="text-[10px] italic ml-1  font-medium">Values</label>
                                            <Input
                                              ref={(el) => InputRefs.current[index] = el}
                                              type="text"
                                              value={option.Input}
                                              onChange={(e) => updateOptionInput(index, e.target.value.toLowerCase())}
                                              onKeyDown={(e) => handleKeyDown(e, index)}
                                              className="w-full border-0 outline-0 mt-1 text-xs placeholder-neutral-400"
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

                                      <div className="flex justify-end">
                                        <Button className="border rounded-sm px-4 text-white h-7 bg-army text-xs hover:bg-army/85 w-fit" onClick={addOption}>
                                            Add Option
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {hasVariants&&options.length > 0 && (
                                <div className="mt-4">
                                  <h3 className="text-xs mb-2 font-medium">Variant Combinations <span className="text-[10px] ml-1 text-core italic">{`(drag and drop to modify hierarchy)`}</span></h3>
                                  <DndProvider backend={HTML5Backend}>
                                    <CombinationDragPreview />
                                    <AnimatePresence mode="popLayout">
                                      <div className="space-y-2">
                                        {variantCombinations.map((combo, index) => (
                                          <DraggableCombination
                                            key={combo.id}
                                            combo={combo}
                                            index={index}
                                            moveCombination={moveCombination}
                                            draggedIndex={draggedIndex}
                                            onDragStart={() => setDraggedIndex(index)}
                                            onDragEnd={() => setDraggedIndex(null)}
                                            selectedImages={selectedImages}
                                            updateCombinationImages={(idx, images) => {
                                              setVariantCombinations(prev => {
                                                const updated = [...prev];
                                                updated[idx] = { ...updated[idx], images };
                                                return updated;
                                              });
                                            }}
                                            onRemoveImage={(idx, imgIdx) => {
                                              setVariantCombinations(prev => {
                                                const updated = [...prev];
                                                updated[idx].images = updated[idx].images?.filter((_, i) => i !== imgIdx) || [];
                                                return updated;
                                              });
                                            }}
                                            onMoveImage={(idx, fromIdx, toIdx) => {
                                              setVariantCombinations(prev => {
                                                const updated = [...prev];
                                                const images = [...(updated[idx].images || [])];
                                                const [moved] = images.splice(fromIdx, 1);
                                                images.splice(toIdx, 0, moved);
                                                updated[idx] = { ...updated[idx], images };
                                                return updated;
                                              });
                                            }}
                                          />
                                        ))}
                                      </div>
                                    </AnimatePresence>
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
                                <div className="flex gap-2 mt-1 items-center">
                                  <input className="flex-1 border rounded-sm p-2 text-xs" value={selectedCollectionName || ''} readOnly placeholder="Select collection" />
                                  <Button variant="outline" className="h-8 px-2 text-xs" onClick={()=>setCollectionSheetOpen(true)}>Choose</Button>
                                  <CollectionSheet branch={branch} open={collectionSheetOpen} onOpenChange={setCollectionSheetOpen} onConfirm={(id,name)=>{ setSelectedCollectionId(id); setSelectedCollectionName(name || ''); setCollectionSheetOpen(false) }} initialSelected={selectedCollectionId} />
                                </div>
                                </div>
                            </div>
                            </div>

                            {/* Categories + Tags */}
                            <div className=" rounded-sm bg-white p-4 space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                <label className="text-gray-600 text-xs">Categories </label>
                                <div className="flex gap-2 mt-1 items-center">
                                    <input className="flex-1 border rounded-sm p-2 text-xs" value={selectedCategoryName || ''} readOnly placeholder="Select category" />
                                    <Button variant="outline" className="h-8 px-2 text-xs" onClick={()=>setCategorySheetOpen(true)}>Select</Button>
                                    <CategorySheet branch={branch} open={categorySheetOpen} onOpenChange={setCategorySheetOpen} onConfirm={(id,name)=>{ setSelectedCategoryId(id); setSelectedCategoryName(name || ''); setCategorySheetOpen(false) }} initialSelected={selectedCategoryId} />
                                </div>
                                </div>

                                <div className="flex-1">
                                <label className="text-gray-600 text-xs">Tags (Optional)</label>
                                <div className="flex gap-2 mt-1 items-center">
                                  <input className="flex-1 border rounded-sm p-2 text-xs" value={(selectedTags && selectedTags.length) ? selectedTags.join(', ') : ''} readOnly placeholder="Select tags" />
                                  <Button variant="outline" className="h-8 px-2 text-xs" onClick={()=>setTagSheetOpen(true)}>Choose</Button>
                                  <TagSheet open={tagSheetOpen} onOpenChange={setTagSheetOpen} onConfirm={(ids)=>{ setSelectedTags(ids || []); setTagSheetOpen(false) }} initialSelected={selectedTags} />
                                </div>
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
                    {activeTab === "price-variants" && (
                        <div className="text-neutral-700 text-xs">
                        <h2 className="font-semibold mb-4">Price & Variants</h2>
                        
                        {/* Pricing Mode Switch */}
                        <div className="border rounded-sm px-4 py-3 space-y-3 mb-6">
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={manualPricing}
                                    onCheckedChange={setManualPricing}
                                />
                                <span className="font-medium text-xs">
                                    Input price manually
                                </span>
                            </div>
                            <p className="text-[11px] font font-medium text-core">
                                {manualPricing 
                                    ? "Set a base price that will be applied to all variants" 
                                    : "If Unchecked, Prices will be automatically synchronized with purchases, based on the most recent cost price"
                                }
                            </p>
                            
                            {manualPricing && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium">Base Price ({baseCurrency})</Label>
                                    <Input
                                        type="number"
                                        value={basePrice}
                                        onChange={(e) => setBasePrice(e.target.value)}
                                        placeholder="Enter base price"
                                        className="h-8"
                                    />

                                    <div className="rounded-sm bg-white p-4 mt-2">
                                      <div className="flex items-center gap-3">
                                        <Input type="checkbox" className="toggle-checkbox" checked={discountable} onChange={(e)=>setDiscountable(e.target.checked)} />
                                        <div>
                                          <p className="text-xs font-medium">Discountable</p>
                                          <p className="text-gray-500 text-xs">When unchecked, discounts will not be applied to this product</p>
                                        </div>
                                      </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <VariantTable combinations={variantCombinations} currencies={currencies} updateValue={updateVariantValue} baseCurrency={baseCurrency} exchangeRates={exchangeRates} manualPricing={manualPricing} />
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

    {/* Image Detail Dialog */}
    <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Image Details</DialogTitle>
        </DialogHeader>
        {selectedImage && (
          <div className="space-y-4">
            <img src={selectedImage.url} alt={selectedImage.name} className="w-full h-64 object-contain rounded" />
            <div>
              <p className="text-sm font-medium">Name: {selectedImage.name}</p>
              {/* Add more details if available */}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  )
}

export default CreateProductPage



// Custom Drag Layer for Preview Styling
function CombinationDragPreview() {
  const { item, isDragging, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    isDragging: monitor.isDragging(),
    currentOffset: monitor.getSourceClientOffset(),
  }));

  if (!isDragging || !currentOffset || !item) return null;

  return (
    <div
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        left: `${currentOffset.x}px`,
        top: `${currentOffset.y}px`,
        zIndex: 1000,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="border-2 border-green-500 bg-green-50 rounded p-2 shadow-lg">
        <div className="text-sm font-medium text-green-700">Dragging combination...</div>
      </div>
    </div>
  );
}

// Draggable Combination Component
function DraggableCombination({ combo, index, moveCombination, draggedIndex, onDragStart, onDragEnd, selectedImages, updateCombinationImages, onRemoveImage, onMoveImage }) {
  const ref = useRef(null);
  const [imageSheetOpen, setImageSheetOpen] = useState(false);
  const [comboImages, setComboImages] = useState(combo.images || []);
  
  const [{ isDragging }, drag] = useDrag({
    type: 'COMBINATION',
    item: () => {
      // Reset draggedIndex when a new drag begins to ensure clean state
      if (onDragEnd) onDragEnd();
      return { index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      // Always clear draggedIndex when drag ends, regardless of drop status
      if (onDragEnd) {
        // Use a small timeout to let animations complete
        setTimeout(() => onDragEnd(), 100);
      }
    },
  });
  const [{ isOver }, drop] = useDrop({
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
  
  // Use parent-level draggedIndex for consistent visual feedback in both directions
  let isCurrentlyDragged = draggedIndex === index || isDragging;

  const handleAddImage = (imageId) => {
    const image = selectedImages.find(img => img.id === imageId);
    if (image) {
      const newImageUrls = [...comboImages, image.url];
      setComboImages(newImageUrls);
      updateCombinationImages(index, newImageUrls);
    }
  };

  const handleRemoveComboImage = (imgIndex) => {
    const newImageUrls = comboImages.filter((_, i) => i !== imgIndex);
    setComboImages(newImageUrls);
    updateCombinationImages(index, newImageUrls);
  };

  const handleMoveComboImage = (fromIdx, toIdx) => {
    const newImageUrls = [...comboImages];
    const [moved] = newImageUrls.splice(fromIdx, 1);
    newImageUrls.splice(toIdx, 0, moved);
    setComboImages(newImageUrls);
    updateCombinationImages(index, newImageUrls);
  };
  
  return (
    <motion.div 
      ref={ref} 
      layout
      initial={{ opacity: 1 }}
      animate={{ opacity: isCurrentlyDragged ? 0.7 : 1 }}
      onPointerUp={()=>{isCurrentlyDragged=''}}
      transition={{ duration: 0.2 }}
      className={`border rounded p-2 h-30 cursor-move bg-white transition-all duration-200 ${
        isCurrentlyDragged ? 'bg-core/20 shadow-lg ring-2 ring-core/40 scale-105' : ''
      } ${isOver ? 'border-core border-2 bg-core/5' : 'border-gray-200'}`}
    >
      <div className="flex items-center justify-between h-full gap-4">
        <div className="flex h-full items-center gap-2">
          <GripVertical className={`h-4 w-4 ${isCurrentlyDragged ? 'text-core' : 'text-muted-foreground'}`} />
          <div className="text-sm ">
            {combo.combination.map((item, i) => (
              <div key={i}>{item.optionName}: {item.value}</div>
            ))}
          </div>
        </div>
        
        {/* Images Section */}
        <div className="flex grow justify-end gap-2 h-full items-center">
          {comboImages && comboImages.length > 0 ? (
            <div className="flex gap-1 h-full w-full justify-center items-center">
              {comboImages.slice(0, 3).map((imgUrl, idx) => (
                <div key={idx} className="relative h-full aspect-square group">
                  <img 
                    src={imgUrl} 
                    alt="variant" 
                    className="size-full rounded border object-cover"
                  />
                  <button 
                    onClick={() => handleRemoveComboImage(idx)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
              {comboImages.length > 3 && <span className="text-xs text-gray-500">+{comboImages.length - 3}</span>}
            </div>
          ) : (
            <p className="text-center text-xs bg-amber-300 aspect-square rounded text-gray-500 italic px-2 py-1">---</p>
          )}
          
          {/* Map Image Button */}
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setImageSheetOpen(true)}
          >
            <Plus className="h-3 w-3 mr-1" /> Map
          </Button>
        </div>

        {/* Image Selection Sheet */}
        <Sheet open={imageSheetOpen} onOpenChange={setImageSheetOpen}>
          <SheetContent side="right" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-sm">Select Images for Variant</SheetTitle>
              <SheetDescription className="text-xs">
                {combo.combination.map((item, i) => (
                  <span key={i} className="block">{item.optionName}: {item.value}</span>
                ))}
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-2 mt-4">
              {selectedImages && selectedImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {selectedImages.map((img) => (
                    <div 
                      key={img.id}
                      className="relative cursor-pointer group border rounded hover:border-core transition-colors"
                      onClick={() => {
                        handleAddImage(img.id);
                        setImageSheetOpen(false);
                      }}
                    >
                      <img 
                        src={img.url} 
                        alt="product" 
                        className="w-full h-24 object-cover rounded"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded flex items-center justify-center">
                        <Plus className="text-white h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 text-center py-8">No images uploaded yet</p>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.div>
  );
}
  




function CategorySheet({ branch, open, onOpenChange, onConfirm, initialSelected }) {
      const [list, setList] = useState([])
      const [loading, setLoading] = useState(false)
      const [uploading, setUploading] = useState(false)
      const [selected, setSelected] = useState(initialSelected || '')
      const [addingFor, setAddingFor] = useState(null)

      const [inlineName, setInlineName] = useState('')
      const [inlineSlug, setInlineSlug] = useState('')
      const [inlineDescription, setInlineDescription] = useState('')

        const [categoryName, setCategoryName] = useState('')
        const [categorySlug, setCategorySlug] = useState('')
        const [categoryDescription, setCategoryDescription] = useState('')
    
      const fetch = async () => {
        if (!open) return
        setLoading(true)
        try {
          const { data, error } = await supabase.from('categories').select('*').eq('branch', branch)
          if (error || !data || data.length === 0) {
           toast.error('No categories found')
           return
          } else setList(data)
        } catch (err) {
          console.error(err)
        }
        setLoading(false)
      }

      async function refreshCategories(){
        const r = toast.loading('Refreshing categories...')
        await fetch()
        toast.dismiss(r)
        toast.success('Categories refreshed', { id: r })
        // return refreshdata
      }

      useEffect(() => {
        fetch()
      }, [open])
    
      const tree = buildCategoryTree(list)
    
      const render = (nodes, level = 0) => nodes.map(n => (
        <div key={n.id} style={{ marginLeft: `${level * 16}px` }} className="py-1">
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-2 flex-1">
              <Checkbox checked={selected === n.id} onCheckedChange={(v)=>{ if (v) setSelected(n.id); else setSelected('') }} className="w-4 h-4" />
              <span className="text-sm">{n.name}</span>
            </label>
            <Button size="icon" variant="ghost" className="h-6 w-6 p-0" title="Add subcategory" onClick={() => { setAddingFor(addingFor === n.id ? null : n.id); setInlineName(''); setInlineSlug('') }}>
              <Plus className="size-3.5" />
            </Button>
          </div>
          {addingFor === n.id && (
            <div className="mt-2 ml-6 flex items-center gap-2">
              <Input autoFocus value={inlineName} onChange={(e)=>{ setInlineName(capitalize(e.target.value)); setInlineSlug(convertToSlug(e.target.value)) }} placeholder="name" className="h-7 px-2 w-44 text-sm rounded-sm border" />
              <Button size="icon" onClick={async () => {
                if (!inlineName) return
                const parentName = n.name
                try {
                  const r = toast.loading(`Creating category under ${parentName}...`)
                  const { data, error } = await supabase.from('categories').insert({ name: inlineName, parent: n.id, slug: inlineSlug || convertToSlug(inlineName), description: inlineDescription || '',branch }).select().single()
                  if (error) throw error
                  refreshCategories()
                  setInlineName('')
                  setInlineSlug('')
                  setInlineDescription('')
                  setAddingFor(null)
                  toast.dismiss(r)
                  toast.success('Category created')
                } catch (err) {
                  console.error(err)
                  toast.error('Failed to create category')
                }
              }} disabled={!inlineName} className="h-7 w-7 p-0 bg-army"><Rocket size={14} /></Button>
            </div>
          )}
          {n.children && render(n.children, level + 1)}
        </div>
      ))
    
      return (
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Select Category</SheetTitle>
              <SheetDescription className={'text-xs text-core font-medium leading-tight'}> Categories define what the product is and where it belongs in the store. Create the single category that best describes this product.<br />
                          <em>Example: Electronics → Phones → Smartphones</em><br /></SheetDescription>
            </SheetHeader>
    
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className=" border-b py-3">
                <p className="text-sm font-medium mb-2">Add top-level category</p>
                <div className="flex items-center gap-2">
                  <Input value={categoryName} onChange={(e)=>{ setCategoryName(capitalize(e.target.value)); setCategorySlug(convertToSlug(e.target.value)) }} placeholder="Category name" className="h-7 px-2 w-44 text-sm rounded-sm border" />
                  <Button onClick={async ()=>{
                    if(!categoryName) return
                    setUploading(true)
                    try{
                      const { data, error } = await supabase.from('categories').insert({ name: categoryName, parent: null, slug: categorySlug || convertToSlug(categoryName), description: categoryDescription || '' ,branch:branch}).select().single()
                      if(error) throw error
                      refreshCategories()
                      setCategoryName('')
                      setCategorySlug('')
                      toast.success('Category created')
                    }catch(err){ console.error(err); toast.error('Failed to create category') }finally{ setUploading(false) }
                  }} disabled={!categoryName || uploading} className="h-7 text-xs bg-army">{uploading ? <><Spinner spinning={uploading} className="h-4 w-4" /> Creating</> : 'Create'}</Button>
                </div>
              </div>
              {loading ? <div className="text-sm">Loading...</div> : render(tree)}
            </div>
    
            <SheetFooter>
              <div className="flex w-full mb-4 justify-start gap-2">
                <Button className="h-7 bg-core hover:bg-core/80 text-xs" onClick={() => { const selNode = list.find(x=>x.id===selected); onConfirm(selected, selNode?.name || ''); onOpenChange(false) }}>Confirm</Button>
                <SheetClose asChild>
                  <Button variant="outline" className="h-7 text-xs">Cancel</Button>
                </SheetClose>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )
    }
    
    
    // Collection selection sheet (flat list)
  function CollectionSheet({ branch,open, onOpenChange, onConfirm, initialSelected }) {
      const [list, setList] = useState([])
      const [loading, setLoading] = useState(false)
      const [selected, setSelected] = useState(initialSelected || '')
    
      useEffect(() => {
        if (!open) return
        const fetch = async () => {
          setLoading(true)
          try {
            const { data, error } = await supabase.from('collections').select('*').eq('branch', branch)
            if (error || !data || data.length === 0) {
              toast.error('No collections found')
              return
            } else setList(data)
          } catch (err) { console.error(err) }
          setLoading(false)
        }
        fetch()
      }, [open])
    
      const [newName, setNewName] = useState('')
    
    
    
      return (
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Select Collection</SheetTitle>
              <SheetDescription>Select a single collection for the product.</SheetDescription>
            </SheetHeader>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="mb-3">
                <div className="text-sm font-medium mb-2">Add collection</div>
                <div className="flex items-center gap-2">
                  <Input value={newName} onChange={(e)=>setNewName(capitalize(e.target.value))} placeholder="Collection name" className="h-7 px-2 w-44 text-sm rounded-sm border" />
                  <Button disabled={!newName} className="h-7 bg-army" onClick={async ()=>{
                    if(!newName) return
                    try{
                      const { data, error } = await supabase.from('collections').insert({ name: newName, slug: convertToSlug(newName), branch }).select().single()
                      if(error) throw error
                      setList(prev => [...prev, data])
                      setNewName('')
                      toast.success('Collection created')
                    }catch(err){ console.error(err); toast.error('Failed to create collection') }
                  }}>Create</Button>
                </div>
              </div>
              {loading ? <div className="text-sm">Loading...</div> : (
                <div className="space-y-2">
                  {list.map(n => (
                    <div key={n.id} className="py-1">
                      <label className="inline-flex items-center gap-2">
                        <Checkbox checked={selected === n.id} onCheckedChange={(v)=>{ if (v) setSelected(n.id); else setSelected('') }} className="w-4 h-4" />
                        <span className="text-sm">{n.name}</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <SheetFooter>
              <div className="flex w-full justify-end gap-2">
                <SheetClose asChild>
                  <Button variant="outline" className="h-8 text-xs">Cancel</Button>
                </SheetClose>
                <Button className="h-8 text-xs" onClick={() => { const sel = list.find(x=>x.id===selected); onConfirm(selected, sel?.name || ''); onOpenChange(false) }}>Confirm</Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )
    }
    
    // Tag selection sheet (multi-select)
    function TagSheet({ open, onOpenChange, onConfirm, initialSelected = [] }) {
      const [list, setList] = useState([])
      const [loading, setLoading] = useState(false)
      const [selected, setSelected] = useState(initialSelected || [])
      const [newTagName, setNewTagName] = useState('')
    
      useEffect(() => { if (!open) return; const fetch = async () => { setLoading(true); try { const { data } = await supabase.from('tags').select('*'); if (!data || data.length===0) setList([{id:'1',name:'New'},{id:'2',name:'Sale'},{id:'3',name:'Limited'}]); else setList(data);} catch(e){console.error(e)} setLoading(false);} ; fetch() }, [open])
    
      const toggle = (id, checked) => {
        if (checked) setSelected(prev => [...new Set([...(prev||[]), id])])
        else setSelected(prev => (prev||[]).filter(x=>x!==id))
      }
    
      return (
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Select Tags</SheetTitle>
              <SheetDescription>Select one or more tags for the product.</SheetDescription>
            </SheetHeader>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="mb-3">
                <div className="text-sm font-medium mb-2">Add tag</div>
                <div className="flex items-center gap-2">
                  <Input value={newTagName} onChange={(e)=>setNewTagName(e.target.value)} placeholder="Tag name" className="h-7 px-2 w-44 text-sm rounded-sm border" />
                  <Button disabled={!newTagName} className="h-7 bg-army" onClick={async ()=>{
                    if(!newTagName) return
                    try{
                      const { data, error } = await supabase.from('tags').insert({ name: newTagName }).select().single()
                      if(error) throw error
                      setList(prev=>[...prev, data])
                      setNewTagName('')
                      toast.success('Tag created')
                    }catch(err){ console.error(err); toast.error('Failed to create tag') }
                  }}>Create</Button>
                </div>
              </div>
              {loading ? <div className="text-sm">Loading...</div> : (
                <div className="space-y-2">
                  {list.map(n => (
                    <div key={n.id} className="py-1">
                      <label className="inline-flex items-center gap-2">
                        <Checkbox checked={(selected||[]).includes(n.id)} onCheckedChange={(v)=>toggle(n.id, v)} className="w-4 h-4" />
                        <span className="text-sm">{n.name}</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <SheetFooter>
              <div className="flex w-full justify-end gap-2">
                <SheetClose asChild>
                  <Button variant="outline" className="h-8 text-xs">Cancel</Button>
                </SheetClose>
                <Button className="h-8 text-xs" onClick={() => { onConfirm(selected); onOpenChange(false) }}>Confirm</Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )
    }
    
    const DraggableImage = ({ img, index, moveImage, isFirst, onClick }) => {
      const ref = useRef(null);
      const [{ isDragging }, drag] = useDrag({
        type: 'image',
        item: { index },
        collect: (monitor) => ({
          isDragging: monitor.isDragging(),
        }),
      });
      const [, drop] = useDrop({
        accept: 'image',
        hover: (item) => {
          if (item.index !== index) {
            moveImage(item.index, index);
            item.index = index;
          }
        },
      });
      drag(drop(ref));
      return (
        <div
          ref={ref}
          className={`relative flex-none bg-gray-50 rounded-sm overflow-hidden border cursor-pointer ${isDragging ? 'opacity-50' : ''} ${isFirst ? 'w-32 h-32' : 'w-32 h-16'}`}
          onClick={onClick}
        >
          <img src={img.url} alt={img.name} className="w-full h-full object-contain" />
          <div className="absolute top-1 right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center text-white text-xs font-medium">
            {index + 1}
          </div>
        </div>
      );
    };
