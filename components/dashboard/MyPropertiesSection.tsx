import Link from "next/link";
import { PropertyCard } from "./PropertyCard";
import { DashboardWeeklyPhotoCard } from "./DashboardWeeklyPhotoCard";
import type { InvestorPropertyWithBuilding, InvestorWeeklyUpdateItem } from "@/lib/investorProperties";
import { useTranslations } from "next-intl";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80";

export function MyPropertiesSection({
  investorProperties = [],
  weeklyUpdates = [],
  investorType = "buyer",
  assetValueFormatted = "—",
  paidAmountFormatted = "—",
}: {
  investorProperties?: InvestorPropertyWithBuilding[];
  weeklyUpdates?: InvestorWeeklyUpdateItem[];
  investorType?: "buyer" | "renter";
  assetValueFormatted?: string;
  paidAmountFormatted?: string;
}) {
  const t = useTranslations("InvestorDashboard.myProperties");
  const isBuyer = investorType === "buyer";
  return (
    <div className="col-span-12">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h4 className="text-2xl font-bold text-gray-900">
            {t("title")}
          </h4>
          {isBuyer && assetValueFormatted !== "—" && (
            <p className="text-sm text-gray-500 mt-0.5">
              {t("totalValue")} <span className="font-semibold text-gray-700">{assetValueFormatted}</span>
            </p>
          )}
          {!isBuyer && paidAmountFormatted !== "—" && (
            <p className="text-sm text-gray-500 mt-0.5">
              {t("totalPaid")} <span className="font-semibold text-gray-700">{paidAmountFormatted}</span>
            </p>
          )}
        </div>
        <Link
          href="/dashboard/properties"
          className="text-[#134e4a] font-bold text-sm flex items-center gap-1 hover:underline"
        >
          {isBuyer ? t("viewAllAssets") : t("viewAllProperties")}{" "}
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
            badge={p.company_name || t("propertyBadge")}
            title={`${p.building.name} · ${p.block} ${p.unit}`}
            location={p.building.location || "—"}
            progress={p.building.progress}
            area={p.area_m2 != null && p.area_m2 > 0 ? `${p.area_m2} m²` : undefined}
            updateTime="—"
            updateText={t("assignedUnitUpdate")}
          />
        ))}
        {/* Weekly Photo column */}
        <div className="lg:col-span-1">
          <DashboardWeeklyPhotoCard weeklyUpdates={weeklyUpdates} />
        </div>
      </div>
    </div>
  );
}

