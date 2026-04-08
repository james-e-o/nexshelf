"use client"

import { useContext, useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { CompanyInfoContext } from "./layout"
import { RefreshContext } from "../../layout"
import { ReusableCompanySidebar } from "./layout"
import { ChartAreaStacked } from "@/components/charts/area-charts/chart-area-stacked"
import { ChartBarMultiple } from "@/components/charts/bar-charts/barchart-multiple"
import { ChartRadialStacked } from "@/components/charts/radial-charts/radial-stacked"
import supabase from "@/config/supabaseClient"
import { toast } from "sonner"

export default function CompanyPage() {
  const { info, setInfo, branches } = useContext(CompanyInfoContext)
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { u, companySlug } = params
  const { refreshKey, setRefreshKey } = useContext(RefreshContext)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    setRefreshKey(prev => prev + 1)
  }, [u, companySlug, setRefreshKey])

  // Welcome message for newly invited staff
  useEffect(() => {
    const newlyInvited = searchParams.get('newly_invited_staff')
    if (newlyInvited === 'true') {
      setShowWelcome(true)
      const timer = setTimeout(() => setShowWelcome(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  // Fetch full company data
  useEffect(() => {
    async function fetchCompanyData() {
      try {
        const hasCompanyAccess = info?.accessLevelScope === "company" || info?.accessLevel === "owner"
        if (!hasCompanyAccess || !info?.id) return

        const { data: fullCompanyData, error } = await supabase
          .from("companies")
          .select("*")
          .eq("id", info.id)
          .single()

        if (error) {
          console.error("Error fetching company data:", error)
          return
        }

        if (fullCompanyData) {
          setInfo(prev => ({
            ...prev,
            ...fullCompanyData,
            accessLevel: info.accessLevel,
            accessLevelScope: info.accessLevelScope,
            branchId: info.branchId,
            suspended: info.suspended,
          }))
        }
      } catch (error) {
        console.error("Error in fetchCompanyData:", error)
      }
    }

    fetchCompanyData()
  }, [info?.id, info?.accessLevel, info?.accessLevelScope, info?.branchId, info?.suspended, setInfo])

  return (
    <ReusableCompanySidebar>
      <div className="p-6 font-WixMade h-full flex flex-col overflow-y-auto bg-gray-50">
        
        {/* Welcome Banner */}
        {showWelcome && (
          <div className="mb-8 relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-linear-to-r from-core via-core to-army opacity-90" />
            <div className="relative p-8 flex items-center justify-between text-white">
              <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                  Welcome Aboard! <span className="text-3xl">🚀</span>
                </h2>
                <p className="text-white/90 text-lg">
                  You've been added to <span className="font-semibold">{info?.name}</span>
                </p>
              </div>
              <div className="text-6xl opacity-80">🎉</div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-8">

          {/* Header */}
          <div className="bg-linear-to-r from-core via-core to-army rounded-3xl p-10 text-white shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(at_30%_20%,rgba(255,255,255,0.2)_0%,transparent_50%)]" />
            <h1 className="text-4xl font-bold tracking-tight mb-2">{info?.name || "Company"}</h1>
            <p className="text-white/80 text-lg">
              {info?.accessLevel === "owner" 
                ? "Company Owner Dashboard" 
                : info?.accessLevel === "admin" || info?.accessLevel === "finance" || info?.accessLevel === "admin_manager"
                ? "Company Management Dashboard"
                : "Branch Dashboard"}
            </p>
          </div>

          {/* ==================== OWNER DASHBOARD ==================== */}
          {info?.accessLevel === "owner" && (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Total Revenue", value: "$124,500", change: "+12%", color: "core" },
                  { label: "Active Staff", value: "48", change: "Across branches", color: "army" },
                  { label: "Total Orders", value: "1,248", change: "This month", color: "core" },
                  { label: "Branches", value: "12", change: "Operating", color: "army" },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
                    <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                    <h3 className={`text-3xl font-bold mt-3 text-${stat.color}`}>{stat.value}</h3>
                    <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
                  </div>
                ))}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <ChartAreaStacked />
                </div>

                <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold text-core mb-6">Top Performing Branches</h3>
                  <div className="space-y-5">
                    {[
                      { name: "Downtown", amount: "$45,200" },
                      { name: "Mall", amount: "$32,100" },
                      { name: "Airport", amount: "$28,900" },
                    ].map((branch, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <span className="font-medium text-gray-700">{branch.name}</span>
                        <span className="font-semibold text-core">{branch.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <ChartBarMultiple />
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <ChartRadialStacked />
                </div>
              </div>
            </div>
          )}

          {/* ==================== COMPANY LEVEL DASHBOARD ==================== */}
          {(info?.accessLevel === "admin" || info?.accessLevel === "finance" || info?.accessLevel === "admin_manager") && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-sm">Company Name</p>
                  <h3 className="text-2xl font-bold text-core mt-2">{info?.name}</h3>
                </div>
                <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-sm">Your Access Level</p>
                  <h3 className="text-2xl font-bold text-army capitalize mt-2">{info?.accessLevel}</h3>
                </div>
                <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-sm">Status</p>
                  <h3 className="text-2xl font-bold text-emerald-600 mt-2">Active</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold text-core mb-5">Quick Overview</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">Staff Members</span>
                      <span className="font-semibold text-core">48</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600">Active Branches</span>
                      <span className="font-semibold text-core">12</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-gray-600">Modules Enabled</span>
                      <span className="font-semibold text-core">8</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold text-core mb-5">Recent Activity</h3>
                  <div className="space-y-4 text-sm">
                    <p className="flex items-center gap-3 text-gray-700">📊 New invoice created <span className="text-gray-400 text-xs ml-auto">2 hrs ago</span></p>
                    <p className="flex items-center gap-3 text-gray-700">👤 Staff member added <span className="text-gray-400 text-xs ml-auto">5 hrs ago</span></p>
                    <p className="flex items-center gap-3 text-gray-700">⚙️ System settings updated <span className="text-gray-400 text-xs ml-auto">1 day ago</span></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== BRANCH LEVEL DASHBOARD ==================== */}
          {info?.accessLevel !== "owner" && 
           info?.accessLevel !== "admin" && 
           info?.accessLevel !== "finance" && 
           info?.accessLevel !== "admin_manager" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-sm mb-1">Your Access Level</p>
                  <h3 className="text-3xl font-bold text-core capitalize">{info?.accessLevel}</h3>
                  <p className="text-sm text-gray-500 mt-2">Branch Level Access</p>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-sm mb-1">Assigned Branch</p>
                  <h3 className="text-3xl font-bold text-army">
                    {branches?.[0]?.name || `Branch #${info?.branchId}` || "Unassigned"}
                  </h3>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-core mb-6">📋 Your Pending Tasks</h3>
                <div className="space-y-4">
                  <div className="flex gap-4 p-5 bg-amber-50 rounded-2xl border-l-4 border-amber-500">
                    <span className="text-3xl">📝</span>
                    <div>
                      <p className="font-semibold text-gray-800">Complete Inventory Check</p>
                      <p className="text-sm text-gray-600">Due: March 18, 2026</p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-5 bg-blue-50 rounded-2xl border-l-4 border-blue-500">
                    <span className="text-3xl">💰</span>
                    <div>
                      <p className="font-semibold text-gray-800">Review Daily Sales Report</p>
                      <p className="text-sm text-gray-600">Due: Today</p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-5 bg-emerald-50 rounded-2xl border-l-4 border-emerald-500">
                    <span className="text-3xl">👥</span>
                    <div>
                      <p className="font-semibold text-gray-800">Team Briefing</p>
                      <p className="text-sm text-gray-600">Tomorrow • 10:00 AM</p>
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