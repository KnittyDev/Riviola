"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import { useTranslations } from "next-intl";
import type { WeeklyPhotoUpdate } from "@/lib/propertyDetailData";

interface WeeklyPhotoUpdatesProps {
  weeklyUpdates: WeeklyPhotoUpdate[];
}

export function WeeklyPhotoUpdates({ weeklyUpdates }: WeeklyPhotoUpdatesProps) {
  const t = useTranslations("StaffBuildingDetail");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const slides = useMemo(
    () =>
      weeklyUpdates.flatMap((w) =>
        w.images.map((img) => ({ src: img.url, alt: img.alt }))
      ),
    [weeklyUpdates]
  );

  const openAt = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  let globalIndex = 0;

  return (
    <section
      id="weekly-photos"
      className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden scroll-mt-8"
    >
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <i className="las la-image text-[#134e4a] text-xl" aria-hidden />
        <h2 className="text-lg font-bold text-gray-900">{t("weeklyUpdatesTitle")}</h2>
      </div>
      <div className="p-6 space-y-6 max-w-4xl">
        {weeklyUpdates.map((w) => (
          <article
            key={w.id}
            className="border border-gray-100 rounded-2xl p-4 md:p-5"
          >
            <div className="mb-4">
              <p className="text-xs font-semibold text-[#134e4a] uppercase tracking-wider">
                {w.weekLabel}
              </p>
              <p className="text-sm text-gray-500">{w.range}</p>
            </div>
            <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0 flex-1">
                {w.images.map((img, idx) => {
                const index = globalIndex++;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => openAt(index)}
                    className={`relative rounded-xl overflow-hidden bg-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#134e4a] focus:ring-offset-2 min-h-0 ${
                      idx === 0
                        ? "sm:col-span-2 aspect-video max-h-52 sm:max-h-56"
                        : "aspect-square max-h-36 sm:max-h-40"
                    }`}
                    aria-label={`View full size: ${img.alt}`}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      className="object-cover"
                      sizes={idx === 0 ? "(min-width: 640px) 420px, 100vw" : "(min-width: 640px) 200px, 100vw"}
                    />
                  </button>
                );
              })}
              </div>
              <p className="text-sm text-gray-600 flex-1 min-w-0 md:pt-0">
                {w.description}
              </p>
            </div>
          </article>
        ))}
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={slides}
        on={{
          view: ({ index }) => setLightboxIndex(index),
        }}
        plugins={[Zoom]}
        zoom={{
          maxZoomPixelRatio: 4,
          scrollToZoom: true,
        }}
      />
    </section>
  );
}
