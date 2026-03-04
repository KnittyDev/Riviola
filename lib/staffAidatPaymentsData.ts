export type AidatPaymentStatus = "Paid" | "Pending" | "Failed" | "Refunded";

export type AidatPayment = {
  id: string;
  buildingId: string;
  buildingName: string;
  unitLabel: string;
  investorName: string;
  investorEmail: string;
  period: string; // e.g. "Mar 2025"
  amount: string; // display string
  currency: "EUR";
  status: AidatPaymentStatus;
  paidAt: string; // ISO timestamp
  method: "Card" | "Bank transfer";
  reference: string;
};

export const aidatPayments: AidatPayment[] = [
  {
    id: "p_001",
    buildingId: "1",
    buildingName: "Avala Resort",
    unitLabel: "Block A · Unit 12",
    investorName: "Maria Chen",
    investorEmail: "maria.chen@example.com",
    period: "Mar 2025",
    amount: "€ 45",
    currency: "EUR",
    status: "Paid",
    paidAt: "2026-02-28T18:12:00Z",
    method: "Card",
    reference: "DUES-AR-0325-0012",
  },
  {
    id: "p_002",
    buildingId: "2",
    buildingName: "Skyline Plaza",
    unitLabel: "Tower East · Unit 7",
    investorName: "Alex Sterling",
    investorEmail: "alex.sterling@example.com",
    period: "Mar 2025",
    amount: "€ 75",
    currency: "EUR",
    status: "Paid",
    paidAt: "2026-02-28T11:02:00Z",
    method: "Bank transfer",
    reference: "DUES-SP-0325-0007",
  },
  {
    id: "p_003",
    buildingId: "1",
    buildingName: "Avala Resort",
    unitLabel: "Block B · Unit 4",
    investorName: "Sophie Laurent",
    investorEmail: "sophie.laurent@example.com",
    period: "Feb 2025",
    amount: "€ 15",
    currency: "EUR",
    status: "Refunded",
    paidAt: "2026-02-15T09:41:00Z",
    method: "Card",
    reference: "DUES-AR-0225-0004",
  },
  {
    id: "p_004",
    buildingId: "3",
    buildingName: "Villa Serenity",
    unitLabel: "Villa 2",
    investorName: "James Wright",
    investorEmail: "james.wright@example.com",
    period: "Mar 2025",
    amount: "€ 45",
    currency: "EUR",
    status: "Failed",
    paidAt: "2026-02-14T16:20:00Z",
    method: "Card",
    reference: "DUES-VS-0325-0002",
  },
  {
    id: "p_005",
    buildingId: "2",
    buildingName: "Skyline Plaza",
    unitLabel: "Tower West · Unit 2",
    investorName: "Maria Chen",
    investorEmail: "maria.chen@example.com",
    period: "Jan 2025",
    amount: "€ 75",
    currency: "EUR",
    status: "Paid",
    paidAt: "2026-01-30T08:10:00Z",
    method: "Card",
    reference: "DUES-SP-0125-0002",
  },
];

