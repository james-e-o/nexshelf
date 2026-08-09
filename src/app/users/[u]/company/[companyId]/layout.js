import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/config/supabaseServer"
import { CompanyInfoContext } from "./companyInfoProvider"
import CompanyLayoutClient from "./companyLayoutClient"

export default async function CompanyLayout({ children, params }) {
  const { u, companyId } = await params
  const supabase = await createSupabaseServerClient()

  // Step 1: Auth user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/accounts/login")
  }

  // Step 2: Get company (new schema: `companies`, not `companies_lite`)
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, name, slug, owner, currencies")
    .eq("id", companyId)
    .single()

  if (companyError || !company) {
    redirect(`/users/${u}`)
  }

  // Step 3: Access levels
  const { data: accessLevelsData, error: accessLevelsError } = await supabase
    .from("access_level")
    .select("*")
    .order("level_number", { ascending: true })

  if (accessLevelsError) {
    redirect(`/users/${u}`)
  }

  let accessLevel = null
  let branchId = null
  let suspended = false
  let accessLevelScope = null

  // Step 4: Owner or staff check (new schema: `staff`, not `staff_lite`)
  if (company.owner === user.id) {
    accessLevel = "owner"
    accessLevelScope = "company"
  } else {
    const { data: staffData, error: staffError } = await supabase
      .from("staff")
      .select("access_level, branch, status")
      .eq("user", user.id)
      .eq("company", company.id)
      .single()

    if (staffError || !staffData) {
      redirect(`/users/${u}`)
    }

    accessLevel = staffData.access_level
    suspended = staffData.status === "suspended"

    const accessLevelRecord = accessLevelsData?.find((al) => al.key === staffData.access_level)
    accessLevelScope = accessLevelRecord?.access

    // branchId only ever means "the one branch this person is pinned to".
    // Company-scope users are not pinned to a single branch.
    if (accessLevelScope === "branch") {
      branchId = staffData.branch
    }
  }

  // Step 5: Subscription gatekeeper
  const { data: subscriptions } = await supabase
    .from("company_subscriptions")
    .select("id, status, end_date, grace_period_end")
    .eq("company", company.id)

  const allowedStatuses = ["active", "trialing", "past_due"]
  const validSubscriptions = (subscriptions || []).filter((sub) =>
    allowedStatuses.includes(sub.status)
  )
  const hasSubscription = validSubscriptions.length === 1

  // Step 6: Currencies (new schema: currencies live on `companies` directly)
  const { data: currenciesArray } = await supabase
    .from("currencies")
    .select("name, code, flag")
    .in("code", company.currencies || [])

  // Step 7: Branches (new schema: `branches`, not `branches_lite`)
  const { data: branchesData } = await supabase
    .from("branches")
    .select("*")
    .eq("company", company.id)

  let allowedBranches = []
  if (accessLevelScope === "company") {
    allowedBranches = branchesData || []
  } else if (accessLevelScope === "branch" && branchId) {
    allowedBranches = branchesData?.filter((b) => b.id === branchId) || []
  }

  // Step 8: Modules
  const { data: modulesData } = await supabase
    .from("modules")
    .select("*")
    .eq("status", "active")

  const info = {
    ...company,
    id: company.id,
    accessLevel,
    accessLevelScope,
    branchId,
    // Company-scope (including owner) => access to every branch.
    // Branch-scope => access to only the one branch they're pinned to.
    hasAllBranchAccess: accessLevelScope === "company",
    suspended,
    staff_id: user.id,
    company_id: company.id,
  }

  return (
    <CompanyLayoutClient
      info={info}
      modules={modulesData || []}
      branches={allowedBranches}
      currencies={currenciesArray || []}
      accessLevels={accessLevelsData || []}
      hasSubscription={hasSubscription}
    >
      {children}
    </CompanyLayoutClient>
  )
}