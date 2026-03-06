"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import type { InvestorWeeklyUpdateItem } from "@/lib/investorProperties";

interface DashboardWeeklyPhotoCardProps {
  weeklyUpdates?: InvestorWeeklyUpdateItem[];
}

export function DashboardWeeklyPhotoCard({ weeklyUpdates = [] }: DashboardWeeklyPhotoCardProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const latest = weeklyUpdates[0];
  const firstBuildingId = latest?.building_id;

  const slides =
    latest?.images?.map((img) => ({ src: img.url, alt: img.alt })) ?? [];

  return (
    <div className="bg-[#134e4a] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <i className="las la-camera text-sm" aria-hidden />
            <span className="text-xs font-bold uppercase tracking-widest">
              Weekly Photo
            </span>
          </div>
          {latest ? (
            <>
              <h5 className="text-lg font-bold">
                {latest.building_name}
                {latest.week_label ? ` – ${latest.week_label}` : ""}
              </h5>
              {latest.date_range && (
                <p className="text-white/80 text-sm mt-0.5">{latest.date_range}</p>
              )}
            </>
          ) : (
            <h5 className="text-lg font-bold">No updates yet</h5>
          )}
        </div>
        {latest && slides.length > 0 ? (
          <>
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="relative mt-4 aspect-video rounded-xl overflow-hidden bg-black/20 group w-full text-left focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#134e4a]"
              aria-label="Open weekly photo in full screen"
            >
              <Image
                src={slides[0].src}
                alt={slides[0].alt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute bottom-2 left-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1.5 rounded text-[10px] text-white/90 line-clamp-2">
                {latest.description || "Weekly progress update"}
              </div>
            </button>
            {firstBuildingId && (
              <Link
                href={`/dashboard/properties/${firstBuildingId}#weekly-photos`}
                className="mt-4 w-full border border-white/30 hover:bg-white/10 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
              >
                <i className="las la-images" aria-hidden />
                View Photo Gallery
              </Link>
            )}
          </>
        ) : (
          <p className="mt-4 text-sm text-white/70">
            When staff share weekly photos for your property, they will appear here.
          </p>
        )}
      </div>
      <div className="absolute -right-10 -bottom-10 size-40 bg-white/5 rounded-full" />

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={slides}
        plugins={[Zoom]}
        zoom={{
          maxZoomPixelRatio: 4,
          scrollToZoom: true,
        }}
      />
    </div>
  );
}
