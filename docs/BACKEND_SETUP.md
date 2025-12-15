# 🔧 Backend Setup & Data Storage Guide

Complete guide to understanding and managing the backend infrastructure of the Badminton Court Booking System.

---

## 📊 Database Overview

This application uses **SQLite** as the primary database, which is stored as a single file: `prisma/dev.db`

### Why SQLite?

- ✅ **Zero Configuration**: No server setup required
- ✅ **Portable**: Single file database, easy to backup/transfer
- ✅ **Fast**: Excellent for read-heavy workloads
- ✅ **Perfect for MVP**: Ideal for development and small-scale production
- ✅ **Easy Migration**: Can upgrade to PostgreSQL/MySQL later

---

## 📁 Database Location & Files

```
app/
├── prisma/
│   ├── dev.db                 # SQLite database file (created after migration)
│   ├── schema.prisma          # Database schema definition
│   ├── seed.ts               # Seed data script
│   ├── migrations/           # Migration history
│   │   └── 20251215124402_init/
│   │       └── migration.sql
│   └── migration_lock.toml   # Lock file for migrations
├── .env                      # Environment variables
└── src/lib/prisma.ts         # Prisma client singleton
```

### Database File

**Location**: `prisma/dev.db`

This is a **binary file** containing all your data:
- Courts, Equipment, Coaches
- Bookings and BookingEquipment
- PricingRules and CoachAvailability

**Important**: 
- Don't edit this file manually
- Always use Prisma commands to modify data
- Keep backups before major changes

---

## 🔄 Setting Up the Database

### Initial Setup

1. **Generate Prisma Client**
   ```bash
   npm run prisma:generate
   ```
   This creates the TypeScript types and client code.

2. **Run Migrations**
   ```bash
   npm run prisma:migrate
   ```
   Creates the database file and all tables.

3. **Seed Sample Data**
   ```bash
   npm run prisma:seed
   ```
   Populates the database with sample courts, equipment, coaches, and pricing rules.

### What Happens During Setup

```
Step 1: Generate Client
  → Creates TypeScript types from schema.prisma
  → Location: node_modules/@prisma/client

Step 2: Run Migrations
  → Creates prisma/dev.db (if doesn't exist)
  → Executes SQL from migrations/ folder
  → Creates all tables and indexes

Step 3: Seed Data
  → Inserts sample data via seed.ts
  → Creates 4 courts, 3 equipment items, 3 coaches
  → Sets up pricing rules
```

---

## 🗄️ Database Schema

### Tables & Relationships

```
Court (1) ──────< (Many) Booking
  │
  └─ type: INDOOR | OUTDOOR
  └─ baseRate: integer (INR per hour)

Equipment (1) ───< (Many) BookingEquipment ───> (Many) Booking
  │
  └─ quantity: integer (available stock)
  └─ baseFee: integer (INR per unit per hour)

Coach (1) ──────< (Many) Booking
  │
  ├─ ratePerHour: integer
  └─ CoachAvailability (Many)
      └─ dayOfWeek: 0-6 (Sunday-Saturday)
      └─ startHour, endHour: integer (24h format)

PricingRule
  └─ ruleType: PEAK_HOUR | WEEKEND | INDOOR_PREMIUM
  └─ adjustment: FIXED | PERCENT
  └─ amount: integer
  └─ startHour, endHour: optional (for time-based rules)
  └─ isActive: boolean

Booking
  ├─ reference: string (unique booking ID)
  ├─ userName: string
  ├─ startTime: datetime
  ├─ durationHrs: integer
  ├─ totalPrice: integer (INR)
  └─ status: CONFIRMED | CANCELLED

BookingEquipment
  ├─ bookingId → Booking
  ├─ equipmentId → Equipment
  └─ quantity: integer
```

---

## 🔍 Viewing & Managing Data

### Option 1: Prisma Studio (Recommended) ⭐

**Best for**: Visual browsing and editing

```bash
npx prisma studio
```

Opens a web interface at `http://localhost:5555`

Features:
- ✅ Browse all tables visually
- ✅ Edit records with forms
- ✅ Create new records
- ✅ Filter and search
- ✅ View relationships

**Screenshot Flow:**
```
Open Studio → Select Table → View Records → Edit/Create
```

### Option 2: SQLite CLI

**Best for**: Quick queries and scripting

```bash
# Open database
sqlite3 prisma/dev.db

# Run queries
SELECT * FROM Court;
SELECT * FROM Booking ORDER BY createdAt DESC LIMIT 10;

# View schema
.schema

# Export data
.mode csv
.output bookings.csv
SELECT * FROM Booking;

# Exit
.exit
```

**Common Queries:**

```sql
-- View all courts
SELECT id, name, type, baseRate, isActive FROM Court;

-- View bookings for today
SELECT reference, userName, startTime, totalPrice 
FROM Booking 
WHERE date(startTime) = date('now')
ORDER BY startTime;

-- Check equipment availability
SELECT e.name, e.quantity, COUNT(be.id) as booked
FROM Equipment e
LEFT JOIN BookingEquipment be ON e.id = be.equipmentId
GROUP BY e.id;

-- View pricing rules
SELECT name, ruleType, adjustment, amount, isActive 
FROM PricingRule 
WHERE isActive = 1;
```

### Option 3: Database GUI Tools

**Recommended Tools:**

1. **DB Browser for SQLite** (Free)
   - Download: https://sqlitebrowser.org/
   - Open: `prisma/dev.db`

2. **TablePlus** (Free/Paid)
   - Download: https://tableplus.com/
   - Great UI, supports SQLite

