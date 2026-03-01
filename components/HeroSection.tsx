import Image from "next/image";

export function HeroSection() {
  return (
    <section
      className="relative min-h-screen pt-32 pb-20 flex items-center overflow-hidden"
      style={{
        background: "linear-gradient(to right, #ffffff 0%, #ffffff 20%, #fcfcfd 40%, #fafafa 60%, #f9fafb 85%, #f9fafb 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-800 text-xs font-bold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
            </span>
            NEXT-GEN INFRASTRUCTURE MANAGEMENT
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-8">
            Architecture of{" "}
            <span className="text-[#134e4a] font-semibold">Excellence</span> and
            Transparency.
          </h1>
          <p className="text-xl text-gray-600 font-medium leading-relaxed max-w-lg mb-10">
            High-end construction management for modern investors. Track every
            beam, budget, and breakthrough in real-time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              className="h-14 px-8 rounded-2xl bg-[#134e4a] text-white font-bold text-lg flex items-center justify-center gap-2 group hover:bg-[#115e59] hover:gap-4 transition-all"
            >
              Launch Project <i className="las la-arrow-right text-xl" aria-hidden />
            </button>
            <button
              type="button"
              className="h-14 px-8 rounded-2xl bg-gray-100 text-gray-900 font-bold text-lg hover:bg-gray-200 transition-all"
            >
              View Demo
            </button>
          </div>
        </div>
        <div className="lg:col-span-6 relative h-[600px]">
          <div className="absolute top-0 right-0 w-4/5 h-4/5 rounded-[40px] overflow-hidden shadow-2xl z-0">
            <Image
              alt="Modern Architecture"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDn_iOh2DjEMK9dKM-QOdcdFusIiJkXlBnbVQo4hAlnycfkYzhLmuHL9iLf5Ri_inzA7NRQyBuaqrvS6D_H37bsNy3d0Wh_452-Iz1ewULYEyhtV5tl6ypQOUHtqPMmazK4psNBhzJxcnXbxYnPoemLTmRX6hskKDzAZE8vXJ0dR9ZNjZ3JLQrSFm3tD2e1k3Pnc34Y_M7Rrvti-hihibvIIHKQh7WgutS_tnbMug-uiruq9Ynlv1Zv5aJ9wUYs2YB9N6qyVh6QBLy1"
              width={800}
              height={600}
              priority
            />
          </div>
          <div className="absolute bottom-10 left-0 glass-card p-6 rounded-3xl w-64 z-20 group hover:-translate-y-2 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="size-10 rounded-lg bg-[#134e4a]/20 flex items-center justify-center">
                <i className="las la-chart-line text-[#134e4a] text-xl" aria-hidden />
              </div>
              <span className="text-gray-200 text-xs font-bold">+12.5%</span>
            </div>
            <p className="text-gray-600 text-xs font-bold uppercase tracking-widest mb-1">
              Managed Value
            </p>
            <p className="text-gray-900 text-3xl font-extrabold">878M€</p>
          </div>
          <div className="absolute top-20 -left-10 glass-card p-6 rounded-3xl w-56 z-20 hidden md:block group hover:-translate-y-2 transition-transform">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex -space-x-2">
                <div className="size-8 rounded-full border-2 border-gray-200 bg-gray-200" />
                <div className="size-8 rounded-full border-2 border-gray-200 bg-gray-300" />
                <div className="size-8 rounded-full border-2 border-gray-200 bg-gray-400" />
              </div>
            </div>
            <p className="text-gray-600 text-xs font-bold uppercase tracking-widest mb-1">
              Active Projects
            </p>
            <p className="text-gray-900 text-2xl font-extrabold">250+</p>
            <div className="mt-3 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 w-3/4" />
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 size-64 bg-[#134e4a] rounded-full blur-[100px] opacity-20 -z-10" />
        </div>
      </div>
    </section>
  );
}
