"use client";

import ServiceForm from "../_components/service-form";

export default function AddServicePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-montserrat-bold text-[#121c67]">Add Service</h1>
      <ServiceForm mode="create" />
    </div>
  );
}
