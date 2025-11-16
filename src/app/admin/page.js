import { redirect } from "next/navigation";

export default async function CompanyIndexRedirect({ params }) {
  const { u } = params; // dynamic segment for user handle
  u?redirect(`/admin/${u}`):redirect(`/accounts/login`)
}
