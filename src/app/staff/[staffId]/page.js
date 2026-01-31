'use client';

import { useEffect, useState, useContext } from 'react';
import { supabase } from '../../../../config/supabaseClient';
import { Spinner } from '@/components/ui/spinner';
import { Bell } from 'lucide-react';
import { StaffDataContext } from './layout';
import { StaffSidebar } from '@/components/sidebars/staff-sidebar/staff-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/headers/dashboard-header';
import { Button } from '@/components/ui/button';
import { Briefcase } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function StaffPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();
  const { data, setData } = useContext(StaffDataContext);

//   useEffect(() => {
//     async function fetchBranches() {
//       setIsLoading(true);
//       try {
//         const { data: branches, error: branchError } = await supabase
//           .from('staff_branches')
//           .select('id, name, slug')
//           .eq('staff_id', data.profile.id);

//         if (branchError) {
//           console.error('Branch fetch error:', branchError);
//           toast('Unable to load your branches. Please try again later.');
//           setData(prev => ({ ...prev, branches: [] }));
//           setIsLoading(false);
//           return;
//         }

//         if (!branches || branches.length === 0) {
//           setData(prev => ({ ...prev, branches: [] }));
//           setIsLoading(false);
//           return;
//         }

//         setData(prev => ({
//           ...prev,
//           branches,
//         }));
//         setIsLoading(false);
//       } catch (error) {
//         console.error('Error fetching branches:', error);
//         setIsLoading(false);
//       }
//     }

//     if (data.profile && !data.branches) {
//       fetchBranches();
//     }
//   }, [data.profile, data.branches, setData]);

  return (
    <SidebarProvider className={'relative '}>
      <StaffSidebar />
      <SidebarInset className={' overflow-hidden h-svh static'}>
        <div className="flex mb-0.5 h-full overflow-hidden flex-col gap-4">
          <div className="flex-col border-b overflow-hidden h-full flex">
            <div className="h-12">
              <Header>
                <div className="flex">
                  <div className="md:flex gap-2 hidden mr-1 items-center "></div>
                  <Button variant="ghost" size="icon" className="relative ml-3">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-0.5 -right-0.5 text-[9px] bg-red-600 translate-x-[-48.8%] translate-y-[48.9%] text-white font-semibold flex items-center justify-center size-3.5 rounded-full">
                      2
                    </span>
                  </Button>
                </div>
              </Header>
            </div>
            <div className="flex-col overflow-y-hidden grow flex">
              <div className="md:px-4 pt-2 md:pt-4 p-0.5 px-1 h-full overflow-y-auto">
                <div>
                  <h1 className="text-xl font-semibold">
                    Welcome, {data.profile && data.profile.username}
                  </h1>
                </div>
                <div className="mt-4">
                  {isLoading ? (
                    <div className="overflow-hidden flex justify-start items-center h-full">
                      Loading data
                      <Spinner className="size-4 ml-2 text-core" spinning={true} />
                    </div>
                  ) : data && data.profile && !data.branches?.length && data.profile ? (
                    <div className=" bg-neutral-50 rounded-2xl px-5 py-7 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 rounded-full bg-white">
                          <Briefcase className="size-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            No Branches Assigned
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            Please contact your administrator
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        You have access to {data.branches?.length || 0} branch(es)
                      </p>
                      <Link href={`/staff/${params.staffId}/branches`}>
                        <Button className="h-8 hover:bg-core/90 text-xs bg-core">
                          View Branches
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
