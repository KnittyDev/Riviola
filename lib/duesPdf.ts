import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import type { InvestorDuesFeeItem, CompanyForInvoice } from "@/lib/investorDues";

const SUPPORT_EMAIL = "support@riviola.net";
const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;

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

/** Load image from URL and return as base64 data URL for jsPDF */
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

/** Generate QR code as data URL (PNG) */
function generateQrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, { width: 200, margin: 1 });
}

/**
 * Generates a PDF of the investor's dues and triggers download.
 */
export async function downloadDuesPdf(
  fees: InvestorDuesFeeItem[],
  company: CompanyForInvoice | null = null
): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const margin = 14;
  let y = 14;
  const pageWidth = PAGE_WIDTH_MM;
  const pageHeight = PAGE_HEIGHT_MM;

  const headerHeight = 22;

  const logoLeft = margin - 2;
  if (company?.logo_url) {
    try {
      const logoData = await loadImageAsBase64(company.logo_url);
      const logoFormat = logoData.startsWith("data:image/png") ? "PNG" : "JPEG";
      const logoW = 12;
      const logoH = 12;
      doc.addImage(logoData, logoFormat, logoLeft, y, logoW, logoH);
    } catch {
      // skip logo on error
    }
  }

  try {
    const euFlagData = await loadImageAsBase64("/eu_flag.jpg");
    const imgW = 24;
    const imgH = 16;
    doc.addImage(euFlagData, "JPEG", pageWidth - margin - imgW, y, imgW, imgH);
  } catch {
    // skip EU flag on error
  }
  y += headerHeight;

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Dues & Fees Summary", logoLeft, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}`, margin, y);
  y += 12;

  let qrDataUrl: string | null = null;
  try {
    const appUrl = typeof window !== "undefined" ? window.location.origin : "https://riviola.net";
    qrDataUrl = await generateQrDataUrl(appUrl);
  } catch {
    // no QR on error
  }

  function drawPdfFooter(doc: jsPDF, qr: string | null) {
    const footerY = pageHeight - 28;
    if (qr) {
      const qrSize = 18;
      const qrX = (pageWidth - qrSize) / 2;
      doc.addImage(qr, "PNG", qrX, footerY, qrSize, qrSize);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("Scan the QR code using your phone to view your dues and payments.", pageWidth / 2, footerY + qrSize + 5, { align: "center" });
      doc.text("For support: " + SUPPORT_EMAIL, pageWidth / 2, footerY + qrSize + 9, { align: "center" });
      doc.setTextColor(0, 0, 0);
    }
  }

  if (fees.length === 0) {
    doc.setFontSize(11);
    doc.text("No dues recorded yet.", margin, y);
    drawPdfFooter(doc, qrDataUrl);
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
        pageHeight - 10
      );
      doc.setTextColor(0, 0, 0);
      drawPdfFooter(doc, qrDataUrl);
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
  y += 10;

  if (company) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(company.name || "Company", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(SUPPORT_EMAIL, margin, y);
    doc.setTextColor(0, 0, 0);
    y += 6;
    doc.setFontSize(9);
    doc.setTextColor(19, 78, 74);
    doc.text("The payment was successfully completed.", margin, y);
    doc.setTextColor(0, 0, 0);
  }

  doc.save(fileName);
}
