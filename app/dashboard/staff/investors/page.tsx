import Link from "next/link";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getStaffCompanyId } from "@/lib/buildings";
import { getCompanyInvestorProperties } from "@/lib/companyInvestors";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StaffInvestorsPage() {
  const supabase = await createClient();
  const companyId = await getStaffCompanyId(supabase);
  if (!companyId) redirect("/dashboard/staff");

  const serviceClient = createServiceRoleClient();
  const properties = await getCompanyInvestorProperties(serviceClient, companyId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Investors
        </h1>
        <Link
          href="/dashboard/staff/investors/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#115e59] transition-colors shrink-0"
        >
          <i className="las la-user-plus" aria-hidden />
          Create investor account
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <i className="las la-users text-4xl text-gray-300 mb-4" aria-hidden />
          <p className="text-gray-500 font-medium">No investor properties yet.</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">
            When investors are assigned to units in your company&apos;s buildings, they will appear here.
          </p>
          <Link
            href="/dashboard/staff/investors/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#115e59] transition-colors"
          >
            <i className="las la-plus" aria-hidden />
            Create investor account
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Investor
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Block
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    m²
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Delivery
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {properties.map((row, idx) => (
                  <tr key={`${row.profile_id}-${row.building_id}-${row.block}-${row.unit}-${idx}`} className="hover:bg-gray-50/80">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{row.full_name || "—"}</p>
                      {row.email && (
                        <a href={`mailto:${row.email}`} className="text-sm text-[#134e4a] hover:underline">
                          {row.email}
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/staff/buildings/${row.building_id}`}
                        className="text-sm font-medium text-gray-900 hover:text-[#134e4a]"
                      >
                        {row.building_name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{row.block}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{row.unit}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {row.area_m2 != null ? `${row.area_m2}` : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {row.delivery_period || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
