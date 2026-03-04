"use client"

import { useContext, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { CompanyInfoContext } from "./layout"
import { RefreshContext } from "../../layout"
import { ReusableCompanySidebar } from "./layout"

export default function CompanyPage() {
  const { info } = useContext(CompanyInfoContext)
  const router = useRouter()
  const params = useParams()
  const { u, companySlug } = params
  const { refreshKey, setRefreshKey } = useContext(RefreshContext)

  useEffect(() => {
    setRefreshKey(prev => prev + 1)
  }, [u, companySlug, setRefreshKey])

  return (
    <ReusableCompanySidebar>
      <div className="p-1 font-WixMade">
        <h1 className="text-xl font-bold">
          Welcome to {info?.name || "Company"}
        </h1>
        <p className="text-sm text-gray-600 mt-2">Company ID: {info?.id}</p>

        {/* Display user role and access level */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Your Access</h2>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium">Role:</span>{" "}
              <span className="capitalize">{info?.roleType || "N/A"}</span>
            </p>
            {info?.roleType === "staff" && (
              <>
                <p className="text-sm">
                  <span className="font-medium">Job Title:</span>{" "}
                  <span className="capitalize">{info?.role || "Not assigned"}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium">Access Level:</span>{" "}
                  <span className="capitalize">{info?.accessLevel || "N/A"}</span>
                </p>
                {!info?.branchId && (
                  <p className="text-xs text-amber-600 mt-2">
                    ⚠️ No branch assigned yet. Contact your manager to assign a branch.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </ReusableCompanySidebar>
  )
}
