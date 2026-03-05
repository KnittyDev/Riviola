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
    icon: [{ url: "/logo.png", type: "image/png", sizes: "32x32" }, { url: "/logo.png", type: "image/png", sizes: "192x192" }],
    apple: "/logo.png",
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
        <Toaster
          position="top-center"
          theme="light"
          closeButton
          expand={false}
          duration={4000}
          toastOptions={{
            classNames: {
              toast: "riviola-toast",
              title: "riviola-toast-title",
              description: "riviola-toast-description",
              closeButton: "riviola-toast-close",
              success: "riviola-toast-success",
              error: "riviola-toast-error",
            },
          }}
        />
      </body>
    </html>
  );
}
