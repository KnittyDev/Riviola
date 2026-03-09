"use client";

import { useEffect, useState } from "react";

type WeatherData = {
    temp: number;
    label: string;
    icon: string;
};

const weatherIconMap: Record<number, { icon: string; label: string }> = {
    0: { icon: "la-sun", label: "Clear sky" },
    1: { icon: "la-cloud-sun", label: "Mainly clear" },
    2: { icon: "la-cloud-sun", label: "Partly cloudy" },
    3: { icon: "la-cloud", label: "Overcast" },
    45: { icon: "la-smog", label: "Fog" },
    48: { icon: "la-smog", label: "Fog" },
    51: { icon: "la-cloud-rain", label: "Light drizzle" },
    53: { icon: "la-cloud-rain", label: "Moderate drizzle" },
    55: { icon: "la-cloud-rain", label: "Dense drizzle" },
    61: { icon: "la-cloud-showers-heavy", label: "Slight rain" },
    63: { icon: "la-cloud-showers-heavy", label: "Moderate rain" },
    65: { icon: "la-cloud-showers-heavy", label: "Heavy rain" },
    71: { icon: "la-snowflake", label: "Slight snow" },
    73: { icon: "la-snowflake", label: "Moderate snow" },
    75: { icon: "la-snowflake", label: "Heavy snow" },
    95: { icon: "la-bolt", label: "Thunderstorm" },
};

export function WeatherWidget({
    city,
    country,
    mode = "dark",
}: {
    city?: string;
    country?: string;
    mode?: "light" | "dark";
}) {
    const [data, setData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!city) return;

        async function fetchWeather(targetCity: string) {
            setLoading(true);
            try {
                // Step 1: Geocoding
                const geoRes = await fetch(
                    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
                        targetCity
                    )}&count=1&language=en&format=json`
                );
                const geoData = await geoRes.json();

                if (geoData.results && geoData.results.length > 0) {
                    const { latitude, longitude } = geoData.results[0];

                    // Step 2: Weather
                    const weatherRes = await fetch(
                        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
                    );
                    const weatherData = await weatherRes.json();

                    const current = weatherData.current_weather;
                    const mapped = weatherIconMap[current.weathercode] || {
                        icon: "la-cloud",
                        label: "Cloudy",
                    };

                    setData({
                        temp: Math.round(current.temperature),
                        label: mapped.label,
                        icon: mapped.icon,
                    });
                }
            } catch (err) {
                console.error("Weather fetch failed", err);
            } finally {
                setLoading(false);
            }
        }

        fetchWeather(city);
    }, [city, country]);

    if (!city || (!data && !loading)) return null;

    const isLight = mode === "light";

    return (
        <div
            className={`flex items-center gap-3 border rounded-2xl px-4 py-2 mt-4 inline-flex animate-fade-in shadow-lg transition-all duration-300 ${isLight ? "bg-gray-50 border-gray-200" : "bg-white/10 backdrop-blur-md border-white/20"
                }`}
        >
            <div
                className={`size-10 rounded-xl flex items-center justify-center ${isLight ? "bg-white border border-gray-100 shadow-sm" : "bg-white/20"
                    }`}
            >
                {loading ? (
                    <i className={`las la-spinner animate-spin ${isLight ? "text-[#134e4a]" : "text-white"}`} />
                ) : (
                    <i
                        className={`las ${data?.icon || "la-cloud"} text-2xl ${isLight ? "text-[#134e4a]" : "text-white"
                            }`}
                    />
                )}
            </div>
            <div>
                <p
                    className={`text-[10px] font-bold uppercase tracking-widest leading-none mb-1 ${isLight ? "text-gray-400" : "text-white/70"
                        }`}
                >
                    {city} Weather
                </p>
                <p className={`font-black text-lg leading-none ${isLight ? "text-gray-900" : "text-white"}`}>
                    {loading ? "..." : `${data?.temp ?? "--"}°C`}
                    {!loading && (
                        <span
                            className={`text-xs font-bold ml-2 uppercase ${isLight ? "text-gray-500" : "text-white/60"
                                }`}
                        >
                            {data?.label}
                        </span>
                    )}
                </p>
            </div>
        </div>
    );
}
