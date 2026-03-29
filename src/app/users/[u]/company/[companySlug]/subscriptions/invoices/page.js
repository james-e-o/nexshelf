"use client"

import { Button } from "@/components/ui/button"
import { useRouter, useParams } from "next/navigation"

export default function InvoicesPage() {
  const router = useRouter()
  const params = useParams()
  const { u, companySlug } = params

  return (
    <div className="bg-white">
      {/* Invoices Content */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm mb-4">No invoices found</p>
          <Button variant="outline" onClick={() => router.push(`/users/${u}/company/${companySlug}/subscriptions`)}>
            Back to Overview
          </Button>
        </div>
      </div>
    </div>
  )
}
