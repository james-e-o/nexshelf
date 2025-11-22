"use client"

import { useEffect, useState, useContext } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "../../config/supabaseClient"
import { CompanyInfoContext } from "@/components/contexts/company-context"
import { toast } from "sonner"

export default function useCompanyAccess() {
  const router = useRouter()
  const params = useParams()
  const [company, setCompany] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const { info, setInfo } = useContext(CompanyInfoContext)

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          toast("Please log in to continue.")
          router.push("/accounts/login")
          return
        }

        const { data: companyData } = await supabase
          .from("companies")
          .select("id, name, slug, owner")
          .eq("slug", params.companySlug)
          .single()

        if (!companyData) {
          toast("Company not found.")
          router.push(`/admin/${params.u}`)
          return
        }

        if (companyData.owner === user.id) {
          setCompany(companyData)
          setInfo(companyData) // ← store in context
          return
        }

        toast("Access denied.")
        router.push("/accounts/login")

      } finally {
        setIsLoading(false)
      }
    }

    checkAccess()
  }, [params.companySlug])

  return { company, isLoading }
}
