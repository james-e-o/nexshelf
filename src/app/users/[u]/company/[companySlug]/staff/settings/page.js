'use client'

import { useContext } from 'react'
import Link from 'next/link'
import { CompanyInfoContext } from '../../layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function StaffSettings() {
  const { info, user } = useContext(CompanyInfoContext)

  return (
    <div className="space-y-6">
      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="border-gray-200 shadow-sm p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
            <p className="text-sm text-gray-600 mb-4">
              Configure general staff module behavior and defaults
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default staff role
                </label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email notifications
                </label>
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-600">Notify on new staff invitations</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Invitation Settings */}
        <Card className="border-gray-200 shadow-sm p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Invitation Settings</h3>
            <p className="text-sm text-gray-600 mb-4">
              Configure how staff invitations are handled
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invitation expiry (days)
                </label>
                <input
                  type="number"
                  defaultValue="7"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Auto-enable access
                </label>
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-sm text-gray-600">Automatically enable after acceptance</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex gap-3">
        <Button className="bg-core hover:bg-core/90 text-white border-0">
          Save Settings
        </Button>
        <Button variant="outline" className="border-gray-300">
          Cancel
        </Button>
      </div>
    </div>
  )
}
