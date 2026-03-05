import Link from "next/link";
import { PropertyCard } from "./PropertyCard";
import { DashboardWeeklyPhotoCard } from "./DashboardWeeklyPhotoCard";
import type { InvestorPropertyWithBuilding } from "@/lib/investorProperties";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80";

export function MyPropertiesSection({
  investorProperties = [],
}: {
  investorProperties?: InvestorPropertyWithBuilding[];
}) {
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
        {investorProperties.map((p) => (
          <PropertyCard
            key={p.id}
            id={p.building_id}
            imageSrc={p.building.image_url || PLACEHOLDER_IMAGE}
            imageAlt={p.building.name}
            badge={p.company_name || "Property"}
            title={`${p.building.name} · ${p.block} ${p.unit}`}
            location={p.building.location || "—"}
            progress={p.building.progress}
            updateTime="—"
            updateText="Assigned unit. View details for updates."
          />
        ))}
        {/* Weekly Photo column */}
        <div className="lg:col-span-1">
          <DashboardWeeklyPhotoCard />
        </div>
      </div>
    </div>
  );
}

