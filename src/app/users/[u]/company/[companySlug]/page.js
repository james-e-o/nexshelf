"use client"

import { useContext, useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { CompanyInfoContext } from "./layout"
import { RefreshContext } from "../../layout"
import { ReusableCompanySidebar } from "./layout"

export default function CompanyPage() {
  const { info } = useContext(CompanyInfoContext)
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { u, companySlug } = params
  const { refreshKey, setRefreshKey } = useContext(RefreshContext)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    setRefreshKey(prev => prev + 1)
  }, [u, companySlug, setRefreshKey])

  // Check for newly invited staff parameter and show welcome message
  useEffect(() => {
    const newlyInvited = searchParams.get('newly_invited_staff')
    if (newlyInvited === 'true') {
      setShowWelcome(true)
      
      // Auto-hide welcome message after 5 seconds
      const timer = setTimeout(() => {
        setShowWelcome(false)
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  return (
    <ReusableCompanySidebar>
      <div className="p-1 font-WixMade">
        {/* Celebratory Welcome Banner for Newly Invited Staff */}
        {showWelcome && (
          <div className="mb-6 relative overflow-hidden">
            {/* Animated celebration confetti background */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-2 left-1/4 text-2xl animate-bounce" style={{ animationDelay: '0s' }}>🎉</div>
              <div className="absolute top-3 right-1/4 text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎊</div>
              <div className="absolute top-2 right-1/3 text-2xl animate-bounce" style={{ animationDelay: '0.4s' }}>🎈</div>
              <div className="absolute top-3 left-1/3 text-2xl animate-bounce" style={{ animationDelay: '0.6s' }}>⭐</div>
              <div className="absolute top-2 right-1/2 text-2xl animate-bounce" style={{ animationDelay: '0.3s' }}>🎆</div>
            </div>
            
            {/* Main celebration card */}
            <div className="relative bg-gradient-to-r from-core/90 via-core to-army/80 rounded-xl p-6 text-white shadow-lg border-2 border-core/40">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-1">Welcome Aboard! 🚀</h2>
                  <p className="text-white/95 text-sm">
                    You've been successfully added to <span className="font-semibold">{info?.name || "Company"}</span> as staff. Let's get started!
                  </p>
                </div>
                <div className="text-4xl animate-bounce" style={{ animationDelay: '0.1s' }}>🎉</div>
              </div>
            </div>
          </div>
        )}
        
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
              <span className="capitalize">{info?.accessLevel || "N/A"}</span>
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
