"use client";

import ServiceForm from "../_components/service-form";
import { getLanguage, t } from "@/lib/i18n";

export default function AddServicePage() {
  const lang = getLanguage();
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-montserrat-bold text-[#121c67]">{t("dashboardServiceAddTitle", lang)}</h1>
      <ServiceForm mode="create" />
    </div>
  );
}
