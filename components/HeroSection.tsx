import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-white">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[10%] w-[40%] h-[60%] bg-[#d1fae5] opacity-20 blur-[120px] rounded-full" />
        <div className="absolute top-[-5%] right-[10%] w-[35%] h-[50%] bg-[#eef2ff] opacity-25 blur-[100px] rounded-full" />
      </div>

      <div className="w-full flex flex-col items-center text-center overflow-hidden">
        {/* Badge */}
        <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-[#134e4a] text-[10px] font-black tracking-[0.2em] uppercase mb-10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
          </span>
          Next-Gen Infrastructure
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in-up delay-100 text-2xl md:text-4xl lg:text-[3.5vw] font-black text-gray-900 leading-[1.1] tracking-tight w-full max-w-[1500px] mx-auto mb-8 px-4">
          Architecture of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#134e4a] to-[#2dd4bf]">Excellence</span> <br className="hidden md:block" /> and Transparency.
        </h1>

        {/* Subtext Paragraph */}
        <p className="animate-fade-in-up delay-150 text-xl text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto mb-12 px-6">
          High-end construction management for modern investors. Track every beam, budget, and breakthrough in real-time.
        </p>

        {/* Action Buttons */}
        <div className="animate-fade-in-up delay-200 flex flex-col sm:flex-row gap-4 mb-12 px-6">
          <Link
            href="/onboarding"
            className="h-16 px-10 rounded-2xl bg-[#134e4a] text-white font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-[#134e4a]/20 hover:bg-[#115e59] hover:-translate-y-0.5 transition-all"
          >
            Launch Project <i className="las la-arrow-right" />
          </Link>
          <Link
            href="/demo"
            className="h-16 px-10 rounded-2xl bg-white border-2 border-gray-100 text-gray-900 font-bold text-lg hover:border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-all"
          >
            View Demo
          </Link>
        </div>

        {/* Hero Image Container - Capsule Shape with Floating Cards */}
        <div className="animate-fade-in-up delay-300 relative w-full max-w-5xl group px-6">
          <div className="absolute inset-0 bg-gradient-to-b from-[#134e4a]/10 to-transparent blur-3xl -z-10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

          <div className="relative overflow-hidden rounded-[4rem] md:rounded-[6rem] border-[12px] md:border-[20px] border-white shadow-2xl shadow-gray-200 aspect-[16/9]">
            <Image
              alt="Riviola Platform Preview"
              className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
              src="/hero.png"
              fill
              priority
            />
          </div>

          {/* Floating Data Overlay (Top Left) */}
          <div className="absolute -top-6 -left-2 md:-left-12 glass-card p-5 rounded-3xl w-48 hidden md:block border-white/40 shadow-xl animate-fade-in-up delay-500 hover:-translate-y-1 transition-transform">
            <div className="flex items-center gap-3 mb-2 text-left">
              <div className="flex -space-x-2">
                <div className="size-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                  <div className="w-full h-full bg-[#134e4a]/20 flex items-center justify-center"><i className="las la-user text-xs text-[#134e4a]" /></div>
                </div>
                <div className="size-8 rounded-full border-2 border-white bg-gray-300 overflow-hidden">
                  <div className="w-full h-full bg-[#2dd4bf]/20 flex items-center justify-center"><i className="las la-user text-xs text-[#134e4a]" /></div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#134e4a] uppercase tracking-wider">+48 NEW</span>
            </div>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest text-left">Active Projects</p>
            <p className="text-[#134e4a] text-2xl font-black text-left">250+</p>
          </div>

          {/* Floating Data Overlay (Bottom Right) */}
          <div className="absolute bottom-4 -right-2 md:-right-12 glass-card p-6 rounded-[32px] w-64 hidden md:block border-white/40 shadow-2xl animate-fade-in-up delay-700 hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between mb-3 text-left">
              <div className="size-12 rounded-2xl bg-[#134e4a]/10 flex items-center justify-center text-[#134e4a]">
                <i className="las la-wallet text-2xl" />
              </div>
              <span className="text-teal-600 text-xs font-bold">+12.5%</span>
            </div>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1 text-left">Managed Assets</p>
            <p className="text-[#134e4a] text-3xl font-black text-left">€4.2B</p>
          </div>
        </div>
      </div>
    </section>
  );
}
