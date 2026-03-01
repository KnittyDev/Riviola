import Link from "next/link";
import Image from "next/image";
import { staffBuildings } from "@/lib/staffBuildingsData";

export default function StaffBuildingsPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Buildings</h1>
        <Link
          href="/dashboard/staff/buildings/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#115e59] transition-colors"
        >
          <i className="las la-plus" aria-hidden />
          Add building
        </Link>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {staffBuildings.map((b) => (
            <li key={b.id} className="px-6 py-4 hover:bg-gray-50/80 transition-colors flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <Link
                href={`/dashboard/staff/buildings/${b.id}`}
                className="flex flex-1 min-w-0 items-center gap-4"
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  <Image
                    src={b.imageUrl}
                    alt={b.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 hover:text-[#134e4a]">{b.name}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                    <i className="las la-map-marker-alt text-gray-400" aria-hidden />
                    {b.location} · {b.units} units
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-4 shrink-0 sm:pl-2">
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#134e4a] rounded-full" style={{ width: `${b.progress}%` }} />
                </div>
                <span className="text-sm font-bold text-[#134e4a] w-10">{b.progress}%</span>
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    b.status === "Completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {b.status === "Completed" ? "Completed" : "In progress"}
                </span>
                <Link
                  href={`/dashboard/staff/buildings/${b.id}/edit`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-[#134e4a] hover:text-[#134e4a] transition-colors"
                >
                  <i className="las la-pen text-sm" aria-hidden />
                  Edit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
