
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

const Admin = async () => {
  const supabase = createClient()
 
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('accounts/login')
  }

  const { data: profile, error: profileError } = await supabase
      .from('admins')
      .select('username, handle')
      .eq('id', session.user.id)
      .single()
    // console.log('profile from admin',profile)
    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError)
      redirect('accounts/login')
    }


   redirect(`/admin/${profile.handle}`)

}

export default Admin


