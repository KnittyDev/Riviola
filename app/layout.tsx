import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="antialiased bg-white text-gray-900 font-sans">
        {children}
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
            },
          }}
        />
      </body>
    </html>
  );
}
