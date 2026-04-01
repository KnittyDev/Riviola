# 🏙️ Riviola Headquarters (HQ)

**Riviola HQ** is a premium, enterprise-grade Next.js application designed to bridge the gap between real estate developers and global investors. It provides a sophisticated suite of tools for property management, financial tracking, and automated investor communication, all wrapped in a "Corporate Luxury" aesthetic.

---

## ✨ Key Features

### 🏢 Staff Portal
- **Project Tracking:** Real-time monitoring of construction progress, milestones, and sustainability scores.
- **Investor Management:** Centralized database for buyer and renter profiles with multi-currency support.
- **Subscription Engine:** Flexible tiered plans (Essence, Signature, Ultra Deluxe) managed via Stripe Integration.
- **Document Management:** Seamless property document sharing and verification.

### 📈 Investor Dashboard
- **Financial Transparency:** Real-time view of property values, dues (aidat), and purchase installments.
- **Interactive Reports:** Visual analytics using Recharts for portfolio performance.
- **Automated Payments:** Secure billing and receipt management.
- **Multilingual Experience:** Full i18n support (English/Turkish) with a premium locale switcher.

### ⚡ Automation Hub (Supabase Edge Functions)
- **Overdue Detection:** Intelligent background processing to identify unpaid dues.
- **Smart Notifications:** Automated, localized email reminders via **Resend** with adjustable retry logic.
- **Subscription Sync:** Bi-directional synchronization between Stripe billing and database records.

---

## 🛠️ Technology Stack

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Database & Auth:** [Supabase](https://supabase.com/)
- **Styling:** Tailwind CSS (Corporate Luxury Design System)
- **Payments:** [Stripe](https://stripe.com/)
- **Email:** [Resend API](https://resend.com/)
- **Localization:** [next-intl](https://next-intl-docs.vercel.app/)
- **Icons:** Line Awesome & SVG Icons
- **PDF Core:** jsPDF & AutoTable

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (Latest LTS)
- Supabase Project
- Resend Account
- Stripe Account

### 2. Environment Setup
Copy `.env.example` to `.env.local` and fill in the required keys:
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=...
RESEND_API_KEY=...
```

### 3. Installation
```bash
npm install
npm run dev
```

---

## 💎 Design System: "Corporate Luxury"

Riviola follows a strict design protocol to ensure a premium user experience:
- **Primary Color:** Deep Corporate Teal (`#134e4a`)
- **Visuals:** High-fidelity SVG icons, glassmorphism (backdrop-blur), and smooth 200-300ms transitions.
- **Typography:** Inter & Outfit (Geometric Sans)
- **Geometry:** Large border-radii (`2xl`, `3xl`) for a modern, approachable enterprise feel.

---

## 🔒 Security & Performance

- **RLS (Row Level Security):** Strict database-level isolation for all investor and staff data.
- **Edge Runtime:** Critical automations run on Supabase Edge to ensure high availability and shared logic.
- **Optimized Assets:** Device-independent SVG flags and icons for crisp rendering on all platforms.

---

Developed with precision for the next generation of property investment. 🚀
