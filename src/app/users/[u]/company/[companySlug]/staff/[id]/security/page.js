'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Lock, Shield } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function SecurityTab({ staffData, setStaffData, isOwner }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogAction, setDialogAction] = useState(null) // 'suspend', 'reactivate', 'delete'

  const handleSuspend = () => {
    // UI update only - API integration will be added separately
    setIsDialogOpen(false)
  }

  const handleReactivate = () => {
    // UI update only - API integration will be added separately
    setIsDialogOpen(false)
  }

  const handleDelete = () => {
    // UI update only - API integration will be added separately
    setIsDialogOpen(false)
  }

  const handleDialogAction = async (action) => {
    setDialogAction(action)
    setIsDialogOpen(true)
  }

  const InfoSection = ({ title, children }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {children}
    </div>
  )

  if (!isOwner) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <Lock className="size-5 text-red-600 mt-0.5 shrink-0" />
            <div className="space-y-2">
              <p className="font-semibold text-red-900">Access Restricted</p>
              <p className="text-sm text-red-800">
                Only the company owner can access security settings. If you need to make security
                changes, please contact your company administrator.
              </p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <Card className="border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-3">
          <Shield className="size-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-900">Security Controls</p>
            <p className="text-sm text-amber-800">
              These actions affect the staff member's access to the system. Proceed with caution.
            </p>
          </div>
        </div>
      </Card>

      {/* Account Status */}
      <Card className="border-gray-200 shadow-sm p-6">
        <InfoSection title="Account Status">
          <div className="space-y-4">
            <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-1">
                <p className="font-semibold text-gray-900">Current Status</p>
                <p className="text-sm text-gray-600">
                  {staffData.status === 'active' && 'Staff member has full system access'}
                  {staffData.status === 'suspended' && 'Staff member cannot access the system'}
                  {staffData.status === 'pending' && 'Staff member invitation is pending'}
                  {staffData.status === 'terminated' && 'Staff member has been removed'}
                </p>
              </div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                  staffData.status === 'active'
                    ? 'bg-green/10 text-green'
                    : staffData.status === 'suspended'
                      ? 'bg-red-500/10 text-red-500'
                      : 'bg-gray-500/10 text-gray-500'
                }`}
              >
                {staffData.status}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {staffData.status === 'active' && (
                <Button
                  onClick={() => handleDialogAction('suspend')}
                  disabled={isProcessing}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Suspend Account
                </Button>
              )}

              {staffData.status === 'suspended' && (
                <Button
                  onClick={() => handleDialogAction('reactivate')}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Reactivate Account
                </Button>
              )}

              <Button
                onClick={() => handleDialogAction('delete')}
                disabled={isProcessing}
                className="bg-gray-400 hover:bg-gray-500 text-white"
              >
                Remove from Company
              </Button>
            </div>
          </div>
        </InfoSection>
      </Card>

      {/* Password Reset */}
      <Card className="border-gray-200 shadow-sm p-6">
        <InfoSection title="Password Management">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Force the staff member to reset their password on next login.
            </p>
            <Button
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Force Password Reset (Coming Soon)
            </Button>
          </div>
        </InfoSection>
      </Card>

      {/* Session Management */}
      <Card className="border-gray-200 shadow-sm p-6">
        <InfoSection title="Session Management">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              View and manage the staff member's active sessions.
            </p>
            <Button
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              View Active Sessions (Coming Soon)
            </Button>
          </div>
        </InfoSection>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="border-gray-200">
          <AlertDialogTitle className="text-gray-900">
            {dialogAction === 'suspend' && 'Suspend Staff Member?'}
            {dialogAction === 'reactivate' && 'Reactivate Staff Member?'}
            {dialogAction === 'delete' && 'Remove Staff Member?'}
          </AlertDialogTitle>

          <AlertDialogDescription className="text-gray-600">
            {dialogAction === 'suspend' && (
              <div className="space-y-2">
                <p>
                  This will immediately suspend @{staffData.users?.handle} from accessing the
                  system.
                </p>
                <p className="text-xs">
                  • All active sessions will be terminated
                  <br />
                  • They can be reactivated later
                  <br />
                  • All their data will be preserved
                </p>
              </div>
            )}

            {dialogAction === 'reactivate' && (
              <div className="space-y-2">
                <p>
                  This will restore @{staffData.users?.handle} access to the system.
                </p>
                <p className="text-xs">• They will need to log in again</p>
              </div>
            )}

            {dialogAction === 'delete' && (
              <div className="space-y-2">
                <p className="font-semibold text-red-700">This action cannot be undone.</p>
                <p>
                  This will permanently remove @{staffData.users?.handle} from {staffData.company_name}.
                </p>
                <p className="text-xs">
                  • Their transaction history will be preserved for audit purposes
                  <br />
                  • They will lose all access immediately
                  <br />
                  • Their account will be marked as terminated
                </p>
              </div>
            )}
          </AlertDialogDescription>

          <div className="flex gap-3 justify-end">
            <AlertDialogCancel
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={isProcessing}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (dialogAction === 'suspend') handleSuspend()
                else if (dialogAction === 'reactivate') handleReactivate()
                else if (dialogAction === 'delete') handleDelete()
              }}
              disabled={isProcessing}
              className={
                dialogAction === 'delete'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-core hover:bg-core/90'
              }
            >
              {isProcessing ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
