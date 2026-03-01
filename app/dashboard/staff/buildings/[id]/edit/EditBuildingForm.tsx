"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
  defaultName: string;
  defaultLocation: string;
  defaultUnits: number;
  defaultStatus: "In progress" | "Completed";
  defaultProgress: number;
  defaultNextMilestone: string;
};

export function EditBuildingForm({
  id,
  defaultName,
  defaultLocation,
  defaultUnits,
  defaultStatus,
  defaultProgress,
  defaultNextMilestone,
}: Props) {
  const router = useRouter();

  return (
    <form
      className="space-y-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
      onSubmit={(e) => {
        e.preventDefault();
        // In a real app: submit to API, then redirect
        router.push(`/dashboard/staff/buildings/${id}`);
      }}
    >
      <input type="hidden" name="id" value={id} />
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
          Building / project name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={defaultName}
          placeholder="e.g. Avala Resort"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors"
        />
      </div>
      <div>
        <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-1">
          Location
        </label>
        <input
          id="location"
          name="location"
          type="text"
          defaultValue={defaultLocation}
          placeholder="e.g. Adriatic Coast, Montenegro"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors"
        />
      </div>
      <div>
        <label htmlFor="units" className="block text-sm font-semibold text-gray-700 mb-1">
          Number of units
        </label>
        <input
          id="units"
          name="units"
          type="number"
          min={1}
          defaultValue={defaultUnits}
          placeholder="e.g. 24"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors"
        />
      </div>
      <div>
        <span className="block text-sm font-semibold text-gray-700 mb-2">Status</span>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="status"
              value="In progress"
              defaultChecked={defaultStatus === "In progress"}
              className="rounded-full border-gray-300 text-[#134e4a] focus:ring-[#134e4a]"
            />
            <span className="text-sm font-medium text-gray-700">In progress</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="status"
              value="Completed"
              defaultChecked={defaultStatus === "Completed"}
              className="rounded-full border-gray-300 text-[#134e4a] focus:ring-[#134e4a]"
            />
            <span className="text-sm font-medium text-gray-700">Completed</span>
          </label>
        </div>
      </div>
      <div>
        <label htmlFor="progress" className="block text-sm font-semibold text-gray-700 mb-1">
          Progress (%)
        </label>
        <input
          id="progress"
          name="progress"
          type="number"
          min={0}
          max={100}
          defaultValue={defaultProgress}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors"
        />
      </div>
      <div>
        <label htmlFor="nextMilestone" className="block text-sm font-semibold text-gray-700 mb-1">
          Next milestone
        </label>
        <input
          id="nextMilestone"
          name="nextMilestone"
          type="text"
          defaultValue={defaultNextMilestone}
          placeholder="e.g. Final exterior painting – Oct 15, 2024"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-[#134e4a] text-white font-semibold hover:bg-[#115e59] transition-colors"
        >
          Save changes
        </button>
        <Link
          href={`/dashboard/staff/buildings/${id}`}
          className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
