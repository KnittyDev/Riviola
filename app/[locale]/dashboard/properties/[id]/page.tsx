import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPropertyDetail } from "@/lib/propertyDetailData";
import { WeeklyPhotoUpdates } from "@/components/WeeklyPhotoUpdates";
import { WeatherWidget } from "@/components/dashboard/properties/WeatherWidget";
import { BuildingProgressClient } from "@/app/[locale]/dashboard/staff/buildings/[id]/BuildingOverridesClient";
import { BuildingMilestonesLog } from "@/app/[locale]/dashboard/staff/buildings/[id]/BuildingMilestonesLog";
import type { PlannedMilestoneDb } from "@/lib/supabase/types";
import type { ProgressMilestoneLog } from "@/lib/staffBuildingsData";
import { getTranslations } from "next-intl/server";
import { SustainabilityFeaturesClient } from "@/components/dashboard/properties/SustainabilityFeaturesClient";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80";

function getCurrentAndNextLabels(planned: PlannedMilestoneDb[], currentId: string | null, fallback: string) {
  if (planned.length === 0) return { current: null, next: null };
  const currentIndex = planned.findIndex((m) => m.id === currentId);
  
  const currentObj = currentIndex !== -1 ? planned[currentIndex] : null;
  const nextObj = currentIndex !== -1 && currentIndex < planned.length - 1 
    ? planned[currentIndex + 1] 
    : (currentIndex === -1 ? planned[0] : null);

  return {
    current: currentObj ? { title: currentObj.title, date: currentObj.dateTimeLocal } : null,
    next: nextObj ? { title: nextObj.title, date: nextObj.dateTimeLocal } : null,
  };
}

