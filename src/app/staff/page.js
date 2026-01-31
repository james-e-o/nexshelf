import { redirect } from "next/navigation";

export default async function CompanyIndexRedirect({ params }) {
  redirect(`/accounts/login`)
}
