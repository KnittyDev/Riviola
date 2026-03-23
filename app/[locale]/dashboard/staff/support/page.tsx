import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

function formatDate(dateStr: string, locale: string): string {
  return new Date(dateStr).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const priorityColors: Record<string, string> = {
  Urgent: "bg-rose-50 text-rose-600 border-rose-100",
  High: "bg-amber-50 text-amber-600 border-amber-100",
  Medium: "bg-blue-50 text-blue-600 border-blue-100",
  Low: "bg-gray-50 text-gray-600 border-gray-100",
};

const statusColors: Record<string, string> = {
  Open: "bg-emerald-50 text-emerald-600 border-emerald-100",
  Resolved: "bg-purple-50 text-purple-600 border-purple-100",
  Closed: "bg-gray-100 text-gray-400 border-gray-200",
};

export default async function SupportTicketsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("Support");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{t("title")}</h1>
          <p className="text-gray-500 text-sm mt-1">{t("subtitle")}</p>
        </div>
        <Link
          href="/dashboard/staff/support/new"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#134e4a] text-white text-sm font-bold hover:bg-[#115e59] transition-all shadow-lg shadow-[#134e4a]/10"
        >
          <i className="las la-plus text-lg" />
          {t("newTicket")}
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {(!tickets || tickets.length === 0) ? (
          <div className="p-16 text-center">
            <div className="size-16 rounded-full bg-gray-50 text-gray-300 flex items-center justify-center mx-auto mb-4">
              <i className="las la-headset text-3xl" />
            </div>
            <p className="text-gray-500 font-medium">{t("noTickets")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{t("ticketTitle")}</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{t("priority")}</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{t("status")}</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{t("createdAt")}</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 group-hover:text-[#134e4a] transition-colors">{ticket.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{ticket.subject}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${priorityColors[ticket.priority] || priorityColors.Medium}`}>
                         {t(ticket.priority.toLowerCase())}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusColors[ticket.status] || statusColors.Open}`}>
                        {t(ticket.status.toLowerCase())}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                      {formatDate(ticket.created_at, locale)}
                    </td>
                    <td className="px-6 py-4 text-right pr-8">
                       <Link 
                         href={`/dashboard/staff/support/${ticket.id}`}
                         className="p-2 rounded-lg text-gray-400 hover:text-[#134e4a] hover:bg-gray-100 transition-all"
                       >
                         <i className="las la-angle-right text-lg" />
                       </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
