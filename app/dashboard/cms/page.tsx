import Link from "next/link";
import {
  LayoutGrid,
  Images,
  Globe2,
  PanelBottom,
  Inbox,
  ScrollText,
  ArrowRight,
} from "lucide-react";
import { t } from "@/lib/i18n";

type CmsCard = {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const cmsCards: CmsCard[] = [
  {
    title: t("sidebarCmsHomepage"),
    description: t("dashCmsHomepageDesc"),
    href: "/dashboard/cms/homepage",
    icon: Images,
  },
  {
    title: t("sidebarCmsSiteSettings"),
    description: t("dashCmsSiteSettingsDesc"),
    href: "/dashboard/cms/site-settings",
    icon: Globe2,
  },
  {
    title: t("sidebarCmsFooter"),
    description: t("dashCmsFooterDesc"),
    href: "/dashboard/cms/footer",
    icon: PanelBottom,
  },
  {
    title: t("sidebarCmsMessages"),
    description: t("dashCmsMessagesDesc"),
    href: "/dashboard/cms/messages",
    icon: Inbox,
  },
  {
    title: t("sidebarTermsAndConditions"),
    description: t("dashCmsTermsDesc"),
    href: "/dashboard/cms/terms",
    icon: ScrollText,
  },
];

export default function CmsOverviewPage() {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#312e81] p-6 text-white">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #818cf8 0%, transparent 55%), radial-gradient(circle at 80% 80%, #60a5fa 0%, transparent 50%)",
          }}
        />
        <div className="relative flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm">
            <LayoutGrid className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight">{t("dashCmsOverviewTitle")}</h1>
            <p className="mt-1 text-sm text-white/70">
              {t("dashCmsOverviewSubtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cmsCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(82,96,206,0.12)]">
                  <Icon className="h-5 w-5 text-[#5260ce]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="truncate text-base font-bold text-[#121c67]">{card.title}</h2>
                    <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#5260ce]" />
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">{card.description}</p>
                </div>
              </div>
              <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#5260ce]/10 blur-2xl transition-opacity group-hover:opacity-100" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
