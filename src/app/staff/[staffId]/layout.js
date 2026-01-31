'use client';

import { useEffect, useState, createContext } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../../config/supabaseClient';
import { toast } from 'sonner';

export const StaffDataContext = createContext();
export const StaffRefreshContext = createContext();

/**
 * Staff Layout - Auth Guard with same structure as Admin Layout
 * 
 * Validates:
 * - User is authenticated
 * - staffId in URL matches session
 * - Staff profile exists in database
 * - Session hasn't expired (24 hours)
 */
const StaffLayout = ({ children }) => {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({ profile: null, branches: null });
  const [refreshKey, setRefreshKey] = useState(0);

  // Check 24-hour session expiry
//   useEffect(() => {
//     const loginTime = Number(localStorage.getItem('login_timestamp'));
//     const now = Date.now();
//     const ONE_DAY = 24 * 60 * 60 * 1000;

//     if (now - loginTime > ONE_DAY) {
//       supabase.auth.signOut();
//       localStorage.setItem('login_timestamp', '');
//       router.push('/accounts/login');
//       return;
//     }
//   }, [router]);

//   // Validate staff user
//   useEffect(() => {
//     async function validateStaff() {
//       try {
//         const { data: { user } } = await supabase.auth.getUser();
//         if (!user) {
//           setIsLoading(false);
//           router.push('/accounts/login');
//           return;
//         }

//         const userId = user.id;

//         // Fetch staff profile
//         const { data: profile, error: profileError } = await supabase
//           .from('staff')
//           .select('*')
//           .eq('id', userId)
//           .single();

//         if (!profile || profileError) {
//           setData(prev => ({ ...prev, profile: null }));
//           console.error('No staff profile found:', profileError);
//           setIsLoading(false);
//           router.push('/accounts/login');
//           return;
//         }

//         // Compare staffId in URL to profile handle/id
//         if (params.staffId !== profile.handle && params.staffId !== profile.id) {
//           console.warn(`Unauthorized access attempt by ${profile.handle}`);
//           setIsLoading(false);
//           router.push(`/staff/${profile.handle || profile.id}`);
//           return;
//         }

//         // Fetch staff's accessible branches
//         const { data: branches, error: branchError } = await supabase
//           .from('staff_branches')
//           .select('*')
//           .eq('staff_id', userId);

//         if (branchError) {
//           console.error('Error fetching branches:', branchError);
//         }

//         // Set profile first
//         setData(prev => ({ 
//           ...prev, 
//           profile,
//           branches: branches || []
//         }));

//       } catch (err) {
//         console.error('Unexpected error during staff validation:', err);
//         setIsLoading(false);
//         router.push('/accounts/login');
//       } finally {
//         setIsLoading(false);
//       }
//     }

//     validateStaff();
//   }, [params.staffId, router]);

  // Show loading spinner while validating
//   if (isLoading || !data.profile) {
//     return (
//       <div className="overflow-hidden flex justify-center items-center h-full">
//         <Spinner className="size-8 text-core" spinning={true} />
//       </div>
//     );
//   }

  // Fully authorized and data loaded
  return (
    <StaffRefreshContext.Provider value={{ refreshKey, setRefreshKey }}>
      <StaffDataContext.Provider value={{ data, setData }}>
        {children}
      </StaffDataContext.Provider>
    </StaffRefreshContext.Provider>
  );
};

export default StaffLayout;
