# System Design & Implementation Details

## 🏗 Database Design

The database is modeled using **Prisma ORM** with **SQLite** for simplicity and portability in this assignment. The schema is designed to separate resource definitions from transactional data while allowing flexible configuration.

### Core Resources
*   **Court**: Represents the physical courts (Indoor/Outdoor). Each has a `baseRate` and `type`.
*   **Equipment**: Trackable inventory items (Rackets, Shoes) with quantities and hourly rental fees.
*   **Coach**: Profiles of coaches including their base `ratePerHour` and availability.
*   **CoachAvailability**: One-to-many relation with `Coach` that defines specific working hours per day of the week (e.g., Vikram: Mon 10-14).

### Configuration
*   **PricingRule**: A flexible entity to define dynamic pricing logic without code changes. Rules can be:
    *   **PEAK_HOUR**: Applies during specific hours (startHour/endHour).
    *   **WEEKEND**: Applies on weekends.
    *   **INDOOR_PREMIUM**: Applies to specific court types.
    *   Each rule specifies an `adjustment` type (FIXED amount or PERCENT) and the `amount`.

### Transactions
*   **Booking**: The central transactional record connecting a User to a Court, optional Coach, and time slot.
    *   Includes calculated `totalPrice` at the time of booking to preserve history even if rates change.
    *   Uses a unique `reference` string for easy lookup.
*   **BookingEquipment**: Many-to-many relation tracking which equipment was rented for a specific booking.

---

## 💰 Pricing Engine Approach

The pricing logic is decoupled from the booking transaction to ensure testability and consistency. It resides in `src/lib/pricing.ts`.

### 1. Stackable Rules Strategy
Instead of a complex `if/else` chain, we use a **stackable modifier** approach:
1.  **Base Rate**: Start with the `Court.baseRate` * duration.
2.  **Fetch Active Rules**: Retrieve all active `PricingRule` records from the DB.
3.  **Apply Modifiers**: Iterate through rules and check applicability:
    *   *Time-based*: Is the active slot within `startHour` and `endHour`?
    *   *Day-based*: Is the date a Saturday or Sunday?
    *   *Type-based*: Is the court type "INDOOR"?
4.  **Accumulate Cost**: If a rule matches, add its `amount` (or percentage) to the running total.

### 2. Resource Add-ons
After the court price is finalized, we add the cost of secondary resources:
*   **Coach Fee**: `Coach.ratePerHour` * duration.
*   **Equipment Fee**: Sum of (`Equipment.baseFee` * quantity) * duration.

### 3. Final Calculation
`Total = (Base Court Rate + Sum(Rule Adjustments) + Coach Fee + Equipment Fee)`

This approach allows the Admin to create new rules (e.g., "Deep Night Discount") without deploying new code, satisfying the requirement for dynamic, configurable pricing.

---

## ⚡ Assumptions Made

1.  **Time Slots**: All bookings start at the top of the hour and durations are in full hour increments.
2.  **Date Availability**: The facility is open from 6:00 AM to 10:00 PM daily.
3.  **Currency**: All monetary values are in INR (₹).
4.  **Admin Auth**: For the purpose of this assignment, the `/admin` route is unprotected to allow easy evaluation of the configuration features.
5.  **Concurrency**: While Prisma transactions ensure atomic writes, we rely on application-level checks (`findMany_ACTIVE_BOOKINGS`) immediately inside the transaction scope to prevent double bookings.
