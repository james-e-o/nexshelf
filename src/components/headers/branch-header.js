"use client";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useContext } from "react";
import {  Breadcrumb,  BreadcrumbList,  BreadcrumbItem,  BreadcrumbSeparator,  BreadcrumbLink,  BreadcrumbPage,} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CompanyInfoContext } from "@/app/admin/[u]/company/[companySlug]/layout";

export default function BranchHeader({ children }) {
  const pathname = usePathname();
  const params = useParams();
  const { currentBranch } = useContext(CompanyInfoContext);
  
  const segments = pathname.split("/").filter(Boolean);
  // Example: ["admin", "john", "company", "fedeco", "branches", "branch123"]

  const userId = segments[1];
  const companySlug = segments[3];
  
  // Check if we're in a branch route
  const isInBranch = segments.includes("branches");
  const isInModule = segments.includes("modules");
  
  let displaySegments;
  if (isInModule && currentBranch) {
    // For module routes under branch: show branch name + module name + any sub-routes
    const modulesIndex = segments.indexOf("modules");
    const moduleSegment = segments[modulesIndex + 1]; // Module name after "modules"
    const subSegments = segments.slice(modulesIndex + 2); // Everything after module name
    displaySegments = [currentBranch.name, moduleSegment, ...subSegments];
  } else if (isInBranch && currentBranch) {
    // For branch routes: show just the branch name
    displaySegments = [currentBranch.name];
  } else {
    displaySegments = segments.slice(4); // Everything after company
  }

  const isAtCompanyRoot = segments.length === 4;

  return (
    <header className="flex h-12 w-full overflow-x-hidden justify-between items-center gap-2 border-b px-4">
      <div className="flex shrink-0 items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />

        <Breadcrumb>
          <BreadcrumbList className="flex items-center gap-1">
            {/* Always show "Dashboard" */}
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/admin/${userId}`}>Admin Page</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            {/* Company breadcrumb */}
            {isAtCompanyRoot ? (
              <BreadcrumbItem>
                <BreadcrumbPage className="capitalize">{companySlug}</BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href={`/admin/${userId}/company/${companySlug}`}
                      className="capitalize"
                    >
                      {companySlug}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>

                {/* Sub-page breadcrumbs */}
                {displaySegments.map((segment, i) => {
                  let href;
                  if (isInBranch && currentBranch && i === 0) {
                    // First segment is branch name, link to branch
                    href = `/admin/${userId}/company/${companySlug}/branches/${params.branch}`;
                  } else if (isInModule && i === 1) {
                    // Second segment (i=1) is the module name, link to module
                    const moduleSlug = displaySegments[1];
                    href = `/admin/${userId}/company/${companySlug}/branches/${params.branch}/modules/${moduleSlug}`;
                  } else if (isInModule && i > 1) {
                    // Sub-routes under module (i > 1)
                    const moduleSlug = displaySegments[1];
                    const subPath = displaySegments.slice(2, i + 1).join("/");
                    href = `/admin/${userId}/company/${companySlug}/branches/${params.branch}/modules/${moduleSlug}/${subPath}`;
                  } else {
                    // Fallback
                    href = pathname;
                  }
                  
                  const isLast = i === displaySegments.length - 1;

                  return (
                    <div key={href} className="flex items-center">
                      <BreadcrumbSeparator className="flex items-center mr-1.5 relative " />
                      {isLast ? (
                        <BreadcrumbItem>
                          <BreadcrumbPage className="capitalize">{segment}</BreadcrumbPage>
                        </BreadcrumbItem>
                      ) : (
                        <BreadcrumbItem>
                          <BreadcrumbLink asChild>
                            <Link href={href} className="capitalize">
                              {segment}
                            </Link>
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right side content (e.g. profile, buttons, etc.) */}
      <div>{children}</div>
    </header>
  );
}
