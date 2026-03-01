import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#134e4a] mb-8"
          >
            <i className="las la-arrow-left" aria-hidden />
            Back to home
          </Link>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-gray-500 mt-2">
            Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>

          <div className="prose prose-gray mt-12 space-y-10">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-600 leading-relaxed">
                Riviola (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our construction and investment management platform and related services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">2. Information we collect</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We may collect information that you provide directly (e.g. name, email, company details, payment information) and information collected automatically (e.g. device data, logs, cookies). We use this to operate the platform, process payments, and improve our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">3. How we use your information</h2>
              <p className="text-gray-600 leading-relaxed">
                We use the information we collect to provide, maintain, and improve our services; to communicate with you; to process transactions; and to comply with legal obligations. We do not sell your personal data to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">4. Data retention and security</h2>
              <p className="text-gray-600 leading-relaxed">
                We retain your data only as long as necessary for the purposes described in this policy or as required by law. We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">5. Your rights</h2>
              <p className="text-gray-600 leading-relaxed">
                Depending on your location, you may have the right to access, correct, delete, or port your personal data, and to object to or restrict certain processing. You may also have the right to lodge a complaint with a supervisory authority. To exercise these rights, contact us at the details provided below.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">6. Contact</h2>
              <p className="text-gray-600 leading-relaxed">
                For questions about this Privacy Policy or our data practices, please contact us at privacy@riviola.com or at the address indicated on our website.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
