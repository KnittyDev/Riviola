import { createClient } from "@/lib/supabase/server";

export default async function AdminOverviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient();

  // Basic stats for overview
  const { count: companiesCount } = await supabase.from("companies").select("*", { count: 'exact', head: true });
  const { count: usersCount } = await supabase.from("profiles").select("*", { count: 'exact', head: true });
  const { count: pendingWithdrawals } = await supabase.from("withdrawal_requests").select("*", { count: 'exact', head: true }).eq("status", "Pending");

  const statCards = [
    { label: "Total Companies", value: companiesCount || 0, icon: "la-building" },
    { label: "Total Users", value: usersCount || 0, icon: "la-users" },
    { label: "Pending Withdrawals", value: pendingWithdrawals || 0, icon: "la-hand-holding-usd" }
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
         <h1 className="text-4xl font-black text-gray-900 tracking-tight">Riviola HQ Overview</h1>
         <p className="text-gray-500 font-medium font-inter">Platform-wide management and performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {statCards.map((stat, idx) => (
           <div key={idx} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-black/5 hover:scale-[1.03] transition-all group relative overflow-hidden">
              <div className="size-20 rounded-3xl bg-orange-600/10 flex items-center justify-center mb-8 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500 shadow-lg shadow-orange-600/5">
                 <i className={`las ${stat.icon} text-4xl text-orange-600 group-hover:text-white transition-colors`} />
              </div>
              <p className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] mb-2">{stat.label}</p>
              <p className="text-5xl font-black text-gray-900 tracking-tighter tabular-nums">{stat.value}</p>
              
              <div className="absolute -right-8 -bottom-8 size-32 bg-orange-600/5 rounded-full blur-2xl group-hover:bg-orange-600/10 transition-colors" />
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
         <div className="bg-[#134e4a] p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-1000" />
            <div className="relative z-10">
               <div className="flex items-center gap-4 mb-8">
                  <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                     <i className="las la-globe text-2xl text-teal-300" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">Global Infrastructure</h3>
               </div>
               <p className="text-teal-100/70 mb-10 text-lg leading-relaxed max-w-md font-medium font-inter">All systems are operational across all regions. Real-time database latency and processing nodes are performing within parameters.</p>
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-emerald-500/20 px-4 py-2 rounded-full border border-emerald-500/30">
                     <div className="size-2.5 bg-emerald-400 rounded-full animate-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Operational</span>
                  </div>
               </div>
            </div>
         </div>
         
         <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-xl flex flex-col justify-center relative overflow-hidden group">
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-4">
                  <i className="las la-exclamation-triangle text-orange-600 text-2xl" />
                  <h3 className="text-xl font-black text-gray-900 leading-none">Administrative Protocol</h3>
               </div>
               <p className="text-gray-500 leading-relaxed font-medium font-inter">
                  You are currently authenticated in the **Riviola HQ** core portal. Changes made here propagate across the entire ecosystem, affecting all registered companies and their associated investment portfolios.
               </p>
               <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">System Level: SuperAdmin</span>
                  <div className="size-2 bg-orange-600 rounded-full animate-bounce" />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
