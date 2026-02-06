'use client'

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, X, Info, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../config/supabaseClient';

export const ProductConfigurations = forwardRef(({
  selectedCollectionId,
  selectedCollectionName,
  setSelectedCollectionId,
  setSelectedCollectionName,
  collectionSheetOpen,
  setCollectionSheetOpen,
  CollectionSheet,
  selectedCategoryId,
  selectedCategoryName,
  setSelectedCategoryId,
  setSelectedCategoryName,
  categorySheetOpen,
  setCategorySheetOpen,
  CategorySheet,
  selectedTags,
  setSelectedTags,
  tagSheetOpen,
  setTagSheetOpen,
  TagSheet,
  costPrice,
  setCostPrice,
  pricingContexts,
  setPricingContexts,
  selectedPricingContexts,
  setSelectedPricingContexts,
  branch,
  productType = 'physical'
}, ref) => {
  // Local state for measurement data
  const [measurementTypes, setMeasurementTypes] = useState([]);
  const [measurementUnits, setMeasurementUnits] = useState([]);
  const [selectedMeasurementType, setSelectedMeasurementType] = useState('');
  const [totalProductUnits, setTotalProductUnits] = useState('');
  const [totalProductUnitsType, setTotalProductUnitsType] = useState('count');
  const [minimumProductUnits, setMinimumProductUnits] = useState('');
  const [bulkQuantity, setBulkQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [pricingContextSheetOpen, setPricingContextSheetOpen] = useState(false);
  const [pricingContextMode, setPricingContextMode] = useState('list'); // 'list' or 'create'
  const [newContextName, setNewContextName] = useState('');
  const [minimumMarginRulesOpen, setMinimumMarginRulesOpen] = useState(false);
  const [minimumMarginRules, setMinimumMarginRules] = useState([]);
  const [minimumMarginMode, setMinimumMarginMode] = useState('list'); // 'list' or 'create'
  const [newRuleName, setNewRuleName] = useState('');
  const [newRulePercentage, setNewRulePercentage] = useState('');
  const [selectedMarginRule, setSelectedMarginRule] = useState(null);
  const [isSavingMarginRule, setIsSavingMarginRule] = useState(false);
  const [isDeletingMarginRule, setIsDeletingMarginRule] = useState(null);
  const [isLoadingMarginRules, setIsLoadingMarginRules] = useState(false);
  
  // Pricing context database state
  const [isLoadingPricingContexts, setIsLoadingPricingContexts] = useState(false);
  const [isSavingPricingContext, setIsSavingPricingContext] = useState(false);
  const [isDeletingPricingContext, setIsDeletingPricingContext] = useState(null);
  const [pricingContextsFromDb, setPricingContextsFromDb] = useState([]);
  const [editingContextId, setEditingContextId] = useState(null);
  const [editingContextData, setEditingContextData] = useState({});

  // Default pricing context (always shown, not from database)
  const defaultPricingContext = {
    id: 'default-standard',
    name: 'Standard',
    is_default: true,
    margin_percentage: '',
    margin_value: '',
    bulk_reduction_percentage: '',
    bulk_reduction_value: '',
    branch_id: branch?.id
  };

  // Combined pricing contexts: use the passed pricingContexts prop which includes default + database contexts
  const allPricingContexts = pricingContexts || [defaultPricingContext];

  // Validation state
  const [errors, setErrors] = useState({});

  // Required fields configuration based on product type
  const requiredFields = {
    pricingContexts: true, // Required for both physical and service
  };

  // Helper function to render required/optional indicator
  const renderFieldLabel = (labelText, fieldKey) => {
    return (
      <span>
        {labelText}
        {requiredFields[fieldKey] ? (
          <span className="text-red-500 ml-1">*</span>
        ) : (
          <span className="text-neutral-400 ml-1">(Optional)</span>
        )}
      </span>
    );
  };

  // Validation function for configurations
  const validateConfigurations = () => {
    const newErrors = {};
    
    // Check pricing contexts
    if (requiredFields.pricingContexts && (!pricingContexts || pricingContexts.length === 0)) {
      newErrors.pricingContexts = true;
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      // Scroll to first error
      setTimeout(() => {
        const element = document.querySelector(`[data-field="configurations"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return false;
    }
    
    return true;
  };

  // Clear errors when product type changes
  useEffect(() => {
    setErrors({});
  }, [productType]);

  // Expose validation function via ref
  useImperativeHandle(ref, () => ({
    validateConfigurations
  }), [pricingContexts, requiredFields]);

  // Fetch measurement types and units from Supabase
  useEffect(() => {
    const fetchMeasurementData = async () => {
      try {
        setLoading(true);

        // Fetch measurement types
        const { data: typesData, error: typesError } = await supabase
          .from('measurement_types')
          .select('*');
        
        if (typesError) {
          console.error('Error fetching measurement types:', typesError);
        } else {
          setMeasurementTypes(typesData || []);
        }

        // Fetch measurement units
        const { data: unitsData, error: unitsError } = await supabase
          .from('measurement_units')
          .select('*');
        
        if (unitsError) {
          console.error('Error fetching measurement units:', unitsError);
        } else {
          setMeasurementUnits(unitsData || []);
        }
      } catch (error) {
        console.error('Error fetching measurement data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeasurementData();
  }, []);

  // Fetch minimum margin rules from Supabase filtered by branch
  const fetchMinimumMarginRules = async () => {
    if (!branch?.id) {
      console.log('No branch ID available');
      return;
    }
    
    try {
      setIsLoadingMarginRules(true);
      console.log('Fetching minimum margin rules for branch:', branch.id);
      
      const { data, error } = await supabase
        .from('minimum_margin')
        .select('*');
      
      console.log('Raw response from Supabase:', { data, error });
      
      if (error) {
        console.error('Error fetching minimum margin rules:', error);
        toast.error('Failed to load margin rules');
        setMinimumMarginRules([]);
      } else {
        console.log('Full fetched data:', data);
        
        // Filter by branch
        const branchRules = data.filter(rule => rule.branch === branch.id);
        console.log('Filtered rules for branch:', branchRules);
        
        // Transform data to match our UI format
        const transformedRules = branchRules.map(rule => ({
          id: rule.id,
          name: rule.name,
          percentage: rule.percent
        }));
        console.log('Transformed rules:', transformedRules);
        setMinimumMarginRules(transformedRules);
      }
    } catch (error) {
      console.error('Error fetching minimum margin rules:', error);
      setMinimumMarginRules([]);
    } finally {
      setIsLoadingMarginRules(false);
    }
  };

  // Fetch rules when branch changes or when sheet opens
  useEffect(() => {
    console.log('useEffect triggered:', { minimumMarginRulesOpen, branchId: branch?.id });
    if (minimumMarginRulesOpen && branch?.id) {
      fetchMinimumMarginRules();
    }
  }, [minimumMarginRulesOpen, branch?.id]);

  // Create new minimum margin rule in Supabase
  const handleCreateMinimumMarginRule = async () => {
    if (!newRuleName.trim() || !newRulePercentage) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsSavingMarginRule(true);
      const { data, error } = await supabase
        .from('minimum_margin')
        .insert([
          {
            name: newRuleName.trim(),
            percent: newRulePercentage,
            branch: branch?.id 
          }
        ])
        .select('id, name, percent');
      
      if (error) {
        console.error('Error creating minimum margin rule:', error);
        toast.error('Failed to create rule');
        return;
      }

      if (data && data.length > 0) {
        const newRule = {
          id: data[0].id,
          name: data[0].name,
          percentage: data[0].percent
        };
        
        setMinimumMarginRules([...minimumMarginRules, newRule]);
        setNewRuleName('');
        setNewRulePercentage('');
        setMinimumMarginMode('list');
        toast.success('Rule created successfully');
      }
    } catch (error) {
      console.error('Error creating minimum margin rule:', error);
      toast.error('Failed to create rule');
    } finally {
      setIsSavingMarginRule(false);
    }
  };

  // Delete minimum margin rule from Supabase
  const handleDeleteMinimumMarginRule = async (ruleId, ruleName) => {
    if (!branch?.id) return;

    try {
      setIsDeletingMarginRule(ruleId);
      const { error } = await supabase
        .from('minimum_margin')
        .delete()
        .eq('id', ruleId)
        .eq('branch', branch.id);
      
      if (error) {
        console.error('Error deleting minimum margin rule:', error);
        toast.error('Failed to delete rule');
        return;
      }

      setMinimumMarginRules(minimumMarginRules.filter(rule => rule.id !== ruleId));
      
      // Clear selection if deleted rule was selected
      if (selectedMarginRule?.id === ruleId) {
        setSelectedMarginRule(null);
      }
      
      toast.success('Rule deleted successfully');
    } catch (error) {
      console.error('Error deleting minimum margin rule:', error);
      toast.error('Failed to delete rule');
    } finally {
      setIsDeletingMarginRule(null);
    }
  };

  // Fetch additional pricing contexts from Supabase filtered by branch
  const fetchPricingContexts = async () => {
    if (!branch?.id) {
      console.log('No branch ID available');
      return;
    }
    
    try {
      setIsLoadingPricingContexts(true);
      console.log('Fetching additional pricing contexts for branch:', branch.id);
      
      const { data, error } = await supabase
        .from('pricing_contexts')
        .select('*')
        .eq('branch_id', branch.id)
        .eq('is_default', false); // Only fetch non-default contexts
      
      if (error) {
        console.error('Error fetching pricing contexts:', error);
        toast.error('Failed to load pricing contexts');
        setPricingContextsFromDb([]);
      } else {
        console.log('Fetched additional pricing contexts:', data);
        setPricingContextsFromDb(data || []);
      }
    } catch (error) {
      console.error('Error fetching pricing contexts:', error);
      setPricingContextsFromDb([]);
    } finally {
      setIsLoadingPricingContexts(false);
    }
  };

  // Create new pricing context in Supabase (additional contexts only, default is always local)
  const handleCreatePricingContext = async () => {
    if (!newContextName.trim()) {
      toast.error('Please enter a context name');
      return;
    }

    try {
      setIsSavingPricingContext(true);
      const { data, error } = await supabase
        .from('pricing_contexts')
        .insert([{
          name: newContextName.trim(),
          branch_id: branch?.id,
          is_default: false // Additional contexts are never default
        }])
        .select('*');
      
      if (error) {
        console.error('Error creating pricing context:', error);
        toast.error('Failed to create pricing context');
        return;
      }

      if (data && data.length > 0) {
        setPricingContextsFromDb([...pricingContextsFromDb, data[0]]);
        setNewContextName('');
        setPricingContextMode('list');
        toast.success('Pricing context created successfully');
      }
    } catch (error) {
      console.error('Error creating pricing context:', error);
      toast.error('Failed to create pricing context');
    } finally {
      setIsSavingPricingContext(false);
    }
  };

  // Delete pricing context from Supabase
  const handleDeletePricingContext = async (contextId, contextName) => {
    if (!branch?.id) return;

    try {
      setIsDeletingPricingContext(contextId);
      const { error } = await supabase
        .from('pricing_contexts')
        .delete()
        .eq('id', contextId)
        .eq('branch_id', branch.id);
      
      if (error) {
        console.error('Error deleting pricing context:', error);
        toast.error('Failed to delete pricing context');
        return;
      }

      setPricingContextsFromDb(pricingContextsFromDb.filter(ctx => ctx.id !== contextId));
      
      // Remove from selected if it was selected
      setSelectedPricingContexts(prev => prev.filter(id => id !== contextId));
      
      toast.success('Pricing context deleted successfully');
    } catch (error) {
      console.error('Error deleting pricing context:', error);
      toast.error('Failed to delete pricing context');
    } finally {
      setIsDeletingPricingContext(null);
    }
  };

  // Helper to toggle context selection (multiple selection)
  const toggleContextSelection = (contextId) => {
    setSelectedPricingContexts(prev => 
      prev.includes(contextId)
        ? prev.filter(id => id !== contextId)
        : [...prev, contextId]
    );
  };

  // Helper to check if context is selected
  const isContextSelected = (contextId) => {
    return selectedPricingContexts.includes(contextId);
  };

  // Fetch pricing contexts when sheet opens
  useEffect(() => {
    if (pricingContextSheetOpen && branch?.id) {
      fetchPricingContexts();
    }
  }, [pricingContextSheetOpen, branch?.id]);

  // Calculate margin/bulk price value from percentage
  const calculateValueFromPercentage = (percentage, basePrice) => {
    if (!basePrice || !percentage) return '';
    return (parseFloat(basePrice) * parseFloat(percentage) / 100).toFixed(2);
  };

  // Calculate margin/bulk price percentage from value
  const calculatePercentageFromValue = (value, basePrice) => {
    if (!basePrice || !value) return '';
    return (parseFloat(value) / parseFloat(basePrice) * 100).toFixed(2);
  };

  // Calculate selling price from cost price + margin value
  const calculateSellingPrice = (marginValue) => {
    if (!costPrice || !marginValue) return '';
    return (parseFloat(costPrice) + parseFloat(marginValue)).toFixed(2);
  };

  // Get units for the selected measurement type
  const getUnitsForType = (typeCode) => {
    if (!typeCode) return [];
    return measurementUnits.filter(unit => unit.type === typeCode);
  };

  const availableUnits = getUnitsForType(selectedMeasurementType);

  // Reset units when measurement type changes
  const handleMeasurementTypeChange = (newType) => {
    setSelectedMeasurementType(newType);
    // Auto-set to base unit
    const baseUnit = measurementUnits.find(unit => unit.type === newType && unit.is_base);
    setTotalProductUnitsType(baseUnit?.symbol || '');
    setTotalProductUnits('');
  };

  return (
    <div className="text-neutral-700 font-WixMade tracking-tight max-w-5xl mx-auto text-xs">
      <h2 className="font-semibold mb-4">Configurations</h2>
      
      <div className="space-y-4 text-xs text-gray-700">

        {/* Collection - ONLY FOR PHYSICAL PRODUCTS */}
        {productType === 'physical' && (
        <div className=" rounded-sm bg-white p-4 space-y-4">
          <div className="flex-1">
            <label className="text-gray-600 text-xs">Collection (Optional)</label>
            <div className="flex gap-2 mt-1 items-center">
              <input className="flex-1 border rounded-sm p-2 text-xs" value={selectedCollectionName || ''} readOnly placeholder="Select collection" />
              <Button variant="outline" className="h-8 px-2 text-xs" onClick={()=>setCollectionSheetOpen(true)}>Choose</Button>
              <CollectionSheet branch={branch} open={collectionSheetOpen} onOpenChange={setCollectionSheetOpen} onConfirm={(id,name)=>{ setSelectedCollectionId(id); setSelectedCollectionName(name || ''); setCollectionSheetOpen(false) }} initialSelected={selectedCollectionId} />
            </div>
          </div>
        </div>
        )}

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

        {/* MEASUREMENTS SECTION - ONLY FOR PHYSICAL PRODUCTS */}
        {productType === 'physical' && (
        <div className="space-y-3 p-4">
          <h3 className="text-xs font-semibold mb-2">Unit of Measurement</h3>
        <div className="rounded-sm bg-white border p-4">
          
          <div className="space-y-4">
            {/* Measurement Type Selector */}
            <div>
              <label className="text-gray-600 text-xs font-medium block mb-2">Measurement Type</label>
              <Select value={selectedMeasurementType} onValueChange={handleMeasurementTypeChange} disabled={loading}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select measurement type" />
                </SelectTrigger>
                <SelectContent>
                  {measurementTypes && measurementTypes.map(type => (
                    <SelectItem key={type.id} value={type.code}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedMeasurementType && (
              <>
                {/* Total Product Units, Minimum Product Units, and Bulk Quantity on same line */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Total Product Units */}
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <label className="text-gray-600 text-xs font-medium block">Base Quantity of Measurement</label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-cyan-600 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          The base unit quantity for this product. All calculations are based on this quantity.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Input
                          type="number"
                          placeholder="0"
                          value={totalProductUnits}
                          onChange={(e) => setTotalProductUnits(e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <Select value={totalProductUnitsType} onValueChange={setTotalProductUnitsType}>
                        <SelectTrigger className="h-8 text-xs w-fit">
                          <SelectValue placeholder="unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUnits && availableUnits.map(unit => (
                            <SelectItem key={unit.id} value={unit.symbol}>
                              {unit.symbol}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Minimum Product Units */}
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <label className="text-gray-600 text-xs font-medium block">Minimum product unit(s)</label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-cyan-600 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          The minimum quantity that must be ordered or sold at once.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Input
                          type="number"
                          placeholder="0"
                          value={minimumProductUnits}
                          onChange={(e) => setMinimumProductUnits(e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <Select value={totalProductUnitsType} disabled>
                        <SelectTrigger className="h-8 text-xs w-fit">
                          <SelectValue placeholder="unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {totalProductUnitsType && <SelectItem value={totalProductUnitsType}>{totalProductUnitsType}</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>


                </div>
              </>
            )}
          </div>
        </div>
        </div>
        )}

        {/* PRICING SECTION - Cost Price Only */}
        <div className="space-y-3 p-4">
        <div className="rounded-sm bg-white border p-4">
          <h3 className="text-xs font-semibold mb-4">Pricing</h3>
          <div>
            <Label className="text-xs font-medium mb-1 block">Cost Price</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              className="h-8"
            />
            <p className="text-gray-500 text-[11px] mt-1">
              Base cost price for this product (same across all pricing contexts)
            </p>
          </div>
        </div>
        </div>

        {/* PRICING CONTEXT SECTION */}
        <div className="space-y-3 p-4" data-field="configurations">
          <h3 className="text-xs font-semibold">
            {renderFieldLabel('Pricing Context', 'pricingContexts')}
          </h3>
          <p className="text-gray-500 text-[11px]">
            Manage selling prices and reductions for different pricing contexts (channels, customer types, etc).
          </p>

          {/* Error message for pricing contexts */}
          {errors.pricingContexts && (
            <div className="bg-red-50 border border-red-200 rounded-sm p-3 text-xs text-red-700">
              At least one pricing context is required
            </div>
          )}

          {/* Pricing Contexts List */}
          <div className="space-y-3">
            {isLoadingPricingContexts ? (
              <div className="text-center py-8">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-xs text-gray-500">Loading pricing contexts...</p>
              </div>
            ) : allPricingContexts.filter(ctx => selectedPricingContexts.includes(ctx.id)).length > 0 ? (
              allPricingContexts
                .filter(ctx => selectedPricingContexts.includes(ctx.id))
                .map((context) => (
                <div key={context.id} className={`border rounded-sm bg-white p-4 space-y-3`}>
                  {/* Context Header */}
                  <div className="flex items-center justify-between pb-3 border-b">
                    <div 
                      className="flex items-center gap-2 flex-1 cursor-pointer hover:text-blue-600"
                      onClick={() => setPricingContextSheetOpen(true)}
                    >
                      <span className="text-xs font-medium">{context.name}</span>
                      {context.is_default && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded">Default</span>
                      )}
                    </div>
                    {!context.is_default && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        disabled={isDeletingPricingContext === context.id}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        onClick={() => handleDeletePricingContext(context.id, context.name)}
                      >
                        {isDeletingPricingContext === context.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Margin - Dual Inputs (Percentage & Value) */}
                  <div>
                    <Label className="text-xs font-medium mb-2 block">Margin</Label>
                    <div className="flex mt-3 gap-3 items-center">
                      <div className="grow">
                        <Label className='ml-0.5 text-[10px]'>Margin %</Label>
                        <Input 
                          type='number' 
                          step="0.01"
                          value={editingContextId === context.id ? (editingContextData.margin_percentage || '') : (context.margin_percentage || '')} 
                          onChange={(e) => {
                            setEditingContextId(context.id);
                            const percentage = e.target.value;
                            setEditingContextData({
                              ...editingContextData,
                              margin_percentage: percentage,
                              margin_value: calculateValueFromPercentage(percentage, costPrice)
                            });
                          }} 
                          className={'mt-1 bg-[#fcfcfc] h-8'}
                        />
                      </div>
                      <div className="grow">
                        <Label className='ml-0.5 text-[10px]'>Margin Value</Label>
                        <div className='w-fit inline-flex items-center gap-1 mt-1'>
                          <Input 
                            type='number' 
                            step="0.01"
                            value={editingContextId === context.id ? (editingContextData.margin_value || '') : (context.margin_value || '')} 
                            onChange={(e) => {
                              setEditingContextId(context.id);
                              const value = e.target.value;
                              setEditingContextData({
                                ...editingContextData,
                                margin_value: value,
                                margin_percentage: calculatePercentageFromValue(value, costPrice)
                              });
                            }} 
                            className={'mt-0 bg-[#fcfcfc] h-8'}
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-500 text-[10px] mt-2">Margin amount (both % and value sync based on cost price)</p>
                  </div>

                  {/* Selling Price - Auto-calculated */}
                  <div>
                    <Label className="text-xs font-medium mb-2 block">Selling Price</Label>
                    <div className="flex mt-3 gap-3 items-center">
                      <div className="grow">
                        <Input 
                          type='text' 
                          value={calculateSellingPrice(editingContextId === context.id ? (editingContextData.margin_value || 0) : (context.margin_value || 0))}
                          readOnly
                          className={'mt-0 bg-[#f0f0f0] h-8 cursor-not-allowed'}
                          placeholder="Auto-calculated"
                        />
                      </div>
                    </div>
                    <p className="text-gray-500 text-[10px] mt-2">Auto-calculated: Cost Price + Margin Value</p>
                  </div>

                  {/* Bulk Price Reduction - Dual Inputs (Percentage & Value) */}
                  <div>
                    <Label className="text-xs font-medium mb-2 block">Bulk Price Reduction (Optional)</Label>
                    <div className="flex mt-3 gap-3 items-center">
                      <div className="grow">
                        <Label className='ml-0.5 text-[10px]'>Bulk Reduction %</Label>
                        <Input 
                          type='number' 
                          step="0.01"
                          value={editingContextId === context.id ? (editingContextData.bulk_reduction_percentage || '') : (context.bulk_reduction_percentage || '')} 
                          onChange={(e) => {
                            setEditingContextId(context.id);
                            const percentage = e.target.value;
                            setEditingContextData({
                              ...editingContextData,
                              bulk_reduction_percentage: percentage,
                              bulk_reduction_value: calculateValueFromPercentage(percentage, costPrice)
                            });
                          }} 
                          className={'mt-1 bg-[#fcfcfc] h-8'}
                        />
                      </div>
                      <div className="grow">
                        <Label className='ml-0.5 text-[10px]'>Bulk Reduction Value</Label>
                        <Input 
                          type='number' 
                          step="0.01"
                          value={editingContextId === context.id ? (editingContextData.bulk_reduction_value || '') : (context.bulk_reduction_value || '')} 
                          onChange={(e) => {
                            setEditingContextId(context.id);
                            const value = e.target.value;
                            setEditingContextData({
                              ...editingContextData,
                              bulk_reduction_value: value,
                              bulk_reduction_percentage: calculatePercentageFromValue(value, costPrice)
                            });
                          }} 
                          className={'mt-1 bg-[#fcfcfc] h-8'}
                        />
                      </div>
                    </div>
                    <p className="text-gray-500 text-[10px] mt-2">Reduction applied when ordering in bulk</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 border rounded-sm bg-gray-50">
                <p className="text-xs text-gray-500">No pricing contexts</p>
              </div>
            )}
          </div>

          {/* Add Pricing Context Button */}
          <Button
            className="w-full border border-dashed rounded-sm h-8 text-xs text-gray-600 hover:bg-gray-50"
            variant="outline"
            onClick={() => {
              setPricingContextSheetOpen(true);
              setPricingContextMode('list');
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Pricing Context
          </Button>
        </div>

        {/* Pricing Context Sheet */}
        <Sheet open={pricingContextSheetOpen} onOpenChange={setPricingContextSheetOpen}>
          <SheetContent className="w-full sm:w-96 p-6">
            {pricingContextMode === 'list' ? (
              <>
                <SheetHeader className="mb-6">
                  <SheetTitle>Pricing Contexts</SheetTitle>
                  <SheetDescription>
                    Manage pricing for different channels or customer types
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-3 pb-20">
                  <Button
                    className="w-full border border-dashed rounded-sm h-8 text-xs text-gray-600 hover:bg-gray-50 mb-4"
                    variant="outline"
                    disabled={isSavingPricingContext}
                    onClick={() => {
                      setPricingContextMode('create');
                      setNewContextName('');
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Context
                  </Button>

                  {isLoadingPricingContexts ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-gray-400" />
                      <p className="text-xs text-gray-500">Loading contexts...</p>
                    </div>
                  ) : (
                    <>
                      {/* Default Context */}
                      <div 
                        className={`flex items-center gap-2 p-3 border rounded-sm cursor-pointer transition ${
                          isContextSelected(defaultPricingContext.id)
                            ? 'bg-blue-50 border-blue-500' 
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isContextSelected(defaultPricingContext.id)}
                          onChange={() => toggleContextSelection(defaultPricingContext.id)}
                          className="h-4 w-4 cursor-pointer"
                        />
                        <span className="text-xs font-medium flex-1">{defaultPricingContext.name}</span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded">Default</span>
                      </div>

                      {/* Additional Contexts from Database */}
                      {pricingContextsFromDb.length > 0 ? (
                        pricingContextsFromDb.map((context) => (
                          <div
                            key={context.id}
                            className={`flex items-center gap-2 p-3 border rounded-sm cursor-pointer transition ${
                              isContextSelected(context.id)
                                ? 'bg-blue-50 border-blue-500' 
                                : 'bg-white border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isContextSelected(context.id)}
                              onChange={() => toggleContextSelection(context.id)}
                              className="h-4 w-4 cursor-pointer"
                            />
                            <span className="text-xs font-medium flex-1">{context.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isDeletingPricingContext === context.id}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePricingContext(context.id, context.name);
                              }}
                            >
                              {isDeletingPricingContext === context.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ))
                      ) : null}
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-600"
                    onClick={() => {
                      setPricingContextMode('list');
                      setNewContextName('');
                    }}
                  >
                    ←
                  </Button>
                  <SheetTitle>Create New Pricing Context</SheetTitle>
                </div>

                <div className="space-y-4 pb-20">
                  <div>
                    <Label className="text-xs font-medium mb-1 block">Context Name</Label>
                    <Input
                      type="text"
                      placeholder="e.g., E-commerce, Distributor, Retail"
                      value={newContextName}
                      onChange={(e) => setNewContextName(e.target.value)}
                      className="h-8"
                    />
                  </div>

                  <Button
                    className="w-full h-8 text-xs"
                    disabled={isSavingPricingContext}
                    onClick={handleCreatePricingContext}
                  >
                    {isSavingPricingContext ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      'Create Context'
                    )}
                  </Button>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* Shipping Profile - ONLY FOR PHYSICAL PRODUCTS */}
        {productType === 'physical' && (
        <div className="rounded-sm bg-white p-4">
          <label className="text-gray-600 text-xs font-medium">Shipping profile (Optional)</label>
          <Select>
            <SelectTrigger className="mt-1 h-8 text-xs">
              <SelectValue placeholder="Select shipping profile" />
            </SelectTrigger>
            <SelectContent>
            </SelectContent>
          </Select>
          <p className="text-gray-500 text-[11px] mt-1">
            Connect the product to a shipping profile
          </p>
        </div>
        )}

        {/* Minimum Margin Rules Sheet */}
        <Sheet open={minimumMarginRulesOpen} onOpenChange={(open) => {
          setMinimumMarginRulesOpen(open);
          if (!open) {
            setMinimumMarginMode('list');
            setNewRuleName('');
            setNewRulePercentage('');
          }
        }}>
          <SheetContent className="w-96 font-WixMade tracking-tight p-0 flex flex-col h-full">
            {minimumMarginMode === 'list' ? (
              <>
                <SheetHeader className="p-3 border-b shrink-0">
                  <SheetTitle>Minimum Margin Rules</SheetTitle>
                  <SheetDescription>Create and manage minimum margin percentage rules</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-3">
                  <div className="space-y-3">
                    <Button
                      className="w-full border border-dashed rounded-sm h-8 text-xs text-gray-600 hover:bg-gray-50 mb-4"
                      variant="outline"
                      onClick={() => {
                        setMinimumMarginMode('create');
                        setNewRuleName('');
                        setNewRulePercentage('');
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Rule
                    </Button>

                    {isLoadingMarginRules ? (
                      <div className="text-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-gray-400" />
                        <p className="text-xs text-gray-500">Loading rules...</p>
                      </div>
                    ) : minimumMarginRules.length > 0 ? (
                      minimumMarginRules.map((rule, idx) => (
                        <div
                          key={rule.id}
                          className={`flex items-center justify-between p-3 border rounded-sm transition-all cursor-pointer ${
                            selectedMarginRule?.id === rule.id
                              ? 'bg-blue-100 border-blue-400'
                              : 'bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-slate-100'
                          }`}
                          onClick={() => {
                            setSelectedMarginRule(rule);
                            setMinimumMarginRulesOpen(false);
                          }}
                        >
                          <div>
                            <p className="text-sm font-medium">{rule.name}</p>
                            <p className="text-xs text-slate-600">{rule.percentage}%</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isDeletingMarginRule === rule.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMinimumMarginRule(rule.id, rule.name);
                            }}
                            className="h-6 w-6 p-0 text-gray-500 hover:text-red-500 shrink-0"
                          >
                            {isDeletingMarginRule === rule.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-xs text-gray-500">No rules created yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 p-3 border-b shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-600"
                    onClick={() => {
                      setMinimumMarginMode('list');
                      setNewRuleName('');
                      setNewRulePercentage('');
                    }}
                  >
                    ←
                  </Button>
                  <SheetTitle>Create New Rule</SheetTitle>
                </div>

                <div className="flex-1 overflow-y-auto p-3">
                  <div className="space-y-4 pb-20">
                    <div>
                      <Label className="text-xs font-medium mb-1 block">Rule Name</Label>
                      <Input
                        type="text"
                        placeholder="e.g., Standard, Premium, Budget"
                        value={newRuleName}
                        onChange={(e) => setNewRuleName(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium mb-1 block">Percentage (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 20"
                        value={newRulePercentage}
                        onChange={(e) => setNewRulePercentage(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>

                    <Button
                      className="w-full h-8 text-xs"
                      disabled={isSavingMarginRule}
                      onClick={handleCreateMinimumMarginRule}
                    >
                      {isSavingMarginRule ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        'Save Rule'
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

      </div>
    </div>
  );
});

ProductConfigurations.displayName = 'ProductConfigurations';
