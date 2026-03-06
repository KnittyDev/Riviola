import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { InvestorDuesFeeItem } from "@/lib/investorDues";

function formatPaidAt(paidAt: string | null): string {
  if (!paidAt) return "—";
  try {
    const d = new Date(paidAt);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "—";
  }
}

/** Load image from public URL and return as base64 data URL for jsPDF */
function loadImageAsBase64(url: string): Promise<string> {
  return fetch(url)
    .then((r) => r.blob())
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    );
}

/**
 * Generates a PDF of the investor's dues and triggers download.
 */
export async function downloadDuesPdf(fees: InvestorDuesFeeItem[]): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.getPageWidth();
  const margin = 14;
  let y = 14;

  try {
    const euFlagData = await loadImageAsBase64("/eu_flag.jpg");
    const imgW = 24;
    const imgH = 16;
    doc.addImage(euFlagData, "JPEG", pageWidth - margin - imgW, y, imgW, imgH);
    y += imgH + 8;
  } catch {
    y += 4;
  }

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Dues & Fees Summary", margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}`, margin, y);
  y += 12;

  if (fees.length === 0) {
    doc.setFontSize(11);
    doc.text("No dues recorded yet.", margin, y);
    doc.save("dues-summary.pdf");
    return;
  }

  const fileName =
    fees.length === 1
      ? `dues-${fees[0].periodKey}-${fees[0].building.replace(/\s+/g, "-")}.pdf`
      : "dues-summary.pdf";

  const headers = ["Building / Unit", "Period", "Due date", "Amount", "Status", "Invoice ID", "Paid on"];
  const rows = fees.map((f) => [
    `${f.building}\n${f.unit}`,
    f.period,
    f.dueDate,
    f.amountFormatted,
    f.status === "paid" ? "Paid" : f.status === "overdue" ? "Overdue" : "Due",
    f.status === "paid" && f.payment_number ? f.payment_number : "—",
    f.status === "paid" ? formatPaidAt(f.paid_at) : "—",
  ]);

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: y,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9 },
    headStyles: { fillColor: [19, 78, 74], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 36 },
      1: { cellWidth: 30 },
      2: { cellWidth: 24 },
      3: { cellWidth: 24 },
      4: { cellWidth: 18 },
      5: { cellWidth: 22 },
      6: { cellWidth: "auto" },
    },
    didDrawPage: (data) => {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${data.pageNumber} of ${doc.getNumberOfPages()}`,
        pageWidth - margin - 20,
        doc.getPageHeight() - 10
      );
      doc.setTextColor(0, 0, 0);
    },
  });

  const docWithTable = doc as jsPDF & { lastAutoTable?: { finalY: number } };
  const finalY = docWithTable.lastAutoTable?.finalY ?? y;
  y = finalY + 14;

  const paidCount = fees.filter((f) => f.status === "paid").length;
  const dueCount = fees.filter((f) => f.status === "due" || f.status === "overdue").length;
  const totalDue = fees
    .filter((f) => f.status === "due" || f.status === "overdue")
    .reduce((sum, f) => sum + (f.amountCents != null ? f.amountCents / 100 : 0), 0);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Summary", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.text(`Total items: ${fees.length}  •  Paid: ${paidCount}  •  Due/Overdue: ${dueCount}`, margin, y);
  y += 6;
  doc.text(`Amount still due: € ${totalDue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin, y);

  doc.save(fileName);
}
