"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

interface Reply {
  id: string;
  message: string;
  created_at: string;
  profiles: {
    full_name: string | null;
  } | null;
}

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
  support_ticket_replies: Reply[];
}

function priorityMessageKey(priority: string): "urgent" | "high" | "medium" | "low" {
  const p = priority?.toLowerCase();
  if (p === "urgent") return "urgent";
  if (p === "high") return "high";
  if (p === "low") return "low";
  return "medium";
}

function ticketStatusKey(status: string): "open" | "resolved" | "closed" {
  const s = status?.toLowerCase();
  if (s === "resolved") return "resolved";
  if (s === "closed") return "closed";
  return "open";
}

export function SupportClient({ initialTickets }: { initialTickets: SupportTicket[] }) {
  const commonT = useTranslations("Sidebar");
  const t = useTranslations("Admin");
  const supportLabels = useTranslations("Support");
  const [tickets, setTickets] = useState(initialTickets);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sending, setSending] = useState(false);
  const router = useRouter();

  async function updateStatus(id: string, newStatus: string) {
    const supabase = createClient();
    const { error } = await supabase.from("support_tickets").update({ status: newStatus }).eq("id", id);

    if (!error) {
      setTickets((prev) => prev.map((tick) => (tick.id === id ? { ...tick, status: newStatus } : tick)));
      if (selectedTicket?.id === id) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
      router.refresh();
      toast.success(t("support.toastTicketUpdated"));
    }
  }

  async function handleSendReply() {
    if (!replyMessage.trim() || !selectedTicket) return;

    setSending(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    try {
      const { data: newReply, error } = await supabase
        .from("support_ticket_replies")
        .insert({
          ticket_id: selectedTicket.id,
          profile_id: user.id,
          message: replyMessage,
        })
        .select(`
          *,
          profiles ( full_name )
        `)
        .single();

      if (error) throw error;

      const updatedReply: Reply = newReply as Reply;
      setTickets((prev) =>
        prev.map((tick) =>
          tick.id === selectedTicket.id ? { ...tick, support_ticket_replies: [...tick.support_ticket_replies, updatedReply] } : tick
        )
      );
      setSelectedTicket({
        ...selectedTicket,
        support_ticket_replies: [...selectedTicket.support_ticket_replies, updatedReply],
      });

      setReplyMessage("");
      toast.success(t("support.toastReplySent"));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("support.toastReplyFailed"));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">{commonT("supportTickets")}</h1>
        <p className="text-gray-500 font-medium font-inter">{t("support.subtitle")}</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">{t("support.thIdentity")}</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">{t("support.thSubject")}</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">{t("support.thPriority")}</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">{t("support.thStatus")}</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400 text-right">{t("support.thActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-inter">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-gray-400 italic font-medium">
                    {t("support.empty")}
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900 leading-tight mb-0.5">
                          {ticket.profiles?.full_name || t("support.anonymous")}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">{ticket.profiles?.email}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-orange-600 uppercase tracking-widest mb-1">{ticket.subject}</span>
                        <p className="text-sm font-bold text-gray-900 truncate max-w-sm">{ticket.title}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={`
                        px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                        ${
                          ticket.priority === "Urgent"
                            ? "bg-rose-100 text-rose-700"
                            : ticket.priority === "High"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-emerald-100 text-emerald-700"
                        }
                      `}
                      >
                        {supportLabels(priorityMessageKey(ticket.priority))}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <select
                        value={ticket.status}
                        onChange={(e) => updateStatus(ticket.id, e.target.value)}
                        className={`
                           px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-600/10
                         `}
                      >
                        <option value="Open">{supportLabels("open")}</option>
                        <option value="Resolved">{supportLabels("resolved")}</option>
                        <option value="Closed">{supportLabels("closed")}</option>
                      </select>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="px-6 py-2 rounded-xl bg-orange-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20"
                      >
                        {t("support.respond")}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTicket(null)} />
          <div className="bg-white w-full max-w-4xl rounded-[3.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-white/20">
            <div className="p-8 sm:p-12 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-black text-orange-600 uppercase tracking-widest">{selectedTicket.subject}</span>
                  <span
                    className={`
                        px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                        ${
                          selectedTicket.status === "Open"
                            ? "bg-amber-100 text-amber-700"
                            : selectedTicket.status === "Resolved"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-100 text-gray-500"
                        }
                     `}
                  >
                    {supportLabels(ticketStatusKey(selectedTicket.status))}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">{selectedTicket.title}</h2>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="size-14 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-rose-500 hover:border-rose-100 transition-all flex items-center justify-center shadow-sm"
              >
                <i className="las la-times text-2xl" />
              </button>
            </div>

            <div className="p-8 sm:p-12 overflow-y-auto flex-1 custom-scrollbar space-y-12 bg-white font-inter">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-xl bg-orange-600/10 flex items-center justify-center">
                    <i className="las la-comment-alt text-orange-600" />
                  </div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">{t("support.initialRequest")}</h4>
                </div>
                <div className="bg-gray-50 p-10 rounded-[2.5rem] border border-gray-100 font-medium text-gray-700 leading-relaxed shadow-inner">
                  {selectedTicket.description}
                </div>

                {selectedTicket.image_urls && selectedTicket.image_urls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {selectedTicket.image_urls.map((url: string, idx: number) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="aspect-square rounded-2xl overflow-hidden border border-gray-100 block shadow-md group"
                      >
                        <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {selectedTicket.support_ticket_replies.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-[#134e4a]/10 flex items-center justify-center">
                      <i className="las la-history text-[#134e4a]" />
                    </div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">{t("support.conversationLog")}</h4>
                  </div>
                  <div className="space-y-4">
                    {selectedTicket.support_ticket_replies.map((reply) => (
                      <div key={reply.id} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between px-4">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {reply.profiles?.full_name || t("support.unknownUser")}
                          </span>
                          <span className="text-[10px] text-gray-300 font-bold">
                            {new Date(reply.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <div
                          className={`p-6 rounded-3xl text-sm font-medium ${
                            reply.profiles?.full_name?.includes("Admin")
                              ? "bg-orange-50 text-orange-900 border border-orange-100 self-end ml-12"
                              : "bg-gray-50 text-gray-700 border border-gray-100 mr-12"
                          }`}
                        >
                          {reply.message}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-12 border-t border-gray-50 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-xl bg-gray-900 text-white flex items-center justify-center">
                    <i className="las la-reply text-lg" />
                  </div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">{t("support.postResponse")}</h4>
                </div>
                <div className="relative">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder={t("support.replyPlaceholder")}
                    rows={4}
                    className="w-full p-8 rounded-[2rem] border-2 border-gray-100 bg-gray-50/50 focus:border-orange-600 focus:bg-white outline-none transition-all font-medium text-gray-900 placeholder:text-gray-300 shadow-inner"
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(selectedTicket.id, "Resolved")}
                      className="px-6 py-3 rounded-2xl bg-emerald-50 text-emerald-600 font-black uppercase text-[10px] tracking-widest border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                    >
                      {t("support.sendResolve")}
                    </button>
                    <button
                      onClick={() => updateStatus(selectedTicket.id, "Closed")}
                      className="px-6 py-3 rounded-2xl bg-gray-50 text-gray-500 font-black uppercase text-[10px] tracking-widest border border-gray-100 hover:bg-gray-900 hover:text-white transition-all shadow-sm"
                    >
                      {t("support.rejectClose")}
                    </button>
                  </div>
                  <button
                    onClick={handleSendReply}
                    disabled={sending || !replyMessage.trim()}
                    className="px-10 py-4 rounded-2xl bg-orange-600 text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-orange-700 disabled:opacity-50 transition-all shadow-xl shadow-orange-600/20 active:scale-95"
                  >
                    {sending ? t("support.transmitting") : t("support.sendResponse")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
