export type ProfileRole = "investor" | "staff" | "admin";

/** For role=investor only: renter (no financials) or buyer (sees financials). */
export type InvestorType = "renter" | "buyer";

export type Company = {
  id: string;
  name: string;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  company_id: string | null;
  role: ProfileRole;
  investor_type: InvestorType | null;
  language: string | null;
  currency: string | null;
  notify_payments: boolean | null;
  notify_milestones: boolean | null;
  notify_documents: boolean | null;
  created_at: string;
  updated_at: string;
};

export type ProfileUpdate = Partial<Omit<Profile, "id" | "created_at" | "updated_at">>;

export type BuildingStatus =
  | "Planned"
  | "In progress"
  | "At risk"
  | "On hold"
  | "Completed"
  | "Cancelled";

export type PlannedMilestoneDb = {
  id: string;
  title: string;
  dateTimeLocal: string;
};

export type Building = {
  id: string;
  company_id: string;
  name: string;
  location: string | null;
  status: BuildingStatus;
  progress: number;
  units: number;
  floors: number;
  image_url: string | null;
  next_milestone: string | null;
  blocks: string[];
  planned_milestones: PlannedMilestoneDb[];
  next_milestone_id: string | null;
  current_milestone_id: string | null;
  created_at: string;
  updated_at: string;
};

export type BuildingInsert = Omit<Building, "id" | "created_at" | "updated_at">;

export type BuildingUpdate = Partial<Omit<Building, "id" | "company_id" | "created_at" | "updated_at">>;

export type BuildingWeeklyUpdate = {
  id: string;
  building_id: string;
  week_label: string | null;
  date_range: string;
  description: string;
  blocks: string[];
  created_at: string;
  updated_at: string;
};

export type BuildingWeeklyUpdateInsert = Omit<
  BuildingWeeklyUpdate,
  "id" | "created_at" | "updated_at"
>;

export type BuildingWeeklyUpdateImage = {
  id: string;
  building_weekly_update_id: string;
  storage_path: string;
  alt: string | null;
  sort_order: number;
};

export type BuildingWeeklyUpdateImageInsert = Omit<
  BuildingWeeklyUpdateImage,
  "id"
>;

export type InvestorProperty = {
  id: string;
  profile_id: string;
  building_id: string;
  block: string;
  unit: string;
  area_m2: number | null;
  delivery_period: string | null;
  purchase_value: number | null;
  purchase_currency: string | null;
  created_at: string;
  updated_at: string;
};

export type InvestorPropertyInsert = Omit<
  InvestorProperty,
  "id" | "created_at" | "updated_at"
>;

export type InvestorRequestRow = {
  id: string;
  profile_id: string;
  building_id: string;
  type: string;
  status: string;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type InvestorRequestInsert = Omit<
  InvestorRequestRow,
  "id" | "created_at" | "updated_at"
> & { status?: string };

export type BuildingDuesSettingsRow = {
  building_id: string;
  payment_window_start_day: number;
  payment_window_end_day: number;
  amount_cents: number | null;
  currency: string | null;
  updated_at: string;
};

export type BuildingDuesSettingsInsert = Omit<
  BuildingDuesSettingsRow,
  "updated_at"
> & { updated_at?: string };

export type DuesPaymentRow = {
  id: string;
  investor_property_id: string;
  period: string;
  payment_number: string;
  paid_at: string | null;
  marked_by: string | null;
  created_at: string;
};

export type DuesPaymentInsert = Omit<DuesPaymentRow, "id" | "created_at" | "payment_number"> & {
  id?: string;
  created_at?: string;
  /** Set by DB trigger if omitted */
  payment_number?: string;
};

export type PurchaseInstallment = {
  id: string;
  investor_property_id: string;
  sequence: number;
  label: string;
  amount: number;
  currency: string;
  due_date: string | null;
  paid_at: string | null;
  marked_by: string | null;
  receipt_document_url: string | null;
  created_at: string;
  updated_at: string;
};

export type PurchaseInstallmentInsert = Omit<
  PurchaseInstallment,
  "id" | "created_at" | "updated_at"
> & { id?: string; created_at?: string; updated_at?: string };

export type OnboardingSubmission = {
  id: string;
  full_name: string;
  company_name: string;
  location: string;
  email: string;
  use_cases: string[];
  demo_date: string | null;
  demo_time: string | null;
  demo_timezone: string | null;
  created_at: string;
};

export type OnboardingSubmissionInsert = Omit<OnboardingSubmission, "id" | "created_at">;
