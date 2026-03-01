import Link from "next/link";
import Image from "next/image";
import { PropertyCard } from "./PropertyCard";

const properties = [
  {
    id: "1",
    imageSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBk9Lbr7bbdUJrwIE_onVKNNn1TIuch8Hu8isHVQKGSohElxsK_l1U8qWgPiuwpPv_arDY7-16T7KYY7JRRBRVe3puTXkPjGZoJ1kizacIlp67I4O1dRn45F3XxaQnw11d-qeRzy_Pq3-WRHyu7kdLuUesKEHlFYWBFf5XUXH0ohQOqWRXuKfF0tnr4lHYGVbf9pljF1oAxoJ-hsuAUiUxRQCE9XOsMneWMb327LZNJQd6koqaxH5BymFBn80oJnzl-Hrr9k0MG_ubC",
    imageAlt: "Luxury resort villa construction site",
    badge: "Premium Resort",
    title: "Avala Resort Unit 402",
    location: "Adriatic Coast, Montenegro",
    progress: 82,
    updateTime: "2h ago",
    updateText:
      "Interior marble installation for the master suite is now complete. Terrace glass balustrades arriving tomorrow.",
  },
  {
    id: "2",
    imageSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuALHuXQlUwuZ1G9w4_7SdvkLUQPMeCUF88FD_3mNbtiRBZVcRxTJ7vQyW9iYBzsSi7PoS16HuLnky2-_v3puWUmwZVbDMveOl3bbrTGFcJEXKMFxpgGat6xtGeVwqgrzKvmEMk9FWzQSszXmLT5tz2y43MxuKMfARF0AQskOQbf2iQc03H7mgBgOO-50EYOx6QwQ-Jzas4GgUd4AI_31j13GpRl-quV9NmBm81OzzfEcJqQ1q-yPAlElt9RGxW8OxILhOUajvtRO_f1",
    imageAlt: "Modern high-rise residential building",
    badge: "Urban Equity",
    title: "Skyline Plaza Penthouse B",
    location: "Financial District, London",
    progress: 45,
    updateTime: "Yesterday",
    updateText:
      "Structural topping out ceremony scheduled for next month. External facade framing has reached level 12.",
  },
];

export function MyPropertiesSection() {
  return (
    <div className="col-span-12">
      <div className="flex justify-between items-end mb-6">
        <h4 className="text-2xl font-bold text-gray-900">
          My Active Properties
        </h4>
        <Link
          href="/dashboard/properties"
          className="text-[#134e4a] font-bold text-sm flex items-center gap-1 hover:underline"
        >
          View All Assets{" "}
          <i className="las la-arrow-right text-sm" aria-hidden />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {properties.map((property) => (
          <PropertyCard key={property.id} {...property} />
        ))}
        {/* Weekly Photo column */}
        <div className="lg:col-span-1">
          <WeeklyPhotoCard />
        </div>
      </div>
    </div>
  );
}

function WeeklyPhotoCard() {
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
        <div className="relative mt-4 aspect-video rounded-xl overflow-hidden bg-black/20 group">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4Uoiq59EIwZE5uBwj8YJOQ-g6jhc-n5wljauAb2drGF4dVvoRgjn3aHcu3O84IYRo7Et-mYL7PjBjIRA1MFP45PiuaIaeuB9RviZFnxFKeflP2OQJXe8rKzGYIjAto940E-Mm8risvrMzF2568q9L2eBfYRfTbCxKEL4SvbK-4QXGNJpK4EesiOHtetrRH3GFeNiiddnbr8aKRjdVplmBpQs-hssuaw2Zd_dXq1ur3n_lwIIFjbgjYTGQsPWH6cZad1Gw9sj2PkeL"
            alt="Weekly construction site photo – Avala Resort"
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute bottom-2 left-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1.5 rounded text-[10px] text-white/90">
            Exterior facade progress, Level 8
          </div>
        </div>
        <button
          type="button"
          className="mt-4 w-full border border-white/30 hover:bg-white/10 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
        >
          <i className="las la-images" aria-hidden />
          View Photo Gallery
        </button>
      </div>
      <div className="absolute -right-10 -bottom-10 size-40 bg-white/5 rounded-full" />
    </div>
  );
}

