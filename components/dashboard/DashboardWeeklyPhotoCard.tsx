"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

/** Property id for Avala Resort (dashboard weekly photo refers to this property). */
const PROPERTY_ID = "1";

const WEEKLY_PHOTO = {
  src: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4Uoiq59EIwZE5uBwj8YJOQ-g6jhc-n5wljauAb2drGF4dVvoRgjn3aHcu3O84IYRo7Et-mYL7PjBjIRA1MFP45PiuaIaeuB9RviZFnxFKeflP2OQJXe8rKzGYIjAto940E-Mm8risvrMzF2568q9L2eBfYRfTbCxKEL4SvbK-4QXGNJpK4EesiOHtetrRH3GFeNiiddnbr8aKRjdVplmBpQs-hssuaw2Zd_dXq1ur3n_lwIIFjbgjYTGQsPWH6cZad1Gw9sj2PkeL",
  alt: "Weekly construction site photo – Avala Resort",
};

export function DashboardWeeklyPhotoCard() {
  const [lightboxOpen, setLightboxOpen] = useState(false);

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
          <h5 className="text-lg font-bold">Avala Resort – Week of Oct 14</h5>
        </div>
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="relative mt-4 aspect-video rounded-xl overflow-hidden bg-black/20 group w-full text-left focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#134e4a]"
          aria-label="Open weekly photo in full screen"
        >
          <Image
            src={WEEKLY_PHOTO.src}
            alt={WEEKLY_PHOTO.alt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute bottom-2 left-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1.5 rounded text-[10px] text-white/90">
            Exterior facade progress, Level 8
          </div>
        </button>
        <Link
          href={`/dashboard/properties/${PROPERTY_ID}#weekly-photos`}
          className="mt-4 w-full border border-white/30 hover:bg-white/10 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
        >
          <i className="las la-images" aria-hidden />
          View Photo Gallery
        </Link>
      </div>
      <div className="absolute -right-10 -bottom-10 size-40 bg-white/5 rounded-full" />

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={[{ src: WEEKLY_PHOTO.src, alt: WEEKLY_PHOTO.alt }]}
        plugins={[Zoom]}
        zoom={{
          maxZoomPixelRatio: 4,
          scrollToZoom: true,
        }}
      />
    </div>
  );
}
