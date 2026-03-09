"use server";

export type ActionResult = { ok?: boolean; error?: string };

/** Dummy actions for demo - they always return success without touching DB */
export async function setBuildingDuesSettingsAction(
    buildingId: string,
    input: any
): Promise<ActionResult> {
    return { ok: true };
}

export async function markDuesPaidAction(
    investorPropertyId: string,
    period: string
): Promise<ActionResult> {
    return { ok: true };
}

export async function unmarkDuesPaidAction(
    investorPropertyId: string,
    period: string
): Promise<ActionResult> {
    return { ok: true };
}
