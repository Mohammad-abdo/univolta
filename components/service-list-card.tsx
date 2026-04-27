"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";

type ServiceListCardProps = {
  title: string;
  description: string;
  imageUrl: string | null;
  isRTL: boolean;
};

/**
 * Homepage service showcase: image, title, description (no link — public service routes removed).
 */
export function ServiceListCard({ title, description, imageUrl, isRTL }: ServiceListCardProps) {
  return (
    <article
      dir={isRTL ? "rtl" : "ltr"}
      lang={isRTL ? "ar" : "en"}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200/90 bg-white text-start shadow-[0_2px_24px_rgba(18,28,103,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#5260ce]/20 hover:shadow-[0_18px_40px_-12px_rgba(82,96,206,0.16)]"
    >
      <div className="relative px-4 pt-4 md:px-5 md:pt-5">
        <div className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#f0f3fc] to-[#e8ecf8] ring-1 ring-inset ring-[#121c67]/[0.06]">
          {imageUrl ? (
            <div className="absolute inset-2 md:inset-3">
              <div className="relative h-full w-full">
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 400px"
                  className="object-contain object-center transition-transform duration-500 ease-out group-hover:scale-[1.015]"
                  unoptimized
                />
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-14 w-14 text-[#5260ce]/20" aria-hidden />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-5 pb-6 pt-4 md:px-6 md:pb-7 md:pt-5">
        <h3 className="font-montserrat-bold text-lg leading-snug tracking-tight text-[#121c67] transition-colors duration-200 group-hover:text-[#5260ce] md:text-[1.35rem] md:leading-tight">
          {title}
        </h3>
        <p
          dir="auto"
          className="line-clamp-3 font-montserrat-regular text-[15px] leading-relaxed text-[#5c5d68] md:line-clamp-4 md:text-base md:leading-relaxed"
        >
          {description}
        </p>
      </div>
    </article>
  );
}
