"use client";

import { useState } from "react";
import Link from "next/link";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors";
const labelClass = "block text-sm font-semibold text-gray-700 mb-1";

export default function NewBuildingPage() {
  const [blocks, setBlocks] = useState<string[]>(["Block A"]);
  const [newBlockName, setNewBlockName] = useState("");

  function addBlock() {
    const name = newBlockName.trim() || `Block ${String.fromCharCode(65 + blocks.length)}`;
    if (!blocks.includes(name)) {
      setBlocks((prev) => [...prev, name]);
      setNewBlockName("");
    }
  }

  function removeBlock(index: number) {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  }

  function updateBlock(index: number, value: string) {
    setBlocks((prev) => prev.map((b, i) => (i === index ? value : b)));
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <Link
        href="/dashboard/staff"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#134e4a] mb-6"
      >
        <i className="las la-arrow-left" aria-hidden />
        Back to overview
      </Link>
      <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
        Add building
      </h1>
      <p className="text-gray-500 mt-1 mb-8">
        Create a new project or building record. Set block names, floors and units so investors can be assigned to specific units.
      </p>
      <form
        className="space-y-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <label htmlFor="name" className={labelClass}>
            Building / project name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="e.g. Avala Resort"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="location" className={labelClass}>
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder="e.g. Adriatic Coast, Montenegro"
            className={inputClass}
          />
        </div>

        <hr className="border-gray-200" />

        <div>
          <span className={labelClass}>Block names</span>
          <p className="text-xs text-gray-500 mb-2">
            Define the blocks or towers in this project (e.g. Block A, Tower East). These will be used when assigning investors to a unit.
          </p>
          <ul className="space-y-2 mb-2">
            {blocks.map((block, index) => (
              <li
                key={index}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  name={`block-${index}`}
                  value={block}
                  onChange={(e) => updateBlock(index, e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Block A"
                />
                <button
                  type="button"
                  onClick={() => removeBlock(index)}
                  disabled={blocks.length <= 1}
                  className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  aria-label="Remove block"
                >
                  <i className="las la-times text-lg" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input
              type="text"
              value={newBlockName}
              onChange={(e) => setNewBlockName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addBlock())}
              placeholder="New block name"
              className={inputClass}
            />
            <button
              type="button"
              onClick={addBlock}
              className="shrink-0 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Add block
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="floors" className={labelClass}>
              Number of floors
            </label>
            <input
              id="floors"
              name="floors"
              type="number"
              min={1}
              max={99}
              placeholder="e.g. 8"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="units" className={labelClass}>
              Number of units
            </label>
            <input
              id="units"
              name="units"
              type="number"
              min={1}
              placeholder="e.g. 24"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#134e4a] text-white font-semibold hover:bg-[#115e59] transition-colors"
          >
            Add building
          </button>
          <Link
            href="/dashboard/staff"
            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