3. **DBeaver** (Free)
   - Download: https://dbeaver.io/
   - Universal database tool

---

## ⚙️ Environment Configuration

### .env File

Create `.env` in the root directory:

```env
# SQLite (Development)
DATABASE_URL="file:./prisma/dev.db"

# For PostgreSQL (Production)
# DATABASE_URL="postgresql://user:password@localhost:5432/badminton_db?schema=public"

# For MySQL (Production)
# DATABASE_URL="mysql://user:password@localhost:3306/badminton_db"
```

### Switching Databases

**To PostgreSQL:**

1. Install PostgreSQL
   ```bash
   # macOS
   brew install postgresql
   
   # Ubuntu
   sudo apt-get install postgresql
   ```

2. Create database
   ```bash
   createdb badminton_db
   ```

3. Update `.env`
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/badminton_db"
   ```

4. Update `prisma/schema.prisma`
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

5. Generate and migrate
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```

---

## 🔄 Database Operations

### Creating Migrations

When you modify `schema.prisma`:

```bash
# Create a new migration
npx prisma migrate dev --name add_new_field

# This will:
# 1. Generate SQL migration file
# 2. Apply it to database
# 3. Regenerate Prisma Client
```

### Resetting Database

**⚠️ Warning: This deletes all data!**

```bash
# Delete database file
rm prisma/dev.db

# Re-run migrations (creates fresh database)
npm run prisma:migrate

# Re-seed data
npm run prisma:seed
```

### Backing Up Database

**SQLite Backup:**

```bash
# Simple file copy
cp prisma/dev.db prisma/dev.db.backup

# SQL dump
sqlite3 prisma/dev.db .dump > backup.sql

# Restore from dump
sqlite3 prisma/dev.db < backup.sql
```

**Automated Backup Script:**

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
cp prisma/dev.db "backups/dev_$DATE.db"
echo "Backup created: backups/dev_$DATE.db"
```

---

## 📊 Data Flow

### Booking Creation Flow

```
1. User selects slot, court, equipment, coach
   ↓
2. Frontend calls POST /api/book
   ↓
3. API validates input
   ↓
4. Check availability (availability.ts)
   ├─ Query existing bookings for time overlap
   ├─ Check coach availability schedules
   └─ Calculate remaining equipment stock
   ↓
5. Calculate pricing (pricing.ts)
   ├─ Base court rate × duration
   ├─ Apply active pricing rules
   ├─ Add equipment fees
   └─ Add coach fee
   ↓
6. Create booking (bookings.ts)
   ├─ Start database transaction
   ├─ Create Booking record
   ├─ Create BookingEquipment records
   ├─ Generate unique reference
   └─ Commit transaction
   ↓
7. Return booking confirmation
```

### Availability Check Flow

```
1. GET /api/availability?date=2025-12-20
   ↓
2. Generate time slots (6 AM - 10 PM, hourly)
   ↓
3. For each slot:
   ├─ Query Court bookings (time overlap)
   ├─ Query Coach bookings (time overlap)
   ├─ Query CoachAvailability (day/hour match)
   └─ Query Equipment bookings (calculate available stock)
   ↓
4. Return available resources per slot
```

---

## 🔐 Data Integrity

### Transactions

All bookings use **database transactions** to ensure atomicity:

```typescript
// If any step fails, entire booking is rolled back
await prisma.$transaction(async (tx) => {
  const booking = await tx.booking.create({...});
  await tx.bookingEquipment.createMany({...});
  // If this fails, booking is not created
});
```

### Constraints

- **Unique reference**: Each booking has a unique reference number
- **Foreign keys**: BookingEquipment must reference valid Booking and Equipment
- **Soft deletes**: Resources use `isActive` flag instead of deletion
- **Cascade deletes**: Deleting a booking removes associated BookingEquipment

---

## 🚀 Production Considerations

### When to Upgrade from SQLite

Consider PostgreSQL/MySQL when:
- ⚠️ Multiple servers (SQLite doesn't handle concurrent writes well)
- ⚠️ High write traffic (>1000 writes/second)
- ⚠️ Need advanced features (full-text search, JSON queries)
- ⚠️ Large dataset (>100GB)

### Migration Path

1. **Export data from SQLite**
   ```bash
   sqlite3 prisma/dev.db .dump > export.sql
   ```

2. **Set up PostgreSQL**
   ```bash
   createdb badminton_prod
   ```

3. **Import data** (requires SQL conversion script)

4. **Update DATABASE_URL**

5. **Run migrations on new database**

### Performance Optimization

**SQLite:**
- Add indexes on frequently queried fields
- Use connection pooling (if using a wrapper)
- Regular VACUUM (cleanup)

**PostgreSQL:**
- Connection pooling (PgBouncer)
- Read replicas for heavy read workloads
- Proper indexing strategy

---

## 📝 Troubleshooting

### Database Locked Error

**Issue**: `SQLite database is locked`

**Solutions:**
1. Close Prisma Studio if open
2. Check for long-running queries
3. Restart development server

### Migration Failed

**Issue**: `Migration failed`

**Solutions:**
```bash
# Reset migrations
rm -rf prisma/migrations

# Recreate
npx prisma migrate dev --name init
```

### Seed Data Not Appearing

**Issue**: Seed runs but no data visible

**Solutions:**
1. Check seed script for errors
2. Verify DATABASE_URL is correct
3. Check if tables exist: `npx prisma studio`

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**Need help?** Open an issue or check the main README.md

