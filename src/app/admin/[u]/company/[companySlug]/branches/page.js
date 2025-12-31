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
import { Input } from '@/components/ui/input'
import { supabase } from '../../../../../../../config/supabaseClient'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export default function BranchesPage() {
  const { branches, info, currencies, modules } = useContext(CompanyInfoContext)
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
  const [editingSelectedModules, setEditingSelectedModules] = useState([])
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
  // Note: branch editing moved to per-branch settings pages.

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
                <Input className="p-2 border rounded text-[10px]" placeholder="Branch name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                <Input className="p-2 border rounded text-[10px]" placeholder="Address" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
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
                    <Button variant={'outline'} className="h-6 shadow-none text-[10px]" onClick={() => router.push(`/admin/${params.u}/company/${params.companySlug}/branches/${b.id}/settings`)}>
                      Edit
                    </Button>
                    {!b.isheadoffice && (
                      <Button className="h-6 inline-flex items-center gap-2" variant="destructive" onClick={() => removeBranch(b.id)}>
                        <Trash2 size={12} />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Branch Info */}
                <div className="p-6 border-t">
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
            ))}
          </div>
        </div>
    </ReusableCompanySidebar>
  )
}
