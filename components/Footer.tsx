import Link from "next/link";
import Image from "next/image";

const productLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/demo", label: "View Demo" },
  { href: "/onboarding", label: "Get Started" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/cookies", label: "Cookie Policy" },
];

const accountLinks = [
  { href: "/login", label: "Sign In" },
  { href: "/#cta", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="bg-[#f9fafb] py-16 lg:py-20 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-14">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 mb-5">
              <Image
                src="/logo.png"
                alt="Riviola"
                width={36}
                height={36}
                className="size-9 rounded-xl object-contain shrink-0"
              />
              <span className="text-lg font-extrabold tracking-tight text-[#134e4a]">
                Riviola
              </span>
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed max-w-xs">
              High-end construction management for modern investors. Track every
              beam, budget, and breakthrough in real-time.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-5">
              Product
            </h4>
            <ul className="space-y-3 text-sm text-gray-600">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-[#134e4a] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-5">
              Legal
            </h4>
            <ul className="space-y-3 text-sm text-gray-600">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-[#134e4a] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-5">
              Account
            </h4>
            <ul className="space-y-3 text-sm text-gray-600">
              {accountLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-[#134e4a] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-gray-200 gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Riviola. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-[#134e4a] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[#134e4a] transition-colors">
              Terms
            </Link>
            <Link href="/cookies" className="hover:text-[#134e4a] transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
