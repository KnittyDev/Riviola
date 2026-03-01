import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-gray-500 mt-2">
            Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>

          <div className="prose prose-gray mt-12 space-y-10">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">1. Agreement to terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing or using Riviola&apos;s platform and services, you agree to be bound by these Terms of Service. If you do not agree, do not use our services. We may update these terms from time to time; continued use after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">2. Description of services</h2>
              <p className="text-gray-600 leading-relaxed">
                Riviola provides a construction and investment management platform for companies and investors. Services include project and building management, investor accounts, request handling, reporting, and related tools. We reserve the right to modify or discontinue features with reasonable notice where feasible.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">3. Accounts and eligibility</h2>
              <p className="text-gray-600 leading-relaxed">
                You must provide accurate information when creating an account and keep it updated. You are responsible for maintaining the confidentiality of your credentials and for all activity under your account. You must be at least 18 years old and have the authority to bind your organisation if registering on its behalf.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">4. Fees and payment</h2>
              <p className="text-gray-600 leading-relaxed">
                Subscription and usage fees are as set out in your plan or order. Fees are generally billed in advance (e.g. annually or monthly). Failure to pay may result in suspension or termination of access. All amounts are in the currency stated (e.g. EUR) and exclude applicable taxes unless otherwise indicated.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">5. Acceptable use</h2>
              <p className="text-gray-600 leading-relaxed">
                You agree not to use the services for any unlawful purpose or in a way that could harm Riviola, other users, or third parties. You must not attempt to gain unauthorised access to systems or data, distribute malware, or abuse the platform. We may suspend or terminate accounts that violate these terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">6. Limitation of liability</h2>
              <p className="text-gray-600 leading-relaxed">
                To the maximum extent permitted by law, Riviola and its affiliates shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the services. Our total liability shall not exceed the fees paid by you in the twelve months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">7. Contact</h2>
              <p className="text-gray-600 leading-relaxed">
                For questions about these Terms of Service, please contact us at legal@riviola.com or at the address provided on our website.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
