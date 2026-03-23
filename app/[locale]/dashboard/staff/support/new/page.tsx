import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { NewTicketForm } from "./NewTicketForm";

export default async function NewTicketPage() {
  const t = await getTranslations("Support");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/dashboard/staff/support"
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#134e4a] mb-6 transition-colors"
      >
        <i className="las la-arrow-left text-lg" />
        {t("title")}
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          {t("newTicket")}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {t("subtitle")}
        </p>
      </div>

      <NewTicketForm />
    </div>
  );
}
