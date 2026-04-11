"use client";

import { Link } from "@/i18n/routing";
import Image from "next/image";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

export function Header() {
  const t = useTranslations("Navigation");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#features", label: t("features") },
    { href: "#pricing", label: t("pricing") },
    { href: "#cta", label: t("contact") },
  ];

  return (
    <header 
      className={`fixed top-0 z-[100] w-full transition-all duration-300 ${
        isScrolled 
          ? "bg-white/90 backdrop-blur-md border-b border-gray-200 py-3" 
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 relative z-50">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#134e4a] to-[#2dd4bf] rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <Image
              src="/mainlogo.png"
              alt="Riviola"
              width={40}
              height={40}
              className="relative size-10 rounded-xl object-contain shrink-0"
              priority
            />
          </div>
          <span className="text-xl font-black tracking-tight text-[#134e4a] hidden sm:block">
            Riviola
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-bold text-gray-600 hover:text-[#134e4a] transition-colors relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#134e4a] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3 relative z-50">
          <div className="hidden sm:block">
            <LocaleSwitcher />
          </div>
          
          <div className="h-4 w-[1px] bg-gray-200 mx-1 hidden lg:block" />
          
          <Link
            href="/login"
            className="hidden md:block px-4 py-2 text-sm font-bold text-gray-700 hover:text-[#134e4a] transition-colors"
          >
            {t("signIn")}
          </Link>
          
          <Link
            href="/onboarding"
            className="hidden sm:flex px-5 sm:px-6 py-2 sm:py-2.5 bg-[#134e4a] text-white rounded-full text-[13px] sm:text-sm font-bold shadow-lg shadow-[#134e4a]/20 hover:bg-[#115e59] hover:scale-105 active:scale-95 transition-all"
          >
            {t("getStarted")}
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:text-[#134e4a] transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between items-end">
              <span className={`h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'w-6 translate-y-2 -rotate-45' : 'w-6'}`}></span>
              <span className={`h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'w-4'}`}></span>
              <span className={`h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'w-6 -translate-y-2 rotate-45' : 'w-5'}`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-white z-[40] lg:hidden transition-transform duration-500 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full pt-24 px-10">
          <div className="space-y-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block text-2xl font-black text-gray-900 active:text-[#134e4a]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-12 pt-12 border-t border-gray-100 space-y-6">
            <Link
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="block text-xl font-bold text-gray-600"
            >
              {t("signIn")}
            </Link>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t("language") || "Language"}</span>
              <LocaleSwitcher isMobile />
            </div>
          </div>

          <div className="mt-auto mb-12">
            <Link
              href="/onboarding"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full py-4 bg-[#134e4a] text-white text-center rounded-2xl text-lg font-black shadow-xl shadow-[#134e4a]/20"
            >
              {t("getStarted")}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
