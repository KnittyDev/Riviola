import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { SettingsClient } from "./SettingsClient";

export default async function AdminSettingsPage() {
  const t = await getTranslations("Admin");
  const supabase = await createClient();

  // Fetch current site settings (first row)
  const { data: settings } = await supabase
    .from("site_settings")
    .select("maintenance_mode")
    .limit(1)
    .maybeSingle();

  return (
    <div className="p-8 space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">{t("settingsPage.title")}</h1>
        <p className="text-gray-500 font-medium font-inter">{t("settingsPage.subtitle")}</p>
      </div>

      <SettingsClient initialMaintenanceMode={settings?.maintenance_mode || false} />
      
      {/* Platform Audit Logs Section (Visual Placeholder) */}
      <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-2xl shadow-black/5 space-y-10 relative overflow-hidden">
         <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
               <div className="size-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
                  <i className="las la-history text-2xl" />
               </div>
               <div>
                  <h4 className="text-xl font-black text-gray-900 tracking-tight">{t("settingsPage.logsTitle")}</h4>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{t("settingsPage.logsSubtitle")}</p>
               </div>
            </div>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full uppercase tracking-widest border border-emerald-100 shadow-sm">{t("settingsPage.immutableRecords")}</span>
         </div>
         
         <div className="space-y-4 relative z-10 opacity-30 blur-[2px] select-none pointer-events-none">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-6 rounded-3xl border border-gray-50 bg-gray-50/50">
                 <div className="flex items-center gap-6">
                    <div className="size-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-300">
                       <i className="las la-user-shield" />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{t("settingsPage.logAction", { n: i })}</span>
                       <span className="text-xs text-gray-400 font-medium font-inter">{t("settingsPage.logBody")}</span>
                    </div>
                 </div>
                 <span className="text-[9px] font-black text-gray-300 font-mono">05 APR 2026 22:54:12</span>
              </div>
            ))}
         </div>
         <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full -translate-y-1/2 translate-x-1/2" />
      </div>
    </div>
  );
}
