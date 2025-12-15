# 🏸 Acorn Globus - Badminton Court Booking System

A modern, full-stack badminton court booking application built with Next.js, Prisma, and Tailwind CSS. Features a premium UI, dark mode support, and a comprehensive admin dashboard.

## ✨ Features

### 👤 User Features
- **Smart Booking System**: Real-time checking of court, coach, and equipment availability.
- **Coach Selection**: Browse detailed coach profiles (bio, city, rates) and check their specific availability schedules.
- **Equipment Rental**: Rent rackets, shoes, and shuttlecocks directly during booking.
- **Dynamic Pricing**: Automatic calculation including court rates, equipment fees, coaching charges, and peak hour/weekend adjustments.
- **Booking History**: View past bookings with reference IDs and details.
- **Dark Mode**: Fully supported dark/light theme switching.

### 🛡️ Admin Dashboard (`/admin`)
- **Facility Management**: Create and manage Courts, Equipment, and Coaches.
- **Availability Control**: Set specific working hours and days for each coach.
- **Pricing Engine**: Configure dynamic pricing rules (e.g., "Peak Hours +₹150", "Weekend Premium +₹120").
- **Dashboard Overview**: View key metrics and active assets at a glance.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Directory)
- **Database**: [SQLite](https://www.sqlite.org/) (with [Prisma ORM](https://www.prisma.io/))
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Theming**: `next-themes`
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/praveen-86176/Acorn-Globus.git
    cd "Acorn Globus/app"
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Setup Database:**
    ```bash
    # Generate Prisma Client
    npx prisma generate

    # Create SQLite DB and run migrations
    npx prisma migrate dev --name init

    # Seed initial data (Courts, Equipment, Coaches like Vikram & Anjali)
    npx prisma db seed
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```bash
app/
├── prisma/               # Database schema and seed scripts
│   ├── dev.db           # SQLite Database (gitignored)
│   ├── schema.prisma    # Data models
│   └── seed.ts          # Seed data (Coaches, Courts, etc.)
├── src/
│   ├── app/
│   │   ├── admin/       # Admin Dashboard Page
│   │   ├── api/         # Backend API Routes
│   │   ├── layout.tsx   # Root Layout & Providers
│   │   └── page.tsx     # Main Booking Page
│   └── lib/             # Shared utilities (pricing, availability logic)
└── docs/                # Documentation
    └── BACKEND_SETUP.md # Detailed DB internals guide
```

## 🔐 Admin Access

Navigate to `/admin` to access the configuration panel.
*(Note: In this demo/MVP version, the admin route is public. In production, you should implement authentication using NextAuth.js or similar).*

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
