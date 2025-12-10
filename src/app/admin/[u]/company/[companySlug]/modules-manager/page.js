"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  FileChartLine,
  ChartCandlestick,
  Settings,
  Users,
  Check,
  Plus,
  Info,
} from 'lucide-react'

const sampleModules = [
  {
    id: 'dashboard',
    name: 'Company Dashboard',
    description: 'Overview of company metrics, sales, and recent activity.',
    icon: LayoutDashboard,
    included: true,
    users: 12,
  },
  {
    id: 'reports',
    name: 'Reports & Analytics',
    description: 'Customizable reports, charts, and exportable analytics.',
    icon: ChartCandlestick,
    included: false,
    users: 0,
  },
  {
    id: 'inventory',
    name: 'Inventory Manager',
    description: 'Manage stock levels, SKUs, and product variants.',
    icon: FileChartLine,
    included: true,
    users: 4,
  },
  {
    id: 'settings',
    name: 'Settings & Access',
    description: 'Company-level settings, roles and permissions.',
    icon: Settings,
    included: true,
    users: 3,
  },
  {
    id: 'staff',
    name: 'Staff Directory',
    description: 'Manage employees, invites, and permissions.',
    icon: Users,
    included: false,
    users: 0,
  },
]

export default function ModulesManagementPage() {
  const [modules, setModules] = useState(sampleModules)

  const toggleModule = (id) => {
    setModules((m) => m.map((mod) => (mod.id === id ? { ...mod, included: !mod.included } : mod)))
  }

  return (
    <div className="px-5 font-WixMade">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-base font-semibold">Modules Manager</h1>
          <p className="text-xs text-muted-foreground">Manage which apps and modules are available to this company and its branches.</p>
        </div>
        {/* <Button className="h-7 inline-flex items-center gap-2">
          <Plus size={14} />
          <span className="text-xs">Add Module</span>
        </Button> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod) => {
          const Icon = mod.icon || Info
          return (
            <article
              key={mod.id}
              className="relative rounded-lg overflow-hidden border  border-core"

            >
              {/* Badge */}
              <div className="absolute right-3 top-3 z-10">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${mod.included ? 'bg-green-100 text-green-600' : 'bg-zinc-100 text-zinc-700'}`}>
                  {mod.included ? <Check size={12} /> : <Plus size={12} />}
                  {mod.included ? 'Included' : 'Not Added'}
                </span>
              </div>

              <div className="p-4 flex gap-4 items-start" style={{ minHeight: 140, maxHeight: 180 }}>
                <div className="shrink-0">
                  <div className="w-14 h-14 rounded-lg bg-white/70 border border-white flex items-center justify-center shadow">
                    <Icon size={22} className="text-army" />
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-sm font-semibold mb-1">{mod.name}</h3>
                  <p className="text-xs text-zinc-600 mb-3">{mod.description}</p>

                  <div className="flex items-center gap-3">
                    <div className="text-xs text-zinc-500">Users: <span className="font-medium text-zinc-700">{mod.users}</span></div>
                    <div className="h-4 w-px bg-zinc-200" />
                    <Button data-included={mod.included} className="h-6 bg-core data-[included=true]:bg-army hover:bg-core/85 data-[included=true]:hover:bg-army/85 text-xs" onClick={() => toggleModule(mod.id)}>{mod.included ? 'Remove' : 'Add'}</Button>
                      {mod.included && (
                        <Button variant="ghost" className="h-7 text-xs">Configure</Button>
                      )}
                  </div>
                </div>
              </div>

              <div className="px-4 py-2 border-t border-white/50 bg-white/30 flex items-center justify-between">
                <div className="text-xs text-zinc-500">Module ID: <span className="font-mono text-xs text-zinc-700">{mod.id}</span></div>
                <div className="text-xs text-zinc-500">Status: <span className="font-medium text-zinc-700">{mod.included ? 'Active' : 'Inactive'}</span></div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}