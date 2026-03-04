import Link from "next/link";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#cta", label: "Contact" },
];

export function Header() {
  return (
    <header className="fixed top-0 z-[100] w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-10 flex items-center justify-center rounded-xl bg-[#134e4a] text-white">
            <i className="las la-building text-2xl" aria-hidden />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-[#134e4a]">
            Riviola
            <span className="text-gray-400 font-light"></span>
          </span>
        </Link>
        <nav className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-gray-600 hover:text-[#134e4a] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-5 py-2.5 text-sm font-bold text-gray-900 hover:text-[#134e4a] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/onboarding"
            className="px-6 py-2.5 bg-[#134e4a] text-white rounded-full text-sm font-bold shadow-lg shadow-[#134e4a]/20 hover:bg-[#115e59] hover:scale-105 transition-all"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
