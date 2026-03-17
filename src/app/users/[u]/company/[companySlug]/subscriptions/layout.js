"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "../../../../../../../config/supabaseClient"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { CompanyInfoContext, ReusableCompanySidebar } from "../layout"

export default function SubscriptionsLayout({ children }) {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [companyInfo, setCompanyInfo] = useState(null)
  const [branches, setBranches] = useState([])

  const { u, companySlug } = params

  useEffect(() => {
    async function loadCompanyInfo() {
      try {
        // Get user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          toast("Please log in to continue.")
          router.push("/accounts/login")
          return
        }

        // Load company info
        const { data: companiesData, error: companiesError } = await supabase
          .from("companies_lite")
          .select("company_id, name, slug, owner, currencies")
          .eq("slug", companySlug)
          .single()

        if (companiesError || !companiesData) {
          toast("Company not found.")
          router.push(`/users/${u}`)
          return
        }

        // Verify user access (owner or staff)
        let hasAccess = false
        if (companiesData.owner === user.id) {
          hasAccess = true
        } else {
          const { data: staffData } = await supabase
            .from("staff_lite")
            .select("staff_id")
            .eq("staff_id", user.id)
            .eq("company", companiesData.company_id)
            .single()
          hasAccess = !!staffData
        }

        if (!hasAccess) {
          toast("You do not have access to this company.")
          router.push(`/users/${u}`)
          return
        }

        // Load branches
        const { data: branchesData, error: branchesError } = await supabase
          .from("branches")
          .select("*")
          .eq("company", companiesData.company_id)

        if (branchesError) {
          console.error("Branches fetch error:", branchesError)
          setBranches([])
        } else {
          setBranches(branchesData || [])
        }

        setCompanyInfo(companiesData)
      } catch (err) {
        console.error("Error loading company info:", err)
        toast("Failed to load company information.")
        router.push(`/users/${u}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadCompanyInfo()
  }, [companySlug, u, router])

  if (isLoading) {
    return (
      <div className="overflow-hidden flex text-core justify-center items-center h-screen">
        <Spinner className="size-8 text-army" spinning={true} />
      </div>
    )
  }

  if (!companyInfo) return null

  return (
    <CompanyInfoContext.Provider
      value={{
        info: {
          ...companyInfo,
          id: companyInfo.company_id
        },
        branches
      }}
    >
      <ReusableCompanySidebar>
        {children}
      </ReusableCompanySidebar>
    </CompanyInfoContext.Provider>
  )
}
