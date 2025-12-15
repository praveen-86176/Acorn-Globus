# 🏸 Badminton Court Booking System - Acorn Globus

A modern, full-stack badminton court booking platform built with Next.js, Prisma, and SQLite. Features real-time availability checking, dynamic pricing, multi-resource booking, and an admin panel for facility management.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5.20-2D3748?style=flat-square&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)

---

## ✨ Features

### 🎯 User Features
- **Real-time Slot Booking**: View available time slots with live availability updates
- **Multi-Resource Booking**: Book court + equipment + coach in a single atomic transaction
- **Dynamic Pricing**: Automatic price calculation based on:
  - Peak hours (6-9 PM) surcharge
  - Weekend premium
  - Indoor court premium
  - Equipment rental fees
  - Coach fees
- **Live Price Breakdown**: See detailed pricing breakdown as you select options
- **Booking History**: View recent bookings with reference numbers
- **Responsive Design**: Beautiful, modern UI that works on all devices

### 🔧 Admin Features
- **Court Management**: Add, edit, and disable courts
- **Equipment Inventory**: Manage equipment stock and rental fees
- **Coach Management**: Add coaches with availability schedules
- **Pricing Rules**: Create, update, and enable/disable pricing rules
- **Real-time Updates**: Changes reflect immediately in the booking system

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** or **yarn** package manager
- Basic knowledge of terminal/command line

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd "Acorn Globus/app"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   # Generate Prisma Client
   npm run prisma:generate
   
   # Run database migrations
   npm run prisma:migrate
   
   # Seed sample data (courts, equipment, coaches, pricing rules)
   npm run prisma:seed
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Main booking page: [http://localhost:3000](http://localhost:3000)
   - Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 📁 Project Structure

```
app/
├── prisma/
│   ├── schema.prisma          # Database schema definitions
│   ├── seed.ts                # Seed data script
│   └── migrations/            # Database migration files
├── src/
│   ├── app/
│   │   ├── page.tsx           # Main booking page (user interface)
│   │   ├── admin/
│   │   │   └── page.tsx       # Admin panel
│   │   ├── api/               # API routes
│   │   │   ├── availability/  # Get available slots
│   │   │   ├── quote/         # Calculate pricing
│   │   │   ├── book/          # Create booking
│   │   │   ├── bookings/      # Get booking history
│   │   │   └── admin/         # Admin CRUD operations
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   └── lib/
│       ├── prisma.ts          # Prisma client singleton
│       ├── availability.ts    # Availability calculation logic
│       ├── pricing.ts         # Pricing engine
│       └── bookings.ts        # Booking creation logic
├── .env                       # Environment variables (DATABASE_URL)
├── next.config.ts             # Next.js configuration
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

---

## 💾 Backend & Data Storage

### Database Setup

This project uses **SQLite** for data storage, which is perfect for development and small-to-medium deployments.

#### Database Location

The database file is located at:
```
app/prisma/dev.db
```

**Note**: The `dev.db` file is created automatically when you run migrations. It's a single file database, making it easy to backup, transfer, or reset.

#### Database Schema

The schema includes the following models:

- **Court**: Badminton courts (indoor/outdoor) with base rates
- **Equipment**: Rental equipment with inventory tracking
- **Coach**: Professional coaches with hourly rates
- **CoachAvailability**: Coach availability schedules (day/hour ranges)
- **PricingRule**: Configurable pricing rules (peak hours, weekends, etc.)
- **Booking**: Customer bookings with references
- **BookingEquipment**: Many-to-many relationship for booking equipment

#### Viewing/Managing Data

**Option 1: Prisma Studio (Recommended)**
```bash
npx prisma studio
```
Opens a web interface at `http://localhost:5555` to view and edit data visually.

**Option 2: SQLite Command Line**
```bash
# Install SQLite (if not installed)
# macOS: brew install sqlite
# Linux: sudo apt-get install sqlite3

# Open database
sqlite3 prisma/dev.db

# Run SQL queries
SELECT * FROM Court;
SELECT * FROM Booking;
.exit
```

**Option 3: Database Browser**
Use tools like:
- [DB Browser for SQLite](https://sqlitebrowser.org/)
- [TablePlus](https://tableplus.com/)
- [DBeaver](https://dbeaver.io/)

Open the file: `app/prisma/dev.db`

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./prisma/dev.db"
```

**For Production**: Change to PostgreSQL or MySQL:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/badminton_db"
```

### Resetting the Database

To start fresh with seed data:

```bash
# Delete existing database
rm prisma/dev.db

# Re-run migrations
npm run prisma:migrate

# Re-seed data
npm run prisma:seed
```

---

## 🎨 Seed Data (India Context)

The seed script creates realistic data for a Bengaluru facility:

### Courts (4 total)
- **Indoor Courts** (2): Premium rates ₹430-450/hour
  - Indiranagar Indoor Court 1
  - Indiranagar Indoor Court 2
- **Outdoor Courts** (2): Standard rates ₹300-320/hour
  - Koramangala Outdoor Court 1
  - Koramangala Outdoor Court 2

### Equipment
- **Rackets**: ₹120/unit/hour, 12 available
- **Shoes**: ₹90/unit/hour, 8 available
- **Feather Shuttles**: ₹70/unit/hour, 10 available

### Coaches (3)
- **Ayesha Khan**: Evening specialist (6 PM - 10 PM), ₹800/hour
- **Rahul Menon**: Morning coach (6 AM - 12 PM), ₹750/hour
- **Arjun Iyer**: Weekend specialist (Saturdays/Sundays), ₹850/hour

### Pricing Rules
- **Peak Hours**: +₹150/hour (6 PM - 9 PM)
- **Weekend Premium**: +₹120/hour (Saturday/Sunday)
- **Indoor Premium**: +₹80/hour for indoor courts

---

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start development server

# Database
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:seed      # Seed sample data
npx prisma studio        # Open database GUI

# Production
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
```

---

## 📡 API Endpoints

### User Endpoints

**GET** `/api/availability?date=YYYY-MM-DD`
- Returns available slots for a given date
- Includes available courts, coaches, and equipment

**POST** `/api/quote`
```json
{
  "courtId": 1,
  "coachId": 2,           // optional
  "equipment": [          // optional
    { "id": 1, "quantity": 2 }
  ],
  "startTime": "2025-12-20T18:00:00.000Z",
  "durationHrs": 2
}
```
- Returns detailed price breakdown

**POST** `/api/book`
```json
{
  "userName": "John Doe",
  "contact": "+91 9876543210",
  "courtId": 1,
  "coachId": 2,           // optional
  "equipment": [...],     // optional
  "startTime": "2025-12-20T18:00:00.000Z",
  "durationHrs": 2,
  "notes": "Near AC unit preferred"
}
```
- Creates a booking (atomic transaction)
- Returns booking reference

**GET** `/api/bookings`
- Returns recent booking history

### Admin Endpoints

**GET/POST** `/api/admin/courts`
**GET/POST** `/api/admin/equipment`
**GET/POST** `/api/admin/coaches`
**GET/POST** `/api/admin/pricing-rules`

---

## 🏗️ Architecture & Design Decisions

### Database Design

**Why SQLite?**
- Zero configuration required
- Perfect for MVP and small-scale deployments
- Easy to backup (single file)
- Can be migrated to PostgreSQL/MySQL later

**Schema Highlights:**
- **Normalized design**: Separate tables for resources
- **Soft deletes**: `isActive` flags instead of hard deletes
- **Flexible pricing**: Rules stored in database, not hardcoded
- **Atomic bookings**: Transactions ensure data consistency

### Pricing Engine

The pricing engine is **completely data-driven**:

1. Base court rate × duration
2. Apply active pricing rules (stack multiple rules)
3. Add equipment fees
4. Add coach fee
5. Calculate total

Rules are stored in the `PricingRule` table, making it easy to:
- Adjust prices without code changes
- Enable/disable rules
- Add new rule types via admin panel

### Availability System

**How it works:**
1. Generate hourly slots (6 AM - 10 PM)
2. For each slot, check:
   - Court bookings (time overlap)
   - Coach bookings (time overlap)
   - Equipment inventory (subtract booked quantities)
   - Coach availability (day/hour restrictions)
3. Return available resources per slot

**Performance:**
- Uses Prisma queries with date/time filtering
- Single query per resource type
- Results cached per request

---

## 🔒 Data Integrity & Transactions

**Atomic Bookings:**
- All resources (court, coach, equipment) are reserved in a single database transaction
- If any resource is unavailable, the entire booking fails
- Prevents double-booking and inventory inconsistencies

**Concurrency:**
- SQLite handles concurrent reads well
- For high-traffic scenarios, consider PostgreSQL with row-level locking
- Future enhancement: Redis-based locking for slots

---

## 🚀 Deployment

### Production Considerations

1. **Database Migration**
   ```bash
   # Switch to PostgreSQL in .env
   DATABASE_URL="postgresql://user:pass@host:5432/db"
   
   # Generate migration
   npm run prisma:migrate
   ```

2. **Environment Variables**
   - Set `NODE_ENV=production`
   - Use strong `DATABASE_URL`
   - Configure CORS if needed

3. **Build & Deploy**
   ```bash
   npm run build
   npm run start
   ```

### Recommended Platforms

- **Vercel** (easiest for Next.js)
- **Railway** (includes PostgreSQL)
- **Render** (includes database)
- **DigitalOcean App Platform**

---

## 🧪 Testing the System

1. **Create a Booking:**
   - Go to http://localhost:3000
   - Select a date and time slot
   - Choose a court
   - Add equipment/coach (optional)
   - Enter your details
   - Confirm booking

2. **Check Availability:**
   - Book a slot
   - Try to book the same slot again
   - Notice it's no longer available

3. **Test Pricing:**
   - Book during peak hours (6-9 PM)
   - Book on weekend
   - See price adjustments automatically applied

4. **Admin Panel:**
   - Go to http://localhost:3000/admin
   - Add a new court
   - Create a pricing rule
   - Changes reflect immediately

---

## 📝 Assumptions & Limitations

### Current Assumptions
- Time slots are **1-hour increments** starting on the hour
- Bookings can span multiple hours (1-3 hours)
- All times in **server local time** (Asia/Kolkata for seed data)
- No user authentication (simple name/contact)
- No payment integration (pricing only)

### Known Limitations
- No concurrent booking prevention (can be added with row locks)
- No waitlist feature (future enhancement)
- Single timezone (no timezone conversion)
- Basic validation (add more robust validation)

---

## 🔮 Future Enhancements

- [ ] User authentication & profiles
- [ ] Payment integration (Razorpay/Stripe)
- [ ] Email/SMS notifications
- [ ] Waitlist for fully booked slots
- [ ] Calendar view for bookings
- [ ] Recurring bookings
- [ ] Booking cancellations & refunds
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 💬 Support

For questions or issues:
- Open an issue on GitHub
- Check the [Prisma documentation](https://www.prisma.io/docs)
- Check the [Next.js documentation](https://nextjs.org/docs)

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database managed with [Prisma](https://www.prisma.io/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Heroicons](https://heroicons.com/)

---

**Made with ❤️ for badminton enthusiasts in Bengaluru**