function plannedMilestonesToLog(planned: PlannedMilestoneDb[], locale: string, fallback: string): ProgressMilestoneLog[] {
  return planned.map((m) => ({
    id: m.id,
    title: m.title || fallback,
    label: m.title || fallback,
    date: m.dateTimeLocal || "",
    dateTime: m.dateTimeLocal, // Matches the formal property in BuildingMilestonesLog
    target_date: m.dateTimeLocal,
    status: "Upcoming" as any,
  }));
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const t = await getTranslations("PropertyDetail");
  const tFeatures = await getTranslations("SustainabilityFeatures");
  let property = getPropertyDetail(id);

  if (!property) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) notFound();
    
    const { data: building } = await supabase
      .from("buildings")
      .select("id, name, location, country, city, image_url, progress, status, company_id, planned_milestones, current_milestone_id, sustainability_score, sustainability_features, units")
      .eq("id", id)
      .single();
      
    if (!building) notFound();
    
    const { data: assignment } = await supabase
      .from("investor_properties")
      .select("block, unit, area_m2, delivery_period, purchase_value, purchase_currency")
      .eq("building_id", id)
      .eq("profile_id", user.id)
      .maybeSingle();
      
    if (!assignment) notFound();

    const { data: company } = (building as { company_id?: string }).company_id
      ? await supabase
          .from("companies")
          .select("name")
          .eq("id", (building as { company_id: string }).company_id)
          .single()
      : { data: null };
      
    const companyName = company?.name ?? "";

    const { data: updatesRows } = await supabase
      .from("building_weekly_updates")
      .select("id, week_label, date_range, description, building_weekly_update_images(storage_path, alt, sort_order)")
      .eq("building_id", id)
      .order("created_at", { ascending: false });
      
    const weeklyUpdates = (updatesRows ?? []).map((u: any) => {
      const images = (u.building_weekly_update_images ?? [])
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((img: any) => {
          const { data: urlData } = supabase.storage.from("weekly_photos").getPublicUrl(img.storage_path);
          return { url: urlData.publicUrl, alt: img.alt ?? "" };
        });
      return { id: u.id, weekLabel: u.week_label ?? "", range: u.date_range, description: u.description ?? "", images };
    });

    const planned = (building as any).planned_milestones ?? [];
    const currentId = (building as any).current_milestone_id ?? null;
    const { current, next } = getCurrentAndNextLabels(planned, currentId, t("milestoneFallback"));

    const formatDateHuman = (dateStr: string | null) => {
      if (!dateStr) return null;
      try {
        const d = new Date(dateStr);
        const resolvedLocale = locale === "tr" ? "tr-TR" : "en-GB";
        const datePart = d.toLocaleDateString(resolvedLocale, {
          weekday: "long",
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        const timePart = dateStr.includes("T") ? ` • ${dateStr.split("T")[1].substring(0, 5)}` : "";
        return `${datePart}${timePart}`;
      } catch {
        return dateStr;
      }
    };

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:px-8">
        <Link
          href="/dashboard/properties"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#134e4a] text-sm font-semibold mb-6 transition-all hover:-translate-x-1"
        >
          <i className="las la-arrow-left" aria-hidden />
          {t("backToProperties")}
        </Link>

        {/* Hero Section */}
        <div className="relative rounded-t-[2.5rem] lg:rounded-[2.5rem] overflow-hidden bg-white shadow-2xl shadow-gray-200/50 border border-gray-100 min-h-[300px] lg:h-[450px] group">
          <div className="absolute inset-0">
            <Image
              src={(building as any).image_url || PLACEHOLDER_IMAGE}
              alt={(building as any).name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent hidden lg:block" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:hidden" />
          </div>

          <div className="absolute top-6 left-6 lg:top-8 lg:left-8 flex flex-wrap gap-2 z-20">
            <span className="px-4 py-1.5 bg-white/95 backdrop-blur-md text-[#134e4a] text-[10px] lg:text-[11px] font-black uppercase tracking-widest rounded-full shadow-xl border border-white/20">
              {companyName || t("propertyBadge")}
            </span>
            <span className="px-4 py-1.5 bg-[#134e4a]/90 backdrop-blur-md text-white text-[10px] lg:text-[11px] font-black uppercase tracking-widest rounded-full shadow-xl border border-white/20">
              {(building as any).status}
            </span>
          </div>

          {/* Mobile Weather Overlay */}
          <div className="absolute bottom-6 left-6 z-30 lg:hidden">
            <WeatherWidget
              city={(building as any).city ?? undefined}
              country={(building as any).country ?? undefined}
              mode="dark"
            />
          </div>

          {/* Desktop Info Overlay */}
          <div className="absolute bottom-10 left-10 right-10 z-30 hidden lg:block">
            <div className="bg-white/95 backdrop-blur-md py-5 px-10 rounded-[2rem] shadow-2xl border border-white/20 flex items-center justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-black text-gray-900 leading-tight">
                  {(building as any).name}
                </h1>
                <p className="text-gray-500 mt-0.5 flex items-center gap-1.5 font-medium text-[13px]">
                  <i className="las la-map-marker-alt text-[#134e4a]" aria-hidden />
                  {(building as any).location || "—"}
                </p>
              </div>

              <div className="w-px h-10 bg-gray-200/50 mx-4" />

              <div className="flex-shrink-0">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5">{t("yourUnit")}</p>
                <div className="flex items-center gap-2.5">
                  <div className="bg-gray-50 border border-gray-100 px-3 py-1 rounded-xl shadow-sm">
                    <p className="text-[11px] font-black text-gray-900">{assignment.block}</p>
                  </div>
                  <i className="las la-angle-right text-gray-300 text-[10px]" />
                  <div className="bg-[#134e4a] px-3 py-1 rounded-xl shadow-md">
                    <p className="text-[11px] font-black text-white">{assignment.unit}</p>
                  </div>
                </div>
              </div>

              <div className="w-px h-10 bg-gray-200/50 mx-4" />

              <div className="flex-shrink-0">
                <WeatherWidget
                  city={(building as any).city ?? undefined}
                  country={(building as any).country ?? undefined}
                  mode="light"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Info Section (Separate from Banner) */}
        <div className="lg:hidden bg-white px-6 py-8 rounded-b-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 border-t-0 mb-12">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900 leading-tight">
                {(building as any).name}
              </h1>
              <p className="text-gray-500 mt-2 flex items-center gap-1.5 font-medium">
                <i className="las la-map-marker-alt text-[#134e4a] text-lg" aria-hidden />
                {(building as any).location || "—"}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{t("yourUnit")}</p>
              <div className="flex items-center gap-4">
                <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm">
                  <p className="text-lg font-black text-gray-900">{assignment.block}</p>
                </div>
                <i className="las la-arrow-right text-gray-300" />
                <div className="bg-[#134e4a] px-4 py-2 rounded-xl shadow-md shadow-[#134e4a]/10">
                  <p className="text-lg font-black text-white">{assignment.unit}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-white border-t border-gray-100 p-6 lg:p-10 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 rounded-[2rem] mb-12">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t("progress")}</p>
            <div className="flex items-center gap-4">
              <span className="text-sm font-black text-[#134e4a] min-w-[32px]">{(building as any).progress}%</span>
              <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner relative">
                <div
                  className="h-full bg-[#134e4a] rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${(building as any).progress}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-gray-300">100%</span>
            </div>
          </div>
          {assignment.area_m2 > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t("area")}</p>
              <div className="flex items-center gap-2">
                <i className="las la-expand-arrows-alt text-[#134e4a] text-lg" />
                <p className="text-xl font-black text-gray-900">{assignment.area_m2} m²</p>
              </div>
            </div>
          )}
          {assignment.purchase_value > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t("value")}</p>
              <div className="flex items-center gap-2">
                <i className="las la-wallet text-[#134e4a] text-lg" />
                <p className="text-xl font-black text-gray-900">
                  {new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-GB", {
                    style: "currency",
                    currency: assignment.purchase_currency,
                    maximumFractionDigits: 0,
                  }).format(assignment.purchase_value)}
                </p>
              </div>
            </div>
          )}
          {assignment.delivery_period?.trim() && (
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t("delivery")}</p>
              <div className="flex items-center gap-2">
                <i className="las la-truck-loading text-[#134e4a] text-lg" />
                <p className="text-xl font-black text-gray-900">{assignment.delivery_period}</p>
              </div>
            </div>
          )}
        </div>

        {/* Secondary Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <i className="las la-calendar-check text-[#134e4a]" />
                  {t("plans.title")}
                </h2>
                <p className="text-sm text-gray-500 font-medium">Tracking the roadmap</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-[#134e4a]/5 border border-[#134e4a]/10 hover:shadow-md transition-shadow">
                <p className="text-[10px] font-bold text-[#134e4a] uppercase tracking-widest">{t("currentMilestone")}</p>
                <p className="text-sm font-black text-gray-900 mt-1">{(current as any)?.title ?? "—"}</p>
                {(current as any)?.date && (
                  <p className="text-xs font-semibold text-[#134e4a] mt-1 italic">
                    {formatDateHuman((current as any).date)}
                  </p>
                )}
              </div>
              <div className="p-4 rounded-2xl bg-[#134e4a]/5 border border-[#134e4a]/10 hover:shadow-md transition-shadow">
                <p className="text-[10px] font-bold text-[#134e4a] uppercase tracking-widest">{t("nextMilestone")}</p>
                <p className="text-sm font-black text-gray-900 mt-1">{(next as any)?.title ?? "—"}</p>
                {(next as any)?.date && (
                  <p className="text-xs font-semibold text-[#134e4a] mt-1 italic">
                    {formatDateHuman((next as any).date)}
                  </p>
                )}
              </div>
            </div>

            <BuildingMilestonesLog
              milestones={plannedMilestonesToLog(planned, locale, t("milestoneFallback"))}
              currentMilestoneId={currentId}
            />
          </div>

          <div className="flex flex-col gap-8">
            {(building as any).sustainability_score > 0 && (
              <div className="bg-[#134e4a] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-[#134e4a]/20">
                <div className="absolute -top-12 -right-12 size-48 bg-white/10 rounded-full blur-3xl" />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="size-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6">
                    <i className="las la-leaf text-3xl" />
                  </div>
                  <h3 className="text-xl font-black">{t("sustainability.title")}</h3>
                  <p className="text-white/70 text-sm mt-1 mb-8">{t("sustainability.subtitle")}</p>
                  
                  <div className="relative inline-flex items-center justify-center mb-8">
                    <svg className="size-24 transform -rotate-90">
                      <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
                      <circle
                        cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent"
                        strokeDasharray={263.89}
                        strokeDashoffset={263.89 - (263.89 * (building as any).sustainability_score) / 100}
                        strokeLinecap="round"
                        className="text-white"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center leading-none">
                      <span className="text-3xl font-black">{(building as any).sustainability_score}</span>
                      <span className="text-[10px] font-bold uppercase opacity-60">Score</span>
                    </div>
                  </div>

                  <SustainabilityFeaturesClient features={(building as any).sustainability_features || []} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Photo Updates */}
        {weeklyUpdates.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="size-10 rounded-xl bg-[#134e4a] text-white flex items-center justify-center">
                <i className="las la-camera text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Weekly Progress</h2>
                <p className="text-sm text-gray-500 font-medium">Visual site reports</p>
              </div>
            </div>
            <WeeklyPhotoUpdates weeklyUpdates={weeklyUpdates} />
          </div>
        )}
      </div>
    );
  }

  // --- MOCK DATA BRANCH ---
  if (!property) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:px-8">
      <Link
        href="/dashboard/properties"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-[#134e4a] text-sm font-semibold mb-6 transition-all hover:-translate-x-1"
      >
        <i className="las la-arrow-left" aria-hidden />
        {t("backToProperties")}
      </Link>

      <div className="relative rounded-t-[2.5rem] lg:rounded-[2.5rem] overflow-hidden bg-white shadow-2xl shadow-gray-200/50 border border-gray-100 min-h-[300px] lg:h-[450px] group">
        <div className="absolute inset-0">
          <Image
            src={property.imageSrc}
            alt={property.imageAlt}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:hidden" />
        </div>

        <div className="absolute top-6 left-6 lg:top-8 lg:left-8 flex flex-wrap gap-2 z-20">
          <span className="px-4 py-1.5 bg-white/95 backdrop-blur-md text-[#134e4a] text-[10px] lg:text-[11px] font-black uppercase tracking-widest rounded-full shadow-xl border border-white/20">
            {(property as any).type || t("propertyBadge")}
          </span>
          <span className="px-4 py-1.5 bg-[#134e4a]/90 backdrop-blur-md text-white text-[10px] lg:text-[11px] font-black uppercase tracking-widest rounded-full shadow-xl border border-white/20">
            {property.badge}
          </span>
        </div>

        {/* Mobile Weather Overlay */}
        <div className="absolute bottom-6 left-6 z-30 lg:hidden">
          <WeatherWidget city={property.city} country={property.country} mode="dark" />
        </div>

        {/* Desktop Info Overlay */}
        <div className="absolute bottom-10 left-10 right-10 z-30 hidden lg:block">
          <div className="bg-white/95 backdrop-blur-md py-5 px-10 rounded-[2rem] shadow-2xl border border-white/20 flex items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-black text-gray-900 leading-tight">
                {property.title}
              </h1>
              <p className="text-gray-500 mt-0.5 flex items-center gap-1.5 font-medium text-[13px]">
                <i className="las la-map-marker-alt text-[#134e4a]" aria-hidden />
                {property.location}
              </p>
            </div>

            <div className="w-px h-10 bg-gray-200/50 mx-4" />

            <div className="flex-shrink-0">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5">{t("yourUnit")}</p>
              <div className="flex items-center gap-3">
                <div className="bg-gray-50 border border-gray-100 px-3 py-1 rounded-xl shadow-sm">
                  <p className="text-[11px] font-black text-gray-900">Unit 402</p>
                </div>
              </div>
            </div>

            <div className="w-px h-10 bg-gray-200/50 mx-4" />

            <div className="flex-shrink-0">
              <WeatherWidget city={property.city} country={property.country} mode="light" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Info Section (Separate from Banner) */}
      <div className="lg:hidden bg-white px-6 py-8 rounded-b-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 border-t-0 mb-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 leading-tight">
              {property.title}
            </h1>
            <p className="text-gray-500 mt-2 flex items-center gap-1.5 font-medium">
              <i className="las la-map-marker-alt text-[#134e4a] text-lg" aria-hidden />
              {property.location}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{t("yourUnit")}</p>
            <div className="flex items-center gap-4">
              <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm">
                <p className="text-lg font-black text-gray-900">Unit 402</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-gray-100 p-6 lg:p-10 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 rounded-[2rem] mb-12">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t("progress")}</p>
          <div className="flex items-center gap-4">
            <span className="text-sm font-black text-[#134e4a] min-w-[32px]">{property.progress}%</span>
            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner relative">
              <div 
                className="h-full bg-[#134e4a] rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${property.progress}%` }} 
              />
            </div>
            <span className="text-[10px] font-bold text-gray-300">100%</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t("area")}</p>
          <div className="flex items-center gap-2">
            <i className="las la-expand-arrows-alt text-[#134e4a] text-lg" />
            <p className="text-xl font-black text-gray-900">{property.area}</p>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t("value")}</p>
          <div className="flex items-center gap-2">
            <i className="las la-wallet text-[#134e4a] text-lg" />
            <p className="text-xl font-black text-gray-900">{property.value}</p>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t("delivery")}</p>
          <div className="flex items-center gap-2">
            <i className="las la-truck-loading text-[#134e4a] text-lg" />
            <p className="text-xl font-black text-gray-900">{property.deliveryDate}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <section className="lg:col-span-2 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="size-10 rounded-xl bg-[#134e4a]/10 text-[#134e4a] flex items-center justify-center">
              <i className="las la-calendar-check text-xl" aria-hidden />
            </div>
            <h2 className="text-xl font-black text-gray-900 leading-tight">{t("plans.title")}</h2>
          </div>
          <div className="relative">
            <div className="absolute left-[15px] top-4 bottom-4 w-px bg-gray-100" />
            {property.plans.map((plan: any, i: number) => {
              const d = new Date(`${plan.date}T${plan.time || "00:00"}`);
              const formattedDate = d.toLocaleDateString(locale === "tr" ? "tr-TR" : "en-GB", { 
                weekday: "long", 
                day: "numeric", 
                month: "short", 
                year: "numeric" 
              });
              
              return (
                <div key={i} className="relative pl-12 pb-8 last:pb-0 group">
                  <div className={`absolute left-0 top-1.5 size-[31px] rounded-full border-4 border-white shadow-sm z-10 transition-transform group-hover:scale-110 ${plan.status === "completed" ? "bg-emerald-500" : "bg-gray-200"}`} />
                  <div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="text-[10px] font-black text-[#134e4a] uppercase tracking-widest">{formattedDate}</p>
                      <span className="text-gray-300 hidden sm:inline">•</span>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-50 border border-gray-100">
                        <i className="las la-clock text-[10px] text-gray-400" />
                        <p className="text-[10px] font-black text-gray-600">{plan.time || "00:00"}</p>
                      </div>
                    </div>
                    <h3 className={`text-base font-black mt-1.5 ${plan.status === "completed" ? "text-gray-900" : "text-gray-400"}`}>{plan.title}</h3>
                    {plan.description && (
                      <p className="text-sm text-gray-500 mt-1 leading-relaxed max-w-2xl">{plan.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-[#134e4a] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-[#134e4a]/20">
          <div className="absolute -top-12 -right-12 size-48 bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="size-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6">
              <i className="las la-leaf text-3xl" />
            </div>
            <h3 className="text-xl font-black">{t("sustainability.title")}</h3>
            <p className="text-white/70 text-sm mt-1 mb-8">{t("sustainability.subtitle")}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Solar Panels", "EV Charging", "Green Garden"].map((feat, i) => (
                <span key={i} className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg text-[10px] font-black uppercase tracking-wider">{feat}</span>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="size-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center">
              <i className="las la-history text-xl" />
            </div>
            <h2 className="text-xl font-black text-gray-900 leading-tight">{t("activityLog.title")}</h2>
          </div>
          <div className="space-y-4">
            {property.logs.map((log: any, i: number) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="size-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <i className="las la-check text-[#134e4a]" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{log.date}</span>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">{log.message}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {property.weeklyUpdates && property.weeklyUpdates.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="size-10 rounded-xl bg-[#134e4a] text-white flex items-center justify-center">
              <i className="las la-camera text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Weekly Progress</h2>
              <p className="text-sm text-gray-500 font-medium">Visual site reports</p>
            </div>
          </div>
          <WeeklyPhotoUpdates weeklyUpdates={property.weeklyUpdates} />
        </div>
      )}
    </div>
  );
}
