'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const ACCESS_LEVELS = {
  owner: {
    label: 'Owner',
    description: 'Full system access. Company owner.',
    priority: 1,
  },
  admin: {
    label: 'Admin',
    description: 'Full company access. Can manage staff and settings.',
    priority: 2,
  },
  manager: {
    label: 'Manager',
    description: 'Department management. Can manage assigned team members.',
    priority: 3,
  },
  staff: {
    label: 'Staff',
    description: 'Basic access. Standard employee permissions.',
    priority: 4,
  },
  viewer: {
    label: 'Viewer',
    description: 'View-only access. Cannot make changes.',
    priority: 5,
  },
}

export default function PermissionsTab({ staffData, setStaffData }) {
  const [selectedAccessLevel, setSelectedAccessLevel] = useState(
    staffData.access_level || 'staff'
  )

  const handleAccessLevelChange = (newLevel) => {
    setSelectedAccessLevel(newLevel)
    // UI update only - API integration will be added separately
  }

  const InfoSection = ({ title, children }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {children}
    </div>
  )

  const AccessLevelCard = ({ level, config }) => (
    <div
      className={`border rounded-lg p-4 transition-all ${
        selectedAccessLevel === level
          ? 'border-core bg-core/5 shadow-sm'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="font-semibold text-gray-900">{config.label}</p>
          <p className="text-sm text-gray-600">{config.description}</p>
        </div>
        <span className="text-xs font-medium text-gray-500">
          Priority: {config.priority}
        </span>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Current Access Level Info */}
      <Card className="border-gray-200 shadow-sm p-6">
        <InfoSection title="Current Access Level">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900">
              {ACCESS_LEVELS[staffData.access_level]?.label || 'N/A'}
            </p>
            <p className="text-sm text-blue-800 mt-1">
              {ACCESS_LEVELS[staffData.access_level]?.description}
            </p>
          </div>
        </InfoSection>
      </Card>

      {/* Change Access Level */}
      <Card className="border-gray-200 shadow-sm p-6">
        <InfoSection title="Change Access Level">
          <div className="space-y-4">
            <div className="grid gap-3">
              {Object.entries(ACCESS_LEVELS).map(([level, config]) => (
                <div key={level}>
                  <button
                    onClick={() => handleAccessLevelChange(level)}
                    disabled={isUpdating}
                    className="w-full text-left"
                  >
                    <AccessLevelCard level={level} config={config} />
                  </button>
                </div>
              ))}
            </div>

            {isUpdating && (
              <p className="text-sm text-gray-600">Updating access level...</p>
            )}

            {/* Quick Select Dropdown */}
            <div className="pt-4 border-t border-gray-200">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Or select from dropdown:
              </label>
              <Select
                value={selectedAccessLevel}
                onValueChange={handleAccessLevelChange}
              >
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Select access level" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ACCESS_LEVELS).map(([level, config]) => (
                    <SelectItem key={level} value={level}>
                      {config.label} - {config.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </InfoSection>
      </Card>

      {/* Access Level Reference */}
      <Card className="border-gray-200 shadow-sm p-6">
        <InfoSection title="Access Level Reference">
          <div className="space-y-3 text-sm">
            <p className="text-gray-600">
              Access levels determine what actions this staff member can perform in the system.
            </p>
            <div className="bg-gray-50 rounded p-4 space-y-2">
              {Object.entries(ACCESS_LEVELS).map(([level, config]) => (
                <div key={level} className="flex justify-between items-start">
                  <span className="font-medium text-gray-900">{config.label}</span>
                  <span className="text-gray-600 text-xs">Priority {config.priority}</span>
                </div>
              ))}
            </div>
          </div>
        </InfoSection>
      </Card>
    </div>
  )
}
