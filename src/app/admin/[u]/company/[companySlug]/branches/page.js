"use client"

import { ReusableCompanySidebar } from '../layout'
import React, { useState, useContext, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, Edit3, Trash2, Settings } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CompanyInfoContext } from '../layout'
import { supabase } from '../../../../../../../config/supabaseClient'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export default function BranchesPage() {
  const { branches, info, currencies } = useContext(CompanyInfoContext)
  const router = useRouter()
  const params = useParams()

  const [companyCurrencies, setCompanyCurrencies] = useState(currencies || [])
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAddress, setNewAddress] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [editingAddress, setEditingAddress] = useState('')
  const [editingBaseCurrency, setEditingBaseCurrency] = useState('')
  const [editingSelectedCurrencies, setEditingSelectedCurrencies] = useState([])
  const [editingCurrencyConfig, setEditingCurrencyConfig] = useState({})
  const [isEditMode, setIsEditMode] = useState(false)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [branchToDelete, setBranchToDelete] = useState(null)

  const [localBranches, setLocalBranches] = useState([])

  useEffect(() => {
    setCompanyCurrencies(currencies || [])
  }, [currencies])

  useEffect(() => {
    setLocalBranches(branches)
  }, [branches])

  // Check for currency mismatches and reset if necessary
  useEffect(() => {
    if (!companyCurrencies.length || !localBranches.length) return;

    const updates = [];

    localBranches.forEach(branch => {
      const branchCurrencies = Object.keys(branch.currencies || {});
      const hasMismatch = !branch.base_currency || 
        !companyCurrencies.some(c => c.code === branch.base_currency) || 
        branchCurrencies.some(c => !companyCurrencies.some(cc => cc.code === c)) ||
        !branchCurrencies.includes(branch.base_currency);

      if (hasMismatch) {
        const newBase = companyCurrencies[0].code;
        const existingCurrencies = branch.currencies || {};
        const updatedCurrencies = { ...existingCurrencies, [newBase]: { base: true, rate: 1 } };
        // Remove invalid currencies
        Object.keys(updatedCurrencies).forEach(code => {
          if (!companyCurrencies.some(c => c.code === code)) {
            delete updatedCurrencies[code];
          }
        });
        updates.push({
          id: branch.id,
          base_currency: newBase,
          currencies: updatedCurrencies
        });
      }
    });

    if (updates.length > 0) {
      // 🔥 Persist immediately
      const promises = updates.map(u =>
        supabase
          .from("branches")
          .update({
            base_currency: u.base_currency,
            currencies: u.currencies
          })
          .eq("id", u.id)
      );

      Promise.all(promises).then(results => {
        const hasError = results.some(r => r.error);
        if (hasError) {
          console.log("Failed to auto-fix some branches", results);
        } else {
          // Update local state immediately
          setLocalBranches(prev => prev.map(branch => {
            const update = updates.find(u => u.id === branch.id);
            return update ? { ...branch, base_currency: update.base_currency, currencies: update.currencies } : branch;
          }));
        }
      });
    }
  }, [companyCurrencies, localBranches]);

  // Derive editingCurrencyConfig from editingSelectedCurrencies and editingBaseCurrency
  useEffect(() => {
    setEditingCurrencyConfig(prev => {
      const newConfig = {};

      editingSelectedCurrencies.forEach(code => {
        const isBase = code === editingBaseCurrency;

        newConfig[code] = {
          base: isBase,
          rate: isBase
            ? 1
            : prev?.[code]?.rate ?? 1
        };
      });

      return newConfig;
    });
  }, [editingSelectedCurrencies, editingBaseCurrency]);

  const addBranch = () => {
    // TODO: Implement add branch to DB
    alert('Add branch functionality not implemented yet')
  }

  const startEdit = (b) => {
    setEditingId(b.id)
    setEditingName(b.name)
    setEditingAddress(b.address)
    setEditingBaseCurrency(b.base_currency || (companyCurrencies[0] ? companyCurrencies[0].code : ''))
    const selected = [...new Set([...Object.keys(b.currencies || {}), b.base_currency])].filter(code => companyCurrencies.some(c => c.code === code))
    setEditingSelectedCurrencies(selected)
    // Build currency config from selected and rates
    const config = {};
    selected.forEach(code => {
      const isBase = code === b.base_currency;
      const existing = b.currencies && b.currencies[code];
      config[code] = existing ? existing : {
        base: isBase,
        rate: 1
      };
    });
    setEditingCurrencyConfig(config)
    // Don't set isEditMode to true here, let the Edit button do that
  }

  const saveEdit = async () => {
    try {
      const enabledCurrencies = Object.keys(editingCurrencyConfig);

      const { error } = await supabase
        .from('branches')
        .update({
          name: editingName,
          address: editingAddress,
          base_currency: editingBaseCurrency,
          currencies: editingCurrencyConfig
        })
        .eq('id', editingId)

      if (error) {
        console.error('Failed to update branch:', error)
        toast.error('Failed to update branch')
        return
      }

      toast.success('Branch updated successfully')
      setLocalBranches(prev => prev.map(b => b.id === editingId ? { 
        ...b, 
        name: editingName, 
        address: editingAddress, 
        base_currency: editingBaseCurrency, 
        currencies: editingCurrencyConfig 
      } : b))
      setEditingId(null)
      setIsEditMode(false)
      // Refresh branches
    } catch (err) {
      console.error('Unexpected error:', err)
      toast.error('Unexpected error occurred')
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsEditMode(false)
  }

  const handleBaseCurrencyChange = (newBase) => {
    setEditingBaseCurrency(newBase)
    setEditingSelectedCurrencies([newBase])
  }

  const removeBranch = async (id) => {
    try {
      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Failed to delete branch:', error)
        toast.error('Failed to delete branch')
        return
      }

      toast.success('Branch deleted successfully')
      setLocalBranches(prev => prev.filter(b => b.id !== id))
      // Refresh branches somehow, perhaps refetch context
    } catch (err) {
      console.error('Unexpected error:', err)
      toast.error('Unexpected error occurred')
    }
  }

  return (
    <ReusableCompanySidebar>
        <div className="px-5 font-WixMade">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold">Branch Management</h2>
            <div className="flex items-center gap-2">
              <Button className="h-7 inline-flex items-center bg-army hover:bg-army/85 gap-2" onClick={() => setShowAdd((v) => !v)}>
                <Plus size={14} />
                <span className="text-[10px]">Add New Branch</span>
              </Button>
            </div>
          </div>

          {showAdd && (
            <div className="mb-4 p-3 border rounded bg-white dark:bg-neutral-900">
              <div className="grid grid-cols-2 gap-2">
                <input className="p-2 border rounded text-[10px]" placeholder="Branch name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                <input className="p-2 border rounded text-[10px]" placeholder="Address" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
              </div>
              <div className="flex gap-2 mt-2">
                <Button className="h-7 text-[10px]" onClick={addBranch}>Add</Button>
                <Button variant="ghost" className="h-7 text-[10px]" onClick={() => setShowAdd(false)}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {localBranches.map((b) => (
              <div key={b.id} className="border rounded bg-white dark:bg-neutral-900">
                <div className="flex items-center justify-between py-3 relative top-1  pl-3 pr-7">
                  <div>
                    <div className="flex items-center gap-2">
                      <Button variant={'link'} className="text-xs h-7 font-medium hover:underline" onClick={() => router.push(`/admin/${params.u}/company/${params.companySlug}/branches/${b.id}`)}>{b.name}
                      {b.isheadoffice && <span className="text-[10px] text-zinc-500">(Head Office)</span>}</Button>
                    </div>
                    <div className="text-[10px] text-zinc-500">{b.address}, {b.city}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant={'outline'} className="h-6 shadow-none text-[10px]" onClick={() => {
                      startEdit(b)
                      setIsEditMode(true)
                    }}>
                      Edit
                    </Button>
                    {!b.isheadoffice && (
                      <Button className="h-6 inline-flex items-center gap-2" variant="destructive" onClick={() => removeBranch(b.id)}>
                        <Trash2 size={12} />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Branch Info / Edit Form */}
                <div className="p-3 border-t overflow-hidden">
                  {/* Edit Form */}
                  <div className={`transition-all duration-300 overflow-hidden ${editingId === b.id && isEditMode ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-medium">Edit Branch</h4>
                        <Button className="h-7 text-[10px]" variant="outline" onClick={() => setIsEditMode(false)}>Cancel</Button>
                      </div>

                      {/* Branch Name and Address */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-medium">Branch Name</label>
                          <input className="w-full p-2 border rounded text-[10px] mt-1" value={editingName} onChange={(e) => setEditingName(e.target.value)} />
                        </div>
                        <div>
                          <label className="text-[10px] font-medium">Address</label>
                          <input className="w-full p-2 border rounded text-[10px] mt-1" value={editingAddress} onChange={(e) => setEditingAddress(e.target.value)} />
                        </div>
                      </div>

                      {/* Available Currencies */}
                      <div>
                        <h5 className="text-[10px] font-medium mb-2">Company Allowed Currencies</h5>
                        <div className="flex flex-wrap gap-2">
                          {companyCurrencies.map((curr) => (
                            <TooltipProvider key={curr.code}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1 px-2 py-1 border rounded text-[10px]">
                                    <img src={curr.flag} alt={curr.name} className="w-3 h-3" />
                                    {curr.code}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{curr.name}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      </div>

                      {/* Base Currency */}
                      <div>
                        <label className="text-[10px] font-medium">Base Currency</label>
                        <Select value={editingBaseCurrency} onValueChange={handleBaseCurrencyChange}>
                          <SelectTrigger className="w-full mt-1 h-8 text-[10px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {companyCurrencies.map((curr) => (
                              <SelectItem key={curr.code} value={curr.code} className="text-[10px]">
                                <div className="flex items-center gap-2">
                                  <img src={curr.flag} alt={curr.name} className="w-4 h-4" />
                                  {curr.code} - {curr.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Select Currencies for the Branch */}
                      <div>
                        <h5 className="text-[10px] font-medium mb-2">Select Currencies for the Branch</h5>
                        <div className="grid grid-cols-2 gap-2">
                          {companyCurrencies.map((curr) => (
                            <TooltipProvider key={curr.code}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`curr-${curr.code}`}
                                      checked={editingSelectedCurrencies.includes(curr.code)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setEditingSelectedCurrencies([...editingSelectedCurrencies, curr.code]);
                                        } else {
                                          setEditingSelectedCurrencies(editingSelectedCurrencies.filter(c => c !== curr.code));
                                        }
                                      }}
                                      disabled={curr.code === editingBaseCurrency}
                                    />
                                    <label htmlFor={`curr-${curr.code}`} className="flex items-center gap-1 text-[10px] cursor-pointer">
                                      <img src={curr.flag} alt={curr.name} className="w-3 h-3" />
                                      {curr.code}
                                    </label>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{curr.name}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      </div>

                      {/* Exchange Rates */}
                      <div>
                        <h5 className="text-[10px] font-medium mb-2">
                          Exchange Rates (against Base Currency)
                        </h5>

                        <div className="space-y-2">
                          {editingSelectedCurrencies
                            .filter(c => c !== editingBaseCurrency)
                            .map((currCode) => {
                              const curr = companyCurrencies.find(c => c.code === currCode);

                              if (!curr) return null;

                              return (
                                <div key={currCode} className="flex items-center gap-2">
                                  <img src={curr.flag} alt={curr.name} className="w-3 h-3" />
                                  <span className="text-[10px] w-8">{curr.code}</span>
                                  <span className="text-[10px]">
                                    1 {editingBaseCurrency} =
                                  </span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    className="flex-1 p-1 border rounded text-[10px]"
                                    value={editingCurrencyConfig[currCode]?.rate || ''}
                                    onChange={(e) =>
                                      setEditingCurrencyConfig(prev => ({
                                        ...prev,
                                        [currCode]: {
                                          ...prev[currCode],
                                          rate: parseFloat(e.target.value) || 0
                                        }
                                      }))
                                    }
                                    placeholder="0.00"
                                  />
                                  <span className="text-[10px]">{curr.code}</span>
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-5">
                        <Button className="h-7 text-[10px] bg-blue-600 hover:bg-army/85" onClick={saveEdit}>Save</Button>
                        <Button variant="ghost" className="h-7 text-[10px]" onClick={() => setIsEditMode(false)}>Cancel</Button>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className={`transition-all duration-300 overflow-hidden ${editingId === b.id && isEditMode ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-screen opacity-100'}`}>
                    <div className="space-y-3">
                      <div className="text-[10px]">
                        <p><strong>Address:</strong> {b.address}</p>
                      </div>
                      <div className="text-[10px]">
                        <p><strong>Company Currencies:</strong></p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {companyCurrencies.map((curr) => (
                            <TooltipProvider key={curr.code}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1 px-2 py-1 border rounded text-[10px]">
                                    <img src={curr.flag} alt={curr.name} className="w-3 h-3" />
                                    {curr.code}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{curr.name}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      </div>
                      <div className="text-[10px]">
                        <p><strong>Base Currency:</strong> {b.base_currency || 'N/A'}</p>
                      </div>
                      <div className="text-[10px]">
                        <p><strong>Branch Currencies:</strong></p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {Object.keys(b.currencies || {}).map((currCode) => {
                            const curr = companyCurrencies.find(c => c.code === currCode);
                            return curr ? (
                              <TooltipProvider key={currCode}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1 px-2 py-1 border rounded text-[10px]">
                                      <img src={curr.flag} alt={curr.name} className="w-3 h-3" />
                                      {curr.code}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{curr.name}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : null;
                          })}
                        </div>
                      </div>
                      {b.currencies && Object.keys(b.currencies).length > 0 && (
                        <div className="text-[10px]">
                          <p><strong>Exchange Rates:</strong> {Object.entries(b.currencies).map(([curr, conf]) => `${curr}: ${conf.rate}`).join(', ')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
    </ReusableCompanySidebar>
  )
}
