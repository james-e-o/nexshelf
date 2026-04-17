'use client'

import { useContext, useEffect } from 'react'
import { DataContext } from '@/app/users/[u]/layout'
import { AppSidebar } from '@/components/sidebars/app-sidebar/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import Header from '@/components/headers/dashboard-header'
import { Button } from '@/components/ui/button'
import { Bell } from 'lucide-react'
import supabase from '@/config/supabaseClient'
import { toast } from 'sonner'

/**
 * Reusable sidebar layout wrapper for user dashboard routes
 * Provides consistent sidebar, header, and layout across all user routes
 * Fetches companies once and shares via DataContext
 *
 * Usage:
 * <UserSidebarLayout>
 *   <YourContent />
 * </UserSidebarLayout>
 */
export default function UserSidebarLayout({ children }) {
  const { data, setData } = useContext(DataContext)

  // Fetch user's companies (owned + staff) - runs once for all sidebar routes
  useEffect(() => {
    if (!data?.companies && data?.profile?.id) {
      const fetchAllCompanies = async () => {
        // Mark loading as true
        setData(prev => ({ ...prev, companiesLoading: true }))
        
        try {
          // Fetch companies owned by user
          const { data: ownedCompanies, error: companyError } = await supabase
            .from('companies')
            .select('id, name, slug')
            .eq('owner', data.profile.id)

          if (companyError) {
            console.error('Company fetch error:', companyError)
            toast.error('Unable to load your companies. Please try again later.')
            setData(prev => ({ ...prev, companies: [], companiesLoading: false }))
            return
          }

          // Fetch companies where user is staff
          const { data: staffRecords, error: staffError } = await supabase
            .from('staff')
            .select('company')
            .eq('id', data.profile.id)

          if (staffError) {
            console.error('Staff fetch error:', staffError)
          }

          // Get unique company IDs from staff records
          const staffCompanyIds = staffRecords
            ? [...new Set(staffRecords.map(record => record.company))]
            : []

          // Fetch company details for staff companies
          let staffCompanies = []
          if (staffCompanyIds.length > 0) {
            const { data: companies, error: fetchError } = await supabase
              .from('companies_lite')
              .select('company_id, name, slug')
              .in('company_id', staffCompanyIds)

            if (!fetchError && companies) {
              staffCompanies = companies.map(company => ({
                ...company,
                badge: 'staff'
              }))
            }
          }

          // Add badge to owned companies
          const ownedWithBadge = (ownedCompanies || []).map(company => ({
            ...company,
            badge: 'owner'
          }))

          // Combine both lists (owned first, then staff)
          const allCompanies = [...ownedWithBadge, ...staffCompanies]

          // Save combined list to context
          setData(prev => ({
            ...prev,
            companies: allCompanies,
            companiesLoading: false
          }))
        } catch (err) {
          console.error('Unexpected error fetching companies:', err)
          toast.error('An error occurred while loading companies.')
          setData(prev => ({ ...prev, companies: [], companiesLoading: false }))
        }
      }

      fetchAllCompanies()
    }
  }, [data?.profile?.id, data?.companies, setData])

  return (
    <SidebarProvider className="relative">
      <AppSidebar />
      <SidebarInset className="overflow-hidden h-svh static">
        <div className="flex h-full overflow-hidden flex-col">
          <div className="flex-col overflow-hidden h-full flex">
            {/* Header */}
            <div className="h-12">
              <Header>
                <div className="flex">
                  <div className="md:flex gap-2 hidden mr-1 items-center"></div>
                  <Button variant="ghost" size="icon" className="relative ml-3">
                    <Bell className="h-5 w-5" />
                    {data?.pendingInvitesCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 text-[9px] bg-red-600 translate-x-[-48.8%] translate-y-[48.9%] text-white font-semibold flex items-center justify-center size-3.5 rounded-full">
                        {data.pendingInvitesCount > 99 ? '99+' : data.pendingInvitesCount}
                      </span>
                    )}
                  </Button>
                </div>
              </Header>
            </div>

            {/* Main Content */}
            <div
              className="flex-col font-WixMade overflow-y-auto grow py-4 flex px-8" >
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
