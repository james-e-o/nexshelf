'use client'

import { useContext, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DataContext } from '../layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import Link from 'next/link'

export default function CompanyInvitesPage() {
  const { data } = useContext(DataContext)
  const params = useParams()
  const router = useRouter()

  const [invites, setInvites] = useState([])
  const [decliningId, setDecliningId] = useState(null)

  const handleDeclineInvite = async (inviteId) => {
    try {
      setDecliningId(inviteId)

      setInvites(prev =>
        prev.map(invite =>
          invite.id === inviteId ? { ...invite, status: 'declined' } : invite
        )
      )

      toast.success('Invite declined')
    } catch (err) {
      console.error(err)
      toast.error('Failed to decline invite')
    } finally {
      setDecliningId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Company Invites</h1>
        <p className="text-gray-600">
          Manage your company invitations ({invites.length})
        </p>
      </div>

      {invites.length === 0 ? (
        <p className="text-gray-500">No invites</p>
      ) : (
        <div className="space-y-4">
          {invites.map(invite => (
            <Card key={invite.id} className="border">
              <CardContent className="flex items-center justify-between p-4">
                
                {/* LEFT SIDE */}
                <div>
                  <p className="font-semibold text-lg">
                    {invite.company_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Invited via {invite.email}
                  </p>
                </div>

                {/* RIGHT SIDE ACTIONS */}
                <div className="flex gap-2">
                  <Link href={`/users/${params.u}/company-invites/${encodeURIComponent(invite.company_name)}`}>
                    <Button className="bg-army text-white hover:bg-army/90">
                      Accept
                    </Button>
                  </Link>

                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => handleDeclineInvite(invite.id)}
                    disabled={decliningId === invite.id}
                  >
                    Decline
                  </Button>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}