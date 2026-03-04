"use client";

import { useState, useMemo } from "react";
import { PropertiesSummaryBar } from "@/components/dashboard/properties/PropertiesSummaryBar";
import { PropertiesFilterBar } from "@/components/dashboard/properties/PropertiesFilterBar";
import {
  PropertyFullCard,
  type PropertyFull,
} from "@/components/dashboard/properties/PropertyFullCard";

const ALL_PROPERTIES: PropertyFull[] = [
  {
    id: "1",
    imageSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBk9Lbr7bbdUJrwIE_onVKNNn1TIuch8Hu8isHVQKGSohElxsK_l1U8qWgPiuwpPv_arDY7-16T7KYY7JRRBRVe3puTXkPjGZoJ1kizacIlp67I4O1dRn45F3XxaQnw11d-qeRzy_Pq3-WRHyu7kdLuUesKEHlFYWBFf5XUXH0ohQOqWRXuKfF0tnr4lHYGVbf9pljF1oAxoJ-hsuAUiUxRQCE9XOsMneWMb327LZNJQd6koqaxH5BymFBn80oJnzl-Hrr9k0MG_ubC",
    imageAlt: "Avala Resort construction",
    badge: "Premium Resort",
    status: "active",
    title: "Avala Resort Unit 402",
    location: "Adriatic Coast, Montenegro",
    progress: 82,
    value: "420.000€",
    roi: "+18.4%",
    roiPositive: true,
    area: "148 m²",
    deliveryDate: "Dec 2024",
    updateTime: "2h ago",
    updateText:
      "Interior marble installation for the master suite is now complete. Terrace glass balustrades arriving tomorrow.",
  },
  {
    id: "2",
    imageSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuALHuXQlUwuZ1G9w4_7SdvkLUQPMeCUF88FD_3mNbtiRBZVcRxTJ7vQyW9iYBzsSi7PoS16HuLnky2-_v3puWUmwZVbDMveOl3bbrTGFcJEXKMFxpgGat6xtGeVwqgrzKvmEMk9FWzQSszXmLT5tz2y43MxuKMfARF0AQskOQbf2iQc03H7mgBgOO-50EYOx6QwQ-Jzas4GgUd4AI_31j13GpRl-quV9NmBm81OzzfEcJqQ1q-yPAlElt9RGxW8OxILhOUajvtRO_f1",
    imageAlt: "Skyline Plaza Penthouse",
    badge: "Urban Equity",
    status: "active",
    title: "Skyline Plaza Penthouse B",
    location: "Financial District, London",
    progress: 45,
    value: "1.240.000€",
    roi: "+9.2%",
    roiPositive: true,
    area: "312 m²",
    deliveryDate: "Jun 2025",
    updateTime: "Yesterday",
    updateText:
      "Structural topping out ceremony scheduled for next month. External facade framing has reached level 12.",
  },
  {
    id: "3",
    imageSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC4Uoiq59EIwZE5uBwj8YJOQ-g6jhc-n5wljauAb2drGF4dVvoRgjn3aHcu3O84IYRo7Et-mYL7PjBjIRA1MFP45PiuaIaeuB9RviZFnxFKeflP2OQJXe8rKzGYIjAto940E-Mm8risvrMzF2568q9L2eBfYRfTbCxKEL4SvbK-4QXGNJpK4EesiOHtetrRH3GFeNiiddnbr8aKRjdVplmBpQs-hssuaw2Zd_dXq1ur3n_lwIIFjbgjYTGQsPWH6cZad1Gw9sj2PkeL",
    imageAlt: "Villa Serenity",
    badge: "Luxury Villa",
    status: "completed",
    title: "Villa Serenity No. 7",
    location: "Côte d'Azur, France",
    progress: 100,
    value: "1.180.000€",
    roi: "+24.7%",
    roiPositive: true,
    area: "420 m²",
    deliveryDate: "Mar 2024",
    updateTime: "1 week ago",
    updateText:
      "Final inspection passed. Keys handed over. Smart home system fully commissioned.",
  },
  {
    id: "4",
    imageSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBk9Lbr7bbdUJrwIE_onVKNNn1TIuch8Hu8isHVQKGSohElxsK_l1U8qWgPiuwpPv_arDY7-16T7KYY7JRRBRVe3puTXkPjGZoJ1kizacIlp67I4O1dRn45F3XxaQnw11d-qeRzy_Pq3-WRHyu7kdLuUesKEHlFYWBFf5XUXH0ohQOqWRXuKfF0tnr4lHYGVbf9pljF1oAxoJ-hsuAUiUxRQCE9XOsMneWMb327LZNJQd6koqaxH5BymFBn80oJnzl-Hrr9k0MG_ubC",
    imageAlt: "Riviera Heights planning",
    badge: "Mixed Use",
    status: "planning",
    title: "Riviera Heights Tower A",
    location: "Barcelona, Spain",
    progress: 0,
    value: "890.000€",
    roi: "—",
    roiPositive: true,
    area: "265 m²",
    deliveryDate: "Q3 2026",
    updateTime: "3 days ago",
    updateText:
      "Architectural drawings finalized. Environmental impact assessment pending local authority approval.",
  },
];

export default function PropertiesPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = ALL_PROPERTIES;
    if (activeFilter !== "all")
      list = list.filter((p) => p.status === activeFilter);
    if (search.trim())
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.location.toLowerCase().includes(search.toLowerCase())
      );
    return list;
  }, [activeFilter, search]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-8 animate-fade-in">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
          My Properties
        </h2>
        <p className="text-gray-500 mt-1">
          Manage and track all your real estate assets.
        </p>
      </div>

      <PropertiesSummaryBar />

      <PropertiesFilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        search={search}
        onSearchChange={setSearch}
        searchDisabled
      />

      {filtered.length === 0 ? (
        <div className="animate-fade-in flex flex-col items-center justify-center py-24 text-center text-gray-400">
          <i className="las la-building text-6xl mb-4 opacity-30" aria-hidden />
          <p className="text-lg font-semibold">No properties found.</p>
          <p className="text-sm mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((property, i) => (
            <PropertyFullCard
              key={property.id}
              property={property}
              delay={i * 80}
            />
          ))}
        </div>
      )}
    </div>
  );
}
