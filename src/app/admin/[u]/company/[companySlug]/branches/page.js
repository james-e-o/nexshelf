"use client"

import React, { useState, useContext } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Edit3, Trash2 } from 'lucide-react'
import { CompanyInfoContext } from '../layout'

export default function BranchesPage() {
  const { branches } = useContext(CompanyInfoContext)

  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAddress, setNewAddress] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [editingAddress, setEditingAddress] = useState('')

  const addBranch = () => {
    // TODO: Implement add branch to DB
    alert('Add branch functionality not implemented yet')
  }

  const startEdit = (b) => {
    // TODO: Implement edit branch
    alert('Edit branch functionality not implemented yet')
  }

  const saveEdit = () => {
    // TODO
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingName('')
    setEditingAddress('')
  }

  const removeBranch = (id) => {
    // TODO: Implement remove branch
    alert('Remove branch functionality not implemented yet')
  }

  return (
    <div className="px-5 font-WixMade">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold">Branch Management</h2>
        <div className="flex items-center gap-2">
          <Button className="h-7 inline-flex items-center bg-army hover:bg-army/85 gap-2" onClick={() => setShowAdd((v) => !v)}>
            <Plus size={14} />
            <span className="text-xs">Add New Branch</span>
          </Button>
        </div>
      </div>

      {showAdd && (
        <div className="mb-4 p-3 border rounded bg-white dark:bg-neutral-900">
          <div className="grid grid-cols-2 gap-2">
            <input className="p-2 border rounded text-sm" placeholder="Branch name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <input className="p-2 border rounded text-sm" placeholder="Address" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
          </div>
          <div className="flex gap-2 mt-2">
            <Button className="h-7" onClick={addBranch}>Add</Button>
            <Button variant="ghost" className="h-7" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {branches.map((b) => (
          <div key={b.id} className="flex items-center justify-between p-3 border rounded bg-white dark:bg-neutral-900">
            <div>
              {editingId === b.id ? (
                <div className="grid gap-2">
                  <input className="p-2 border rounded text-sm" value={editingName} onChange={(e) => setEditingName(e.target.value)} />
                  <input className="p-2 border rounded text-sm" value={editingAddress} onChange={(e) => setEditingAddress(e.target.value)} />
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{b.name}</span>
                    {b.isheadoffice && <span className="text-xs text-zinc-500">(Head Office)</span>}
                  </div>
                  <div className="text-xs text-zinc-500">{b.address}, {b.city}</div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {editingId === b.id ? (
                <>
                  <Button className="h-7" onClick={saveEdit}>Save</Button>
                  <Button variant="ghost" className="h-7" onClick={cancelEdit}>Cancel</Button>
                </>
              ) : (
                <>
                  <Button variant={'outline'} className="h-6 inline-flex  items-center gap-2" onClick={() => startEdit(b)}>
                    <Edit3 size={12} />
                  </Button>
                  {!b.isheadoffice && (
                    <Button className="h-6 inline-flex items-center gap-2" variant="destructive" onClick={() => removeBranch(b.id)}>
                      <Trash2 size={12} />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}