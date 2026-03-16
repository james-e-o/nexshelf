"use client"

import { useContext, useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { CompanyInfoContext } from "./layout"
import { RefreshContext } from "../../layout"
import { ReusableCompanySidebar } from "./layout"
import { ChartAreaStacked } from "@/components/charts/area-charts/chart-area-stacked"
import { ChartBarMultiple } from "@/components/charts/bar-charts/barchart-multiple"
import { ChartRadialStacked } from "@/components/charts/radial-charts/radial-stacked"

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
      <div className="p-1 font-WixMade h-full flex-col flex overflow-y-auto">
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
            <div className="relative bg-linear-to-r from-core/90 via-core to-army/80 rounded-xl p-6 text-white shadow-lg border-2 border-core/40">
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
        
        {/* Modern Dashboard */}
        <div className="space-y-6 pb-6">
          {/* Header Section */}
          <div className="bg-linear-to-r from-core via-core to-army/90 rounded-xl p-8 text-white shadow-lg">
            <h1 className="text-3xl font-bold mb-2">{info?.name || "Company"}</h1>
            <p className="text-white/80">
              {info?.accessLevel === "owner" 
                ? "Company Owner Dashboard" 
                : info?.accessLevel === "admin" || info?.accessLevel === "finance" || info?.accessLevel === "admin_manager"
                ? "Company Dashboard"
                : "Staff Dashboard"}
            </p>
          </div>

          {/* Owner Dashboard */}
          {info?.accessLevel === "owner" && (
            <div className="space-y-6">
              {/* Key Metrics Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-6 shadow border-l-4 border-core">
                  <p className="text-gray-600 text-sm font-medium mb-2">Total Revenue</p>
                  <h3 className="text-2xl font-bold text-core">$124,500</h3>
                  <p className="text-xs text-gray-500 mt-2">+12% from last month</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow border-l-4 border-army">
                  <p className="text-gray-600 text-sm font-medium mb-2">Active Staff</p>
                  <h3 className="text-2xl font-bold text-army">48</h3>
                  <p className="text-xs text-gray-500 mt-2">Across all branches</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow border-l-4 border-core">
                  <p className="text-gray-600 text-sm font-medium mb-2">Total Orders</p>
                  <h3 className="text-2xl font-bold text-core">1,248</h3>
                  <p className="text-xs text-gray-500 mt-2">This month</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow border-l-4 border-army">
                  <p className="text-gray-600 text-sm font-medium mb-2">Branches</p>
                  <h3 className="text-2xl font-bold text-army">12</h3>
                  <p className="text-xs text-gray-500 mt-2">Operating locations</p>
                </div>
              </div>

              {/* Performance Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <ChartAreaStacked />
                </div>
                <div className="bg-white rounded-lg p-6 shadow">
                  <h3 className="text-lg font-semibold text-core mb-4">Top Branches</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-sm">Downtown</span>
                      <span className="text-sm font-semibold text-core">$45,200</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-sm">Mall</span>
                      <span className="text-sm font-semibold text-core">$32,100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Airport</span>
                      <span className="text-sm font-semibold text-core">$28,900</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartBarMultiple />
                <ChartRadialStacked />
              </div>
            </div>
          )}

          {/* Company-Level Access Dashboard (Admin, Finance, Admin Manager) */}
          {(info?.accessLevel === "admin" || info?.accessLevel === "finance" || info?.accessLevel === "admin_manager") && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-6 shadow border-t-4 border-core">
                  <p className="text-gray-600 text-sm font-medium mb-2">Company Name</p>
                  <h3 className="text-xl font-bold text-core">{info?.name || "N/A"}</h3>
                </div>
                <div className="bg-white rounded-lg p-6 shadow border-t-4 border-army">
                  <p className="text-gray-600 text-sm font-medium mb-2">Access Level</p>
                  <h3 className="text-xl font-bold text-army capitalize">{info?.accessLevel}</h3>
                </div>
                <div className="bg-white rounded-lg p-6 shadow border-t-4 border-core">
                  <p className="text-gray-600 text-sm font-medium mb-2">Company Status</p>
                  <h3 className="text-xl font-bold text-green-600">Active</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-6 shadow">
                  <h3 className="text-lg font-semibold text-core mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Staff Members</span>
                      <span className="font-semibold text-core">48</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Active Branches</span>
                      <span className="font-semibold text-core">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Modules Enabled</span>
                      <span className="font-semibold text-core">8</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow">
                  <h3 className="text-lg font-semibold text-core mb-4">Recent Activities</h3>
                  <div className="space-y-3 text-sm">
                    <p className="text-gray-700">📊 New invoice created - 2 hours ago</p>
                    <p className="text-gray-700">👤 Staff member added - 5 hours ago</p>
                    <p className="text-gray-700">⚙️ Settings updated - 1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Branch-Level Access Dashboard (Other Staff) */}
          {info?.accessLevel !== "owner" && info?.accessLevel !== "admin" && info?.accessLevel !== "finance" && info?.accessLevel !== "admin_manager" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-6 shadow border-l-4 border-core">
                  <p className="text-gray-600 text-sm font-medium mb-2">Your Access Level</p>
                  <h3 className="text-2xl font-bold text-core capitalize">{info?.accessLevel || "N/A"}</h3>
                  <p className="text-xs text-gray-500 mt-2">Branch-level access</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow border-l-4 border-army">
                  <p className="text-gray-600 text-sm font-medium mb-2">Assigned Branch</p>
                  <h3 className="text-2xl font-bold text-army">{info?.branchId ? `Branch #${info.branchId}` : "Unassigned"}</h3>
                  <p className="text-xs text-gray-500 mt-2">Location info</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow">
                <h3 className="text-lg font-semibold text-core mb-4">📋 Your Pending Tasks</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                    <span className="text-2xl">📝</span>
                    <div>
                      <p className="font-medium text-gray-800">Complete Inventory Check</p>
                      <p className="text-sm text-gray-600">Due: March 18, 2026</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <span className="text-2xl">💰</span>
                    <div>
                      <p className="font-medium text-gray-800">Review Daily Sales Report</p>
                      <p className="text-sm text-gray-600">Due: Today</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <span className="text-2xl">👥</span>
                    <div>
                      <p className="font-medium text-gray-800">Team Briefing</p>
                      <p className="text-sm text-gray-600">Scheduled: Tomorrow at 10:00 AM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ReusableCompanySidebar>
  )
}
