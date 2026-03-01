import Link from "next/link";

const platformLinks = [
  { href: "#", label: "Live Streaming" },
  { href: "#", label: "Financial Control" },
  { href: "#", label: "Security Architecture" },
  { href: "#", label: "API Documentation" },
];

const companyLinks = [
  { href: "#", label: "Our Vision" },
  { href: "#", label: "Careers" },
  { href: "#", label: "Press Room" },
  { href: "#", label: "ESG Commitment" },
];

const supportLinks = [
  { href: "#", label: "Knowledge Base" },
  { href: "#", label: "24/7 Concierge" },
  { href: "#", label: "Status Dashboard" },
];

export function Footer() {
  return (
    <footer className="bg-[#f9fafb] py-20 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="size-8 flex items-center justify-center rounded-lg bg-[#134e4a] text-white">
                <i className="las la-building text-xl" aria-hidden />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-[#134e4a]">
                Riviola
              </span>
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed">
              Redefining institutional construction management through radical
              transparency and data-driven insights.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-gray-600">
              {platformLinks.map((link) => (
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
            <h4 className="font-bold text-gray-900 mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-gray-600">
              {companyLinks.map((link) => (
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
            <h4 className="font-bold text-gray-900 mb-6">Support</h4>
            <ul className="space-y-4 text-sm text-gray-600">
              {supportLinks.map((link) => (
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
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200 gap-4">
          <p className="text-gray-400 text-xs">
            © {new Date().getFullYear()} Riviola. All rights reserved.
          </p>
          <div className="flex gap-8 text-xs font-bold text-gray-400">
            <Link
              href="/privacy"
              className="hover:text-[#134e4a] transition-colors uppercase tracking-widest"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-[#134e4a] transition-colors uppercase tracking-widest"
            >
              Terms
            </Link>
            <Link
              href="/cookies"
              className="hover:text-[#134e4a] transition-colors uppercase tracking-widest"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
