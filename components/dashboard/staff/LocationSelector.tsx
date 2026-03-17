"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type LocationSelectorProps = {
    selectedCountry: string;
    selectedCity: string;
    onCountryChange: (country: string) => void;
    onCityChange: (city: string) => void;
};

export function LocationSelector({
    selectedCountry,
    selectedCity,
    onCountryChange,
    onCityChange,
}: LocationSelectorProps) {
    const t = useTranslations("EditBuilding");
    const [countries, setCountries] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);

    // Fetch all countries on mount
    useEffect(() => {
        async function fetchCountries() {
            setLoadingCountries(true);
            try {
                const res = await fetch("https://countriesnow.space/api/v0.1/countries/positions");
                const data = await res.json();
                if (!data.error) {
                    const names = data.data.map((c: any) => c.name).sort();
                    setCountries(names);
                }
            } catch (err) {
                console.error("Failed to fetch countries", err);
            } finally {
                setLoadingCountries(false);
            }
        }
        fetchCountries();
    }, []);

    // Fetch cities when country changes
    useEffect(() => {
        if (!selectedCountry) {
            setCities([]);
            return;
        }

        async function fetchCities() {
            setLoadingCities(true);
            try {
                const res = await fetch("https://countriesnow.space/api/v0.1/countries/cities", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ country: selectedCountry }),
                });
                const data = await res.json();
                if (!data.error) {
                    setCities(data.data.sort());
                } else {
                    setCities([]);
                }
            } catch (err) {
                console.error("Failed to fetch cities", err);
                setCities([]);
            } finally {
                setLoadingCities(false);
            }
        }
        fetchCities();
    }, [selectedCountry]);

    const inputClass =
        "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none transition-colors bg-white disabled:bg-gray-50 disabled:cursor-not-allowed";
    const labelClass = "block text-sm font-semibold text-gray-700 mb-1";

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="country-select" className={labelClass}>
                    {t("form.countryLabel")}
                </label>
                <select
                    id="country-select"
                    value={selectedCountry}
                    onChange={(e) => {
                        onCountryChange(e.target.value);
                        onCityChange(""); // Reset city when country changes
                    }}
                    disabled={loadingCountries}
                    className={inputClass}
                >
                    <option value="">{t("form.countryPlaceholder")}</option>
                    {countries.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="city-select" className={labelClass}>
                    {t("form.cityLabel")}
                </label>
                <select
                    id="city-select"
                    value={selectedCity}
                    onChange={(e) => onCityChange(e.target.value)}
                    disabled={loadingCities || !selectedCountry}
                    className={inputClass}
                >
                    <option value="">{loadingCities ? t("form.loadingCities") : t("form.cityPlaceholder")}</option>
                    {cities.map((city) => (
                        <option key={city} value={city}>
                            {city}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
