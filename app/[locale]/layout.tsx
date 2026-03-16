import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Riviola – Construction & Investment Management",
  description:
    "High-end construction management for modern investors. Track every beam, budget, and breakthrough in real-time.",
  icons: {
    icon: [{ url: "/mainlogo.png", type: "image/png", sizes: "32x32" }, { url: "/mainlogo.png", type: "image/png", sizes: "192x192" }],
    apple: "/mainlogo.png",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} className={plusJakarta.variable}>
      <body className="antialiased bg-white text-gray-900 font-sans">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        {/* Single Toaster for entire app (investor + staff); styling in globals.css .riviola-toast* */}
        <Toaster
          position="top-center"
          theme="light"
          closeButton={false}
          expand={false}
          duration={4000}
          toastOptions={{
            classNames: {
              toast: "riviola-toast",
              title: "riviola-toast-title",
              description: "riviola-toast-description",
              success: "riviola-toast-success",
              error: "riviola-toast-error",
              info: "riviola-toast-info",
              warning: "riviola-toast-warning",
            },
          }}
        />
      </body>
    </html>
  );
}
