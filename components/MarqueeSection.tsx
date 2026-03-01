const LOGOS = [
  "LUMINA GROUP",
  "APEX ASSETS",
  "TERRAFORM INC",
  "HORIZON BILD",
  "NOVA STRUCTURES",
  "CORE INVEST",
];

export function MarqueeSection() {
  const duplicated = [...LOGOS, ...LOGOS];

  return (
    <section className="py-12 border-y border-gray-200 overflow-hidden bg-white">
      <p className="text-center text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase mb-10">
        Trusted by Global Leaders in Infrastructure
      </p>
      <div className="relative flex overflow-hidden">
        <div className="marquee-content gap-20 items-center px-10">
          {duplicated.map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="text-2xl font-black text-gray-300 tracking-tighter grayscale opacity-50 whitespace-nowrap"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
