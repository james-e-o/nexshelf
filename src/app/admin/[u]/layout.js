'use client'
import { useEffect, useState, createContext } from "react"
import { Spinner } from '@/components/ui/spinner'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from "../../../../config/supabaseClient"
import { toast } from "sonner"

export const DataContext = createContext()

const PageLayout = ({ children }) => {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState({ profile: null, companies: null })

  useEffect(() => {
    async function ValidateUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setIsLoading(false)
          router.push('/accounts/login')
          return
        }

        const userID = user.id
        const { data: profile, error: profileError } = await supabase
          .from('admins')
          .select('*')
          .eq('id', userID)
          .single()

        if (!profile || profileError) {
          setData(prev => ({ ...prev, profile: null }))
          alert('No profile found for this user, try reloading this page.')
          setIsLoading(false)
          router.push('/accounts/login')
          return
        }

        // Compare the logged-in user's handle to the route param
        if (params.u !== profile.handle) {
          console.warn(`Unauthorized access attempt by ${profile.handle}`)
          setIsLoading(false)
          router.push(`/admin/${profile.handle}`)
          return
        }

        // ✅ Set profile first
        setData(prev => ({ ...prev, profile }))

        // ✅ Now fetch companies for this user
        const { data: companies, error: companyError } = await supabase
          .from('companies')
          .select('id, name, slug')
          .eq('owner', userID)

        if (companyError) {
          console.error('Company fetch error:', companyError)
          alert('Unable to load your companies. Please try again later.')
          setData(prev => ({ ...prev, companies: [] }))
          setIsLoading(false)
          return
        }

        if (!companies || companies.length === 0) {
          toast('No companies found for this account.')
          setData(prev => ({ ...prev, companies: [] }))
          setIsLoading(false)
          return
        }

        // ✅ Save both profile and companies together
        setData(prev => ({
          ...prev,
          profile,
          companies,
        }))

        } catch (err) {
            console.error('Unexpected error:', err)
            alert('Something went wrong while loading your account. Please log in again.')
            router.push('/accounts/login')
            return
        } finally {
            setIsLoading(false)
        }
    }

    ValidateUser()

      const channel = supabase
      .channel('companies-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'companies' },
        (payload) => {
          console.log('Realtime update:', payload)

          // You can refetch or manually adjust state:
          if (payload.eventType === 'INSERT') {
            setData(prev => ({
              ...prev,
              companies: [...prev.companies, payload.new],
            }))
          } else if (payload.eventType === 'UPDATE') {
            setData(prev => ({
              ...prev,
              companies: prev.companies.map(c =>
                c.id === payload.new.id ? payload.new : c
              ),
            }))
          } else if (payload.eventType === 'DELETE') {
            setData(prev => ({
              ...prev,
              companies: prev.companies.filter(c => c.id !== payload.old.id),
            }))
          }
        }
      )
      .subscribe()

    // cleanup when component unmounts
    return () => {
      supabase.removeChannel(channel)
    }
  }, [params.u, router])

  // Prevent showing dashboard if either profile or companies not ready
  if (isLoading || !data.profile || !data.companies) {
    return (
      <div className='overflow-hidden flex justify-center items-center h-full'>
        <Spinner className='size-8 text-core' spinning={true} />
      </div>
    )
  }

  // ✅ Fully authorized and data loaded
  return (
    <DataContext.Provider value={{ data, setData }}>
      {children}
    </DataContext.Provider>
  )
}

export default PageLayout
