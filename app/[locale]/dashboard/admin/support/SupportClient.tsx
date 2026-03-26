"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface SupportTicket {
  id: string;
  title: string;
  subject: string;
  priority: string;
  status: string;
  description: string;
  image_urls: string[] | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export function SupportClient({ initialTickets }: { initialTickets: SupportTicket[] }) {
  const commonT = useTranslations("Sidebar");
  const [tickets, setTickets] = useState(initialTickets);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const router = useRouter();

  async function updateStatus(id: string, newStatus: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("support_tickets")
      .update({ status: newStatus })
      .eq("id", id);
    
    if (!error) {
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
      router.refresh();
    }
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">{commonT("supportTickets")}</h1>
        <p className="text-gray-500 font-medium font-inter">Manage and resolve global help requests from all users.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Identity</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Subject / Title</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Priority</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tickets.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-8 py-12 text-center text-gray-400 italic font-medium font-inter">No support tickets found.</td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900 leading-tight mb-0.5">
                          {ticket.profiles?.full_name || "Anonymous User"}
                        </span>
                        <span className="text-xs text-gray-400 font-medium font-inter">
                          {ticket.profiles?.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-orange-600 uppercase tracking-widest mb-1">{ticket.subject}</span>
                        <p className="text-sm font-bold text-gray-900 truncate max-w-sm">{ticket.title}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`
                        px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                        ${ticket.priority === 'Urgent' ? 'bg-rose-100 text-rose-700' : 
                          ticket.priority === 'High' ? 'bg-orange-100 text-orange-700' : 
                          'bg-emerald-100 text-emerald-700'}
                      `}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                       <select 
                         value={ticket.status}
                         onChange={(e) => updateStatus(ticket.id, e.target.value)}
                         className={`
                           px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#134e4a]/20
                         `}
                       >
                         <option value="Open">Open</option>
                         <option value="Resolved">Resolved</option>
                         <option value="Closed">Closed</option>
                       </select>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => setSelectedTicket(ticket)}
                        className="px-6 py-2 rounded-xl bg-orange-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setSelectedTicket(null)}
          />
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-white/20">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
               <div>
                  <span className="text-xs font-black text-orange-600 uppercase tracking-widest block mb-1">
                    {selectedTicket.subject}
                  </span>
                  <h2 className="text-2xl font-black text-gray-900 leading-tight">
                    {selectedTicket.title}
                  </h2>
               </div>
               <button 
                 onClick={() => setSelectedTicket(null)}
                 className="size-12 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-rose-500 hover:border-rose-100 transition-all flex items-center justify-center"
               >
                 <i className="las la-times text-xl" />
               </button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
               <div className="space-y-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Description</h4>
                  <div className="bg-gray-50 p-8 rounded-[2rem] text-gray-700 leading-relaxed font-medium font-inter border border-gray-100 shadow-inner">
                     {selectedTicket.description}
                  </div>
               </div>

               {selectedTicket.image_urls && selectedTicket.image_urls.length > 0 && (
                 <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Attached Visual Evidence</h4>
                    <div className="grid grid-cols-2 gap-4">
                       {selectedTicket.image_urls.map((url: string, idx: number) => (
                         <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="group relative aspect-square overflow-hidden rounded-[2rem] border border-gray-100 block shadow-lg hover:scale-[1.02] transition-transform duration-300">
                           <img 
                             src={url} 
                             alt="" 
                             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                           />
                           <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                              <span className="text-[10px] text-white font-black uppercase tracking-widest flex items-center gap-2">
                                 <i className="las la-external-link-alt" /> View Full Image
                              </span>
                           </div>
                         </a>
                       ))}
                    </div>
                 </div>
               )}

               <div className="pt-8 border-t border-gray-100 grid grid-cols-2 gap-8">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Requester Identity</span>
                    <span className="text-sm font-bold text-gray-900">{selectedTicket.profiles?.full_name}</span>
                    <span className="text-xs text-gray-500 font-medium font-inter">{selectedTicket.profiles?.email}</span>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Submitted On</span>
                    <span className="text-sm font-black text-gray-900 leading-tight">
                      {new Date(selectedTicket.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                       ID: {selectedTicket.id.slice(0, 8)}
                    </span>
                  </div>
               </div>
            </div>

            <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Ticket Priority:</span>
                  <span className={`
                    px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest
                    ${selectedTicket.priority === 'Urgent' ? 'bg-rose-100 text-rose-700' : 
                      selectedTicket.priority === 'High' ? 'bg-orange-100 text-orange-700' : 
                      'bg-emerald-100 text-emerald-700'}
                  `}>
                    {selectedTicket.priority}
                  </span>
               </div>
               <button 
                 onClick={() => setSelectedTicket(null)}
                 className="px-8 py-3 rounded-2xl bg-gray-900 text-white font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-xl shadow-black/20"
               >
                 Close Detail View
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
