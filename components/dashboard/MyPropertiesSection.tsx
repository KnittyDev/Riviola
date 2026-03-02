import Link from "next/link";
import { PropertyCard } from "./PropertyCard";
import { DashboardWeeklyPhotoCard } from "./DashboardWeeklyPhotoCard";

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
          <DashboardWeeklyPhotoCard />
        </div>
      </div>
    </div>
  );
}

