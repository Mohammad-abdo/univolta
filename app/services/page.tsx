"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { API_BASE_URL } from "@/lib/constants";
import { getLanguage, t, type Language } from "@/lib/i18n";
import { Search } from "lucide-react";

type ServiceItem = {
  id: string;
  title: string;
  description: string;
  price: string;
  mainImage?: string | null;
};

const formatPrice = (value: string | number | null | undefined) => {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return "$0";
  return `$${numeric.toLocaleString(undefined, {
    minimumFractionDigits: numeric % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    setLang(getLanguage());
    fetch(`${API_BASE_URL}/public/services`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setServices(data);
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(
    () =>
      services.filter((item) =>
        `${item.title} ${item.description}`.toLowerCase().includes(query.toLowerCase())
      ),
    [services, query]
  );

  return (
    <div className="min-h-screen bg-white pb-16 md:pb-0">
      <Navbar />
      <main className="mx-auto max-w-[1280px] space-y-8 px-4 pb-16 pt-24 md:px-5">
        <section className={`rounded-3xl bg-[#f8f9ff] p-6 md:p-10 ${lang === "ar" ? "rtl text-right" : ""}`}>
          <h1 className="mb-2 text-3xl font-montserrat-bold text-[#121c67]">{t("servicesPageTitle")}</h1>
          <p className="text-[#65666f]">{t("servicesPageSubtitle")}</p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 rounded-xl border px-3">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("servicesSearchPlaceholder")}
              className="w-full py-2 outline-none"
            />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((service) => (
            <Link key={service.id} href={`/services/${service.id}`} className="block">
              <article className="overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="h-44 w-full bg-gray-100">
                  {service.mainImage ? (
                    <img src={service.mainImage} alt={service.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">No Image</div>
                  )}
                </div>
                <div className="space-y-2 p-4">
                  <h2 className="line-clamp-1 text-lg font-semibold text-[#121c67]">{service.title}</h2>
                  <p className="line-clamp-2 text-sm text-gray-600">{service.description}</p>
                  <p className="font-semibold text-[#5260ce]">{formatPrice(service.price)}</p>
                </div>
              </article>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed p-10 text-center text-gray-500">
              {t("noServicesFound")}
            </div>
          )}
        </section>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
