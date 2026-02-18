
import { redirect } from "next/navigation";

export default function CompanyIndexRedirect({ params }) {
  const { u } = params; // dynamic segment for user handle
  redirect(`/admin/${u}`);
}
