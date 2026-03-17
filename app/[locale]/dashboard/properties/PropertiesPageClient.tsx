"use client";

import { useState, useMemo } from "react";
import { PropertiesFilterBar } from "@/components/dashboard/properties/PropertiesFilterBar";
import {
  PropertyFullCard,
  type PropertyFull,
} from "@/components/dashboard/properties/PropertyFullCard";
import type { InvestorPropertyWithBuilding } from "@/lib/investorProperties";
import { useTranslations } from "next-intl";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80";

export function PropertiesPageClient({
  investorProperties,
}: {
  investorProperties: InvestorPropertyWithBuilding[];
}) {
  const t = useTranslations("PropertiesPage");
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  const list = useMemo(() => {
    return investorProperties.map((p): PropertyFull => {
      const areaStr =
        p.area_m2 != null && p.area_m2 > 0 ? `${p.area_m2} m²` : "—";
      return {
        id: p.building_id,
        imageSrc: p.building.image_url || PLACEHOLDER_IMAGE,
        imageAlt: p.building.name,
        badge: p.company_name || t("card.propertyBadge"),
        status: "active",
        title: `${p.building.name} · ${p.block} ${p.unit}`,
        location: p.building.location || "—",
        progress: p.building.progress,
        area: areaStr,
        deliveryDate: p.delivery_period?.trim() || "—",
        updateTime: "—",
        updateText: t("card.propertyBadge"),
      };
    });
  }, [investorProperties, t]);

  const filtered = useMemo(() => {
    let result = list;
    if (activeFilter !== "all")
      result = result.filter((p) => p.status === activeFilter);
    if (search.trim())
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.location.toLowerCase().includes(search.toLowerCase())
      );
    return result;
  }, [list, activeFilter, search]);

  return (
    <>
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
          <p className="text-lg font-semibold">{t("empty.noFound")}</p>
          <p className="text-sm mt-1">
            {investorProperties.length === 0
              ? t("empty.noAssigned")
              : t("empty.tryAdjusting")}
          </p>
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
    </>
  );
}
