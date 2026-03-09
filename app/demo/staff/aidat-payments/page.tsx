import { staffBuildings } from "@/lib/staffBuildingsData";
import { demoInvestors } from "@/lib/demoInvestorsData";
import { DuesPaymentsClient } from "@/app/dashboard/staff/aidat-payments/DuesPaymentsClient";
import {
    setBuildingDuesSettingsAction,
    markDuesPaidAction,
    unmarkDuesPaidAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function StaffAidatPaymentsPage({
    searchParams,
}: {
    searchParams: Promise<{ building?: string; period?: string }>;
}) {
    const { building: paramBuilding } = await searchParams;

    const buildings = staffBuildings.map((b) => ({ id: b.id, name: b.name }));
    const selectedBuildingId =
        paramBuilding && buildings.some((b) => b.id === paramBuilding)
            ? paramBuilding
            : buildings[0]?.id ?? "";

    // Static periods: Last 6 months + Current Month
    const now = new Date();
    const periods: string[] = [];
    for (let i = -5; i <= 0; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        periods.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }

    // Filter units for the selected building from our demo investors
    const units = demoInvestors
        .filter((inv) => inv.building_id === selectedBuildingId)
        .map((inv) => ({
            id: inv.id,
            block: inv.block,
            unit: inv.unit,
            profile_id: inv.profile_id,
            full_name: inv.full_name,
        }));

    // Dummy settings
    const settings = {
        payment_window_start_day: 5,
        payment_window_end_day: 15,
        amount_cents: 45000, // 450.00 EUR
        currency: "EUR",
    };

    // Generate some random "paid" statuses to make it look real
    const paidByPeriod: Record<string, Record<string, { paid_at: string | null; marked_by: string | null }>> = {};
    periods.forEach((p) => {
        paidByPeriod[p] = {};
        units.forEach((u) => {
            // Randomly mark ~70% as paid for past months, less for the current month
            const isCurrentMonth = p === periods[periods.length - 1];
            const probability = isCurrentMonth ? 0.3 : 0.85;

            if (Math.random() < probability) {
                paidByPeriod[p][u.id] = {
                    paid_at: new Date().toISOString(),
                    marked_by: "system-demo",
                };
            }
        });
    });

    return (
        <DuesPaymentsClient
            buildings={buildings}
            selectedBuildingId={selectedBuildingId}
            periods={periods}
            settings={settings}
            units={units}
            paidByPeriod={paidByPeriod}
            setSettingsFn={setBuildingDuesSettingsAction}
            markDuesPaidFn={markDuesPaidAction}
            unmarkDuesPaidFn={unmarkDuesPaidAction}
        />
    );
}
