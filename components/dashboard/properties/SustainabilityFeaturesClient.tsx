"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const PREDEFINED_GREEN_FEATURES = [
  { label: "Solar Panels", icon: "las la-solar-panel" },
  { label: "EV Charging Stations", icon: "las la-charging-station" },
  { label: "Rainwater Harvesting", icon: "las la-tint" },
  { label: "Energy Efficient Lighting", icon: "las la-lightbulb" },
  { label: "Waste & Recycling Management", icon: "las la-recycle" },
  { label: "Smart Home Tech", icon: "las la-home" },
  { label: "Natural Ventilation", icon: "las la-wind" },
  { label: "Green Roof / Sky Garden", icon: "las la-leaf" },
  { label: "Advanced Thermal Insulation", icon: "las la-thermometer-half" },
  { label: "Eco-friendly Materials", icon: "las la-tree" },
  { label: "Professional Garden Design", icon: "las la-seedling" },
  { label: "Eco-friendly Infrastructure", icon: "las la-cog" },
  { label: "Pet Friendly Spaces", icon: "las la-paw" },
  { label: "Secure Bicycle Parking", icon: "las la-bicycle" },
  { label: "High-efficiency HVAC", icon: "las la-fan" },
  { label: "Water-saving Fixtures", icon: "las la-water" },
];

function getGreenFeatureIcon(label: string) {
  const feat = PREDEFINED_GREEN_FEATURES.find(f => f.label === label);
  return feat?.icon || "las la-check-circle";
}

export function SustainabilityFeaturesClient({ features }: { features: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const tFeatures = useTranslations("SustainabilityFeatures");
  const t = useTranslations("PropertyDetail");

  if (!features || features.length === 0) return null;

  const shownFeatures = expanded ? features : features.slice(0, 4);
  const hasMore = features.length > 4;

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-wrap justify-center gap-2">
        {shownFeatures.map((feature: string, i: number) => (
          <span key={i} className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg text-[10px] font-black uppercase tracking-wider transition-all hover:bg-white/20">
            <i className={`${getGreenFeatureIcon(feature)} mr-1`} />
            {tFeatures(feature as any)}
          </span>
        ))}
      </div>
      
      {hasMore && (
        <button 
          onClick={() => setExpanded(!expanded)}
          className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors flex items-center gap-2"
        >
          {expanded ? (
             <>{t("showLess")} <i className="las la-angle-up" /></>
          ) : (
             <>{t("fullList")} <i className="las la-angle-down" /></>
          )}
        </button>
      )}
    </div>
  );
}
