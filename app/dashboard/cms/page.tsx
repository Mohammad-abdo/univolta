import { redirect } from "next/navigation";

export default function CmsDashboardRedirectPage() {
  redirect("/dashboard/cms/homepage");
}
