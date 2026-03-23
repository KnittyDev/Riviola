import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { redirect, notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import Image from "next/image";

function formatDate(dateStr: string, locale: string): string {
  return new Date(dateStr).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-GB", {
    day: "numeric",
    month: "long",
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

export default async function TicketDetailPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params;
  const t = await getTranslations("Support");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: ticket } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("id", id)
    .eq("profile_id", user.id)
    .single();

  if (!ticket) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/dashboard/staff/support"
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#134e4a] mb-6 transition-colors"
      >
        <i className="las la-arrow-left text-lg" />
        {t("title")}
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-6 sm:p-8 bg-gray-50/50 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border mb-3 ${priorityColors[ticket.priority] || priorityColors.Medium}`}>
                {t(ticket.priority.toLowerCase())}
              </span>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{ticket.title}</h1>
              <p className="text-gray-500 text-sm mt-1">{ticket.subject}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t("createdAt")}</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">{formatDate(ticket.created_at, locale)}</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">{t("description")}</h2>
            <div className="p-4 bg-gray-50 rounded-xl text-gray-700 leading-relaxed whitespace-pre-wrap text-sm border border-gray-100">
              {ticket.description}
            </div>
          </div>

          {(ticket.image_urls && ticket.image_urls.length > 0) && (
            <div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">{t("photo")}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {ticket.image_urls.map((url: string, i: number) => (
                  <a 
                    key={i} 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 hover:opacity-90 transition-opacity"
                  >
                    <Image 
                      src={url} 
                      alt={`Issue photo ${i+1}`} 
                      fill 
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
