import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function CookiesPage() {
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
            Cookie Policy
          </h1>
          <p className="text-gray-500 mt-2">
            Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>

          <div className="prose prose-gray mt-12 space-y-10">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">1. What are cookies</h2>
              <p className="text-gray-600 leading-relaxed">
                Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences, keep you signed in, and understand how you use the service. We use cookies and similar technologies in line with this policy and applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">2. Cookies we use</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We use the following types of cookies:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li><strong className="text-gray-900">Strictly necessary:</strong> Required for the site to function (e.g. authentication, security). These cannot be disabled for the service to work.</li>
                <li><strong className="text-gray-900">Functional:</strong> Remember your choices (e.g. language, region) to improve your experience.</li>
                <li><strong className="text-gray-900">Analytics:</strong> Help us understand how visitors use our site (e.g. pages viewed, traffic) so we can improve it.</li>
                <li><strong className="text-gray-900">Marketing (if any):</strong> Used to deliver relevant ads or measure campaign effectiveness, where we have your consent where required.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">3. How to manage cookies</h2>
              <p className="text-gray-600 leading-relaxed">
                You can control and delete cookies through your browser settings. Note that blocking or deleting certain cookies may affect site functionality or your experience. For more information, see your browser&apos;s help section or visit www.aboutcookies.org.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">4. Updates</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in our practices or legal requirements. We will post the updated version on this page and indicate the last updated date. We encourage you to review this policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">5. Contact</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have questions about our use of cookies, please contact us at privacy@riviola.com or at the address provided on our website.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
