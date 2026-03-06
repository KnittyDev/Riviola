"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getStaffCompanyId } from "@/lib/buildings";

export type CreateInvestorResult = { ok: true; userId: string } | { ok: false; error: string };

export type CreateInvestorInput = {
  fullName: string;
  email: string;
  password: string;
  buildingId: string;
  block: string;
  unit: string;
  areaM2: number | null;
  deliveryPeriod: string | null;
  purchaseValue: number | null;
  purchaseCurrency: string | null;
};

export async function createInvestorAction(
  input: CreateInvestorInput
): Promise<CreateInvestorResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum açmanız gerekiyor." };

  const companyId = await getStaffCompanyId(supabase);
  if (!companyId) return { ok: false, error: "Yetkiniz yok veya şirket bulunamadı." };

  const fullName = (input.fullName ?? "").trim();
  const email = (input.email ?? "").trim().toLowerCase();
  const password = (input.password ?? "").trim();
  if (!fullName) return { ok: false, error: "Ad soyad gerekli." };
  if (!email) return { ok: false, error: "E-posta gerekli." };
  if (!password || password.length < 8)
    return { ok: false, error: "Şifre en az 8 karakter olmalı." };
  if (!input.buildingId) return { ok: false, error: "Proje seçin." };
  if (!(input.block ?? "").trim()) return { ok: false, error: "Blok seçin." };
  if (!(input.unit ?? "").trim()) return { ok: false, error: "Ünite girin." };

  const { data: building } = await supabase
    .from("buildings")
    .select("id, company_id")
    .eq("id", input.buildingId)
    .single();
  if (!building || (building as { company_id: string }).company_id !== companyId)
    return { ok: false, error: "Seçilen proje şirketinize ait değil." };

  const service = createServiceRoleClient();
  const {
    data: newUser,
    error: createError,
  } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError) {
    const msg = createError.message;
    if (msg.includes("already been registered") || msg.includes("already exists"))
      return { ok: false, error: "Bu e-posta adresi zaten kayıtlı." };
    return { ok: false, error: msg || "Hesap oluşturulamadı." };
  }
  if (!newUser.user) return { ok: false, error: "Hesap oluşturulamadı." };

  const profileId = newUser.user.id;
  const phoneTrimmed = (input.phone ?? "").trim() || null;
  await service.from("profiles").update({ phone: phoneTrimmed, full_name: fullName }).eq("id", profileId);

  const { error: insertError } = await supabase.from("investor_properties").insert({
    profile_id: profileId,
    building_id: input.buildingId,
    block: (input.block ?? "").trim(),
    unit: (input.unit ?? "").trim(),
    area_m2: input.areaM2 != null && input.areaM2 >= 0 ? input.areaM2 : null,
    delivery_period: (input.deliveryPeriod ?? "").trim() || null,
    purchase_value: input.purchaseValue != null && input.purchaseValue >= 0 ? input.purchaseValue : null,
    purchase_currency: (input.purchaseCurrency ?? "").trim() || null,
  });

  if (insertError) {
    return {
      ok: false,
      error: "Hesap oluştu ama ünite ataması yapılamadı: " + insertError.message,
    };
  }

  return { ok: true, userId: profileId };
}

export type UpdateInvestorResult = { ok: true } | { ok: false; error: string };

export type UpdateInvestorInput = {
  profileId: string;
  investorPropertyId: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  block: string;
  unit: string;
  areaM2: number | null;
  deliveryPeriod: string | null;
  purchaseValue: number | null;
  purchaseCurrency: string | null;
};

export async function updateInvestorAction(
  input: UpdateInvestorInput
): Promise<UpdateInvestorResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum açmanız gerekiyor." };

  const companyId = await getStaffCompanyId(supabase);
  if (!companyId) return { ok: false, error: "Yetkiniz yok veya şirket bulunamadı." };

  const { data: prop } = await supabase
    .from("investor_properties")
    .select("building_id")
    .eq("id", input.investorPropertyId)
    .single();
  if (!prop) return { ok: false, error: "Ünite kaydı bulunamadı." };

  const { data: building } = await supabase
    .from("buildings")
    .select("company_id")
    .eq("id", (prop as { building_id: string }).building_id)
    .single();
  if (!building || (building as { company_id: string }).company_id !== companyId)
    return { ok: false, error: "Bu kayıt şirketinize ait değil." };

  const service = createServiceRoleClient();
  await service.from("profiles").update({
    full_name: (input.fullName ?? "").trim() || null,
    email: (input.email ?? "").trim().toLowerCase() || null,
    phone: (input.phone ?? "").trim() || null,
  }).eq("id", input.profileId);

  const { error: updateError } = await supabase
    .from("investor_properties")
    .update({
      block: (input.block ?? "").trim(),
      unit: (input.unit ?? "").trim(),
      area_m2: input.areaM2 != null && input.areaM2 >= 0 ? input.areaM2 : null,
      delivery_period: (input.deliveryPeriod ?? "").trim() || null,
      purchase_value: input.purchaseValue != null && input.purchaseValue >= 0 ? input.purchaseValue : null,
      purchase_currency: (input.purchaseCurrency ?? "").trim() || null,
    })
    .eq("id", input.investorPropertyId);

  if (updateError) return { ok: false, error: updateError.message };
  return { ok: true };
}
