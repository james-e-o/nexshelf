'use client'

import { useContext, useEffect, useState } from 'react'       
import { DataContext } from './layout'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Factory } from 'lucide-react'
import Link from 'next/link'
import { Spinner } from '@/components/ui/spinner'
import UserSidebarLayout from '@/components/user-sidebar-layout'
import supabase from '@/config/supabaseClient'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

function UserDashboardContent() {
  const params = useParams()
  const router = useRouter()
  const { data, setData } = useContext(DataContext)
  const [pendingInvites, setPendingInvites] = useState([])
  const [showInvitesDialog, setShowInvitesDialog] = useState(false)
  const [loadingInvites, setLoadingInvites] = useState(true)

  // Fetch pending company invites
  useEffect(() => {
    const fetchPendingInvites = async () => {
      if (!data?.profile?.email) {
        console.log('No email available yet')
        return
      }
      
      try {
        setLoadingInvites(true)
        console.log('Fetching invites for:', data.profile.email)
        
        const { data: invites, error } = await supabase
          .from('company_invites')
          .select('*')
          .eq('email', data.profile.email)
          .in('status', ['pending', 'registered'])
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching invites:', error)
          return
        }

        console.log('Fetched invites:', invites)
        setPendingInvites(invites || [])
        
        // Update context with pending count
        setData(prev => ({
          ...prev,
          pendingInvitesCount: invites?.length || 0,
          pendingInvites: invites || []
        }))

        // Show dialog if there are pending invites
        if (invites && invites.length > 0) {
          console.log('Setting dialog to open')
          setShowInvitesDialog(true)
        } else {
          console.log('No invites found')
        }
      } catch (err) {
        console.error('Unexpected error fetching invites:', err)
        toast.error('Failed to load pending invites')
      } finally {
        setLoadingInvites(false)
      }
    }

    fetchPendingInvites()
  }, [data?.profile?.email, setData])

  return (
    <>
      {/* DEBUG: Show dialog state */}
      {showInvitesDialog && (
        <div className="fixed top-4 left-4 z-40 bg-blue-500 text-white p-2 rounded text-sm">
          Dialog should be open ({pendingInvites.length} invites)
        </div>
      )}

      {/* Pending Invites Modal */}
      <Dialog open={showInvitesDialog} onOpenChange={setShowInvitesDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pending Company Invitations</DialogTitle>
            <DialogDescription>
              You have {pendingInvites.length} pending invitation{pendingInvites.length !== 1 ? 's' : ''} from compan{pendingInvites.length !== 1 ? 'ies' : 'y'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loadingInvites ? (
              <div className="flex items-center justify-center py-8">
                <Spinner spinning={true} className="size-5 text-core" />
              </div>
            ) : pendingInvites.length > 0 ? (
              pendingInvites.map(invite => (
                <div key={invite.id} className="p-4 border border-core/20 rounded-lg bg-core/5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {invite.logo_url && (
                        <img
                          src={invite.logo_url}
                          alt={invite.company_name}
                          className="w-12 h-12 object-contain rounded mb-2"
                        />
                      )}
                      <p className="font-semibold text-sm">{invite.company_name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Invited by: {invite.invited_by || 'Company Admin'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(invite.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-xs font-semibold px-2 py-1 bg-orange-100 text-orange-700 rounded">
                      PENDING
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No pending invites</p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Link href={`/users/${params.u}/company-invites`} className="flex-1">
              <Button className="w-full bg-core hover:bg-core/90">
                View All Invites
              </Button>
            </Link>
            <DialogClose asChild>
              <Button variant="outline" className="flex-1">
                Dismiss
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Dashboard Content */}
      <div>
        <div>
          <h1 className="text-xl font-semibold">Welcome, {data.profile?.username}</h1>
        </div>
        <div className='mt-4'>
          {data?.companiesLoading ? (
            <div className='flex items-center justify-center h-64 gap-2'>
              <span className='text-gray-600'>Loading companies</span>
              <Spinner className='size-4 text-core' spinning={true} />
            </div>
          ) : data?.companies?.length > 0 ? (
            <div className='space-y-4'>
              {data.companies.map((company, index) => (
                <Link key={company.id || company.slug || index} href={`/users/${params.u}/company/${company.id}`}>
                  <div className='p-4 rounded-lg border border-gray-200 hover:border-core hover:shadow-md transition-all cursor-pointer'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h3 className='font-medium'>{company.name}</h3>
                        <p className='text-xs text-gray-500 mt-1'>{company.slug}</p>
                      </div>
                      {company.badge && (
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          company.badge === 'owner' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {company.badge.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className='bg-armylight rounded-2xl px-5 py-7 text-center'>
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-white">
                  <Factory className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    No Companies yet created
                  </h3>
                </div>
                <Link href={`/users/${params.u}/new-company`}>
                  <Button className='mt-2 h-8 hover:bg-core/90 text-xs bg-core'>
                    Create Company
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function AdminUserPage() {
  return (
    <UserSidebarLayout>
      <UserDashboardContent />
    </UserSidebarLayout>
  )
}
