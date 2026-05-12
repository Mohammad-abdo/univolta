"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { t, getLanguage } from "@/lib/i18n";
import type { HomeVideoSetting } from "@/lib/site-settings";
import { pickLocalized } from "@/lib/localized";

export function HomeVideoSection({ video }: { video?: HomeVideoSetting }) {
  const lang = getLanguage();
  const title = useMemo(() => {
    if (video?.title) {
      const v = pickLocalized(video.title, lang).trim();
      return v || t("homeVideoBadge");
    }
    const en = video?.titleEn?.trim();
    const ar = video?.titleAr?.trim();
    return (lang === "ar" ? ar : en) || t("homeVideoBadge");
  }, [lang, video?.title, video?.titleEn, video?.titleAr]);

  const sub = useMemo(() => {
    if (video?.sub) {
      return pickLocalized(video.sub, lang).trim();
    }
    const en = video?.subEn?.trim();
    const ar = video?.subAr?.trim();
    return (lang === "ar" ? ar : en) || "";
  }, [lang, video?.sub, video?.subEn, video?.subAr]);

  const url = video?.url?.trim() || "";
  const posterUrl = video?.posterUrl?.trim() || undefined;

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  if (!url) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#f7f9ff] to-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-5 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={lang === "ar" ? "text-right" : "text-left"}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-[#5260ce]/10 text-[#5260ce] px-4 py-1.5 text-xs font-montserrat-semibold">
              <span className="h-2 w-2 rounded-full bg-[#5260ce]" />
              {t("homeVideoBadge")}
            </div>
            <h2 className="mt-4 text-2xl md:text-4xl font-montserrat-bold text-[#121c67] leading-tight">
              {title}
            </h2>
            {sub ? (
              <p className="mt-3 text-sm md:text-base text-[#65666f] font-montserrat-regular leading-relaxed">
                {sub}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("home-video") as HTMLVideoElement | null;
                  if (!el) return;
                  if (el.paused) {
                    el.play().then(() => setPlaying(true)).catch(() => {});
                  } else {
                    el.pause();
                    setPlaying(false);
                  }
                }}
                className="inline-flex items-center gap-2 bg-[#5260ce] hover:bg-[#4350b0] text-white px-5 py-2.5 rounded-xl text-sm font-montserrat-semibold shadow-[0_10px_30px_rgba(82,96,206,0.25)] transition-all"
              >
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {playing ? t("homeVideoPause") : t("homeVideoPlay")}
              </button>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("home-video") as HTMLVideoElement | null;
                  if (!el) return;
                  el.muted = !el.muted;
                  setMuted(el.muted);
                }}
                className="inline-flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-[#121c67] px-5 py-2.5 rounded-xl text-sm font-montserrat-semibold transition-all"
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {muted ? t("homeVideoMuted") : t("homeVideoSound")}
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute -inset-6 bg-gradient-to-br from-[#5260ce]/20 via-[#75d3f7]/15 to-transparent blur-2xl" />
            <div className="relative rounded-2xl overflow-hidden border border-[#e8ebf7] bg-white shadow-[0_20px_60px_rgba(18,28,103,0.14)]">
              <video
                id="home-video"
                className="w-full h-auto aspect-video object-cover"
                src={url}
                poster={posterUrl}
                muted={muted}
                playsInline
                controls
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

