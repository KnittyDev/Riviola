import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPropertyDetail } from "@/lib/propertyDetailData";
import { WeeklyPhotoUpdates } from "@/components/WeeklyPhotoUpdates";

function formatPlanDate(d: string, t: string) {
  const date = new Date(d + "T" + t);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatLogDate(d: string, t: string) {
  const date = new Date(d + "T" + t);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatLogTime(t: string) {
  return t;
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = getPropertyDetail(id);
  if (!property) notFound();

  return (
    <div className="p-8">
      {/* Back link */}
      <Link
        href="/dashboard/properties"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-[#134e4a] text-sm font-medium mb-6 transition-colors"
      >
        <i className="las la-arrow-left" aria-hidden />
        Back to properties
      </Link>

      {/* Hero */}
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white mb-8">
        <div className="relative h-64 md:h-80">
          <Image
            src={property.imageSrc}
            alt={property.imageAlt}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <span className="inline-block px-3 py-1 bg-white/90 text-gray-900 text-xs font-bold rounded-lg uppercase tracking-wider mb-2">
              {property.badge}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold">
              {property.title}
            </h1>
            <p className="text-white/90 text-sm mt-1 flex items-center gap-1">
              <i className="las la-map-marker-alt" aria-hidden />
              {property.location}
            </p>
          </div>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-gray-100">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Progress</p>
            <p className="text-xl font-bold text-[#134e4a]">{property.progress}%</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Value</p>
            <p className="text-xl font-bold text-gray-900">{property.value}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Area</p>
            <p className="text-xl font-bold text-gray-900">{property.area}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Delivery</p>
            <p className="text-xl font-bold text-gray-900">{property.deliveryDate}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Plans */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <i className="las la-calendar-check text-[#134e4a] text-xl" aria-hidden />
            <h2 className="text-lg font-bold text-gray-900">Plans & schedule</h2>
          </div>
          <div className="p-6">
            <div className="relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gray-200" />
              <ul className="space-y-0">
                {property.plans.map((plan, i) => (
                  <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
                    <div
                      className={`relative z-10 shrink-0 mt-0.5 size-6 rounded-full flex items-center justify-center ${
                        plan.status === "completed"
                          ? "bg-emerald-500"
                          : plan.status === "in-progress"
                            ? "bg-amber-500 ring-4 ring-amber-500/20"
                            : "bg-gray-200"
                      }`}
                    >
                      {plan.status === "completed" && (
                        <i className="las la-check text-white text-xs" aria-hidden />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-gray-500">
                        {formatPlanDate(plan.date, plan.time)}
                      </p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">
                        {plan.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                      {plan.status === "in-progress" && (
                        <span className="inline-block mt-2 px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold uppercase">
                          In progress
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Logs */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <i className="las la-clipboard-list text-[#134e4a] text-xl" aria-hidden />
            <h2 className="text-lg font-bold text-gray-900">Activity log</h2>
          </div>
          <div className="p-6 max-h-[600px] overflow-y-auto">
            <ul className="space-y-4">
              {property.logs.map((log, i) => (
                <li
                  key={i}
                  className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  <div className="shrink-0 w-16 text-right">
                    <p className="text-[10px] font-mono text-gray-500 uppercase">
                      {formatLogDate(log.date, log.time)}
                    </p>
                    <p className="text-xs font-mono font-semibold text-gray-700 mt-0.5">
                      {formatLogTime(log.time)}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-bold uppercase mb-1">
                      {log.category}
                    </span>
                    <p className="text-sm text-gray-800">{log.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Weekly photo updates */}
      {property.weeklyUpdates && property.weeklyUpdates.length > 0 && (
        <WeeklyPhotoUpdates weeklyUpdates={property.weeklyUpdates} />
      )}
    </div>
  );
}
