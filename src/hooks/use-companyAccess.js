"use client"

import { useEffect, useState,useContext } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "../../config/supabaseClient"
import { CompanyInfo } from "@/app/admin/[u]/company/[companySlug]/layout"
import { toast } from "sonner"

export default function useCompanyAccess() {
  const router = useRouter()
  const params = useParams()
  const [company, setCompany] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const {info, setInfo} = useContext(CompanyInfo)

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // ✅ Step 1: Get authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          toast("Please log in to continue.")
          router.push("/accounts/login")
          return
        }

        const userID = user.id

        // ✅ Step 2: Get company by slug
        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .select("id, name, slug, owner")
          .eq("slug", params.companySlug)
          .single()

        if (companyError || !companyData) {
          toast("Company not found.")
          router.push(`/admin/${params.u}`)
          return
        }

        // ✅ Step 3: Check if user is the owner
        if (companyData.owner === user.id) {
          setCompany(companyData)
           setInfo({...companyData})
          setIsLoading(false)
          return
        }

        // ❌ Step 5: Unauthorized
        toast("Access denied. You do not belong to this company.")
        router.push("/accounts/login")

      } catch (err) {
        console.error("Access check error:", err)
        toast("Unexpected error occurred.")
        router.push("/accounts/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAccess()
  }, [params.companySlug, router])

  return { company, isLoading }
}
