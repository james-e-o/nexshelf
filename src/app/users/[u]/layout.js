'use client'
import { useEffect, useState, createContext } from "react"
import { Spinner } from '@/components/ui/spinner'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from "../../../../config/supabaseClient"
import { toast } from "sonner"

export const DataContext = createContext()
export const RefreshContext = createContext()

const PageLayout = ({ children }) => {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState({ profile: null, companies: null })
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
      const loginTime = Number(localStorage.getItem("login_timestamp"));

      const now = Date.now();
      const ONE_DAY = 24 * 60 * 60 * 1000;

      // Rule 1: 24 hours passed → logout
      if (now - loginTime > ONE_DAY) {
        supabase.auth.signOut();
        localStorage.setItem("login_timestamp:",'');
        router.push("/accounts/login");
        return;
      }
  }, []);


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
          .from('users')
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
  }, [params.u, router])

  // Prevent showing dashboard if either profile or companies not ready
  if (isLoading || !data.profile ) {
    return (
      <div className='overflow-hidden flex justify-center items-center h-full'>
        <Spinner className='size-8 text-core' spinning={true} />
      </div>
    )
  }

  // ✅ Fully authorized and data loaded
  return (
    <RefreshContext.Provider value={{ refreshKey, setRefreshKey }}>
      <DataContext.Provider value={{ data, setData }}>
        {children}
      </DataContext.Provider>
    </RefreshContext.Provider>
  )
}

export default PageLayout
