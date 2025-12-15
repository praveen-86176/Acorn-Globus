"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";

type Slot = {
  startTime: string;
  availableCourts: { id: number; name: string; type: string; baseRate: number }[];
  coaches: { id: number; name: string; isAvailable: boolean; status: string }[];
  equipmentAvailability: { id: number; name: string; available: number }[];
};

type Pricing = {
  baseCourt: number;
  adjustments: { label: string; amount: number }[];
  equipmentTotal: number;
  coachTotal: number;
  total: number;
};

type BookingHistory = {
  id: number;
  userName: string;
  startTime: string;
  totalPrice: number;
  courtId: number;
  court: { name: string };
  coach?: { name: string } | null;
  reference?: string;
};

export default function Home() {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [courtId, setCourtId] = useState<number | null>(null);
  const [coachId, setCoachId] = useState<number | null>(null);
  const [durationHrs, setDurationHrs] = useState(1);
  const [equipment, setEquipment] = useState<Record<number, number>>({});
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [userName, setUserName] = useState("");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<BookingHistory[]>([]);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function load() {
      setLoadingSlots(true);
      setPricing(null);
      setSelectedSlot(null);
      setCourtId(null);
      setCoachId(null);
      setEquipment({});
      try {
        const res = await fetch(`/api/availability?date=${date}`);
        const data = await res.json();
        setSlots(data.slots ?? []);
      } finally {
        setLoadingSlots(false);
      }
    }
    load();
  }, [date]);

  useEffect(() => {
    async function loadHistory() {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      setHistory(data.bookings ?? []);
    }
    loadHistory();
  }, []);

  const availableCourtsForSlot = selectedSlot?.availableCourts ?? [];
  const coachesForSlot = selectedSlot?.coaches ?? [];
  const equipmentForSlot = selectedSlot?.equipmentAvailability ?? [];

  const selectedSlotLabel = useMemo(() => {
    if (!selectedSlot) return "";
    const dt = new Date(selectedSlot.startTime);
    return dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }, [selectedSlot]);

  // Auto-fetch quote when selection changes
  useEffect(() => {
    async function fetchQuote() {
      if (!selectedSlot || !courtId) {
        setPricing(null);
        return;
      }
      setQuoteLoading(true);
      setPricing(null);
      const startTime = new Date(selectedSlot.startTime).toISOString();
      const equipmentArray = Object.entries(equipment)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => ({ id: Number(id), quantity: qty }));

      try {
        const res = await fetch("/api/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courtId,
            coachId,
            equipment: equipmentArray,
            startTime,
            durationHrs,
          }),
        });
        const data = await res.json();
        setPricing(data.total ? data : null);
      } catch {
        // Silently fail - price will just not update
        setPricing(null);
      } finally {
        setQuoteLoading(false);
      }
    }
    fetchQuote();
  }, [selectedSlot, courtId, coachId, equipment, durationHrs]);

  async function submitBooking() {
    if (!selectedSlot || !courtId || !userName) {
      setBookingMessage("Please select a slot, court, and enter your name.");
      return;
    }
    setBookingLoading(true);
    setBookingMessage(null);
    const startTime = new Date(selectedSlot.startTime).toISOString();
    const equipmentArray = Object.entries(equipment)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({ id: Number(id), quantity: qty }));

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName,
          contact,
          notes,
          courtId,
          coachId,
          equipment: equipmentArray,
          startTime,
          durationHrs,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBookingMessage(`✅ Booked successfully! Reference: ${data.booking.reference}`);
        setPricing(data.pricing);
        setHistory((prev) => [data.booking as BookingHistory, ...prev].slice(0, 15));
        // Reset form
        setUserName("");
        setContact("");
        setNotes("");
        setSelectedSlot(null);
        setCourtId(null);
        setCoachId(null);
        setEquipment({});
        setPricing(null);
        // Refresh slots
        const refreshRes = await fetch(`/api/availability?date=${date}`);
        const refreshData = await refreshRes.json();
        setSlots(refreshData.slots ?? []);
      } else {
        setBookingMessage(`❌ ${data.error || "Booking failed"}`);
      }
    } catch {
      setBookingMessage("❌ Network error. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  }

  const toggleEquipment = (id: number, qty: number) => {
    setEquipment((prev) => ({ ...prev, [id]: qty }));
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 rounded-2xl bg-card/80 backdrop-blur-sm shadow-lg border border-border p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold text-lg shadow-md">
                  AG
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-primary font-bold">Acorn Globus</p>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    Badminton Court Booking
                  </h1>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1 font-medium">📍 Bengaluru • Indoor & Outdoor Courts • Professional Coaches</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="rounded-xl bg-muted/50 p-4 shadow-sm border border-border">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Select Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  className="mt-2 w-full rounded-lg border-2 border-border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-ring/20 focus:outline-none transition-all text-foreground"
                />
              </div>
              <Link
                href="/admin"
                className="self-end sm:self-auto rounded-xl bg-gradient-to-r from-secondary to-primary/80 px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin Panel
              </Link>
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="rounded-lg bg-card border border-border p-2 text-foreground shadow-sm hover:shadow-md hover:border-primary/50 transition-all h-9 w-9 flex items-center justify-center"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Available Slots */}
          <section className="lg:col-span-2 rounded-2xl bg-card/80 backdrop-blur-sm shadow-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Available Time Slots
              </h2>
              {loadingSlots && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  Loading...
                </div>
              )}
            </div>
            {!slots.length && !loadingSlots && (
              <div className="text-center py-12 rounded-xl bg-muted/30 border-2 border-dashed border-border/50">
                <p className="text-muted-foreground font-medium">No slots available for this date</p>
                <p className="text-sm text-muted-foreground/80 mt-1">Try selecting another date</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {slots.map((slot) => {
                const timeLabel = new Date(slot.startTime).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const availableCourts = slot.availableCourts.length;
                const isSelected = selectedSlot?.startTime === slot.startTime;
                const isFull = availableCourts === 0;
                return (
                  <button
                    key={slot.startTime}
                    onClick={() => !isFull && setSelectedSlot(slot)}
                    disabled={isFull}
                    className={`rounded-xl border-2 px-4 py-3 text-left transition-all transform hover:scale-105 ${isSelected
                      ? "border-primary bg-primary/5 shadow-lg ring-2 ring-ring/20"
                      : isFull
                        ? "border-border bg-muted opacity-60 cursor-not-allowed"
                        : "border-border bg-card hover:border-primary/50 hover:shadow-md"
                      }`}
                  >
                    <div className="text-base font-bold text-foreground">{timeLabel}</div>
                    <div className="flex items-center gap-1 mt-1">
                      {isFull ? (
                        <span className="text-xs font-semibold text-destructive">Fully Booked</span>
                      ) : (
                        <>
                          <span className="text-xs text-muted-foreground">{availableCourts} court{availableCourts !== 1 ? "s" : ""}</span>
                          <span className="text-primary">•</span>
                          <span className="text-xs text-muted-foreground">Available</span>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Selection Panel */}
          <section className="rounded-2xl bg-card/80 backdrop-blur-sm shadow-xl border border-border p-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Booking Details
            </h2>
            {!selectedSlot ? (
              <div className="text-center py-8 rounded-xl bg-muted/30 border-2 border-dashed border-border/50">
                <svg className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-muted-foreground font-medium">Select a time slot to continue</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg bg-primary/10 p-4 border border-primary/20">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Selected Time</label>
                  <p className="text-lg font-bold text-primary mt-1">{selectedSlotLabel}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">Court *</label>
                  <select
                    className="w-full rounded-lg border-2 border-border bg-card px-4 py-2.5 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-ring/20 focus:outline-none transition-all text-foreground"
                    value={courtId ?? ""}
                    onChange={(e) => setCourtId(Number(e.target.value) || null)}
                  >
                    <option value="" className="bg-card text-foreground">Choose a court</option>
                    {availableCourtsForSlot.map((court) => (
                      <option key={court.id} value={court.id} className="bg-card text-foreground">
                        {court.name} ({court.type.toLowerCase()} • ₹{court.baseRate}/hr)
                      </option>
                    ))}
                  </select>
                  {!availableCourtsForSlot.length && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      No courts available for this slot
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">Coach (Optional)</label>
                  <select
                    className="w-full rounded-lg border-2 border-border bg-card px-4 py-2.5 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-ring/20 focus:outline-none transition-all text-foreground"
                    value={coachId ?? ""}
                    onChange={(e) => setCoachId(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="" className="bg-card text-foreground">No coach</option>
                    {coachesForSlot.map((coach) => (
                      <option key={coach.id} value={coach.id} disabled={!coach.isAvailable} className="bg-card text-foreground disabled:text-muted-foreground">
                        {coach.name} ({coach.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">Equipment Rental</label>
                  <div className="space-y-2">
                    {equipmentForSlot.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-lg border-2 border-border bg-card p-3 hover:border-primary/50 transition-all">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.available} available</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleEquipment(item.id, Math.max(0, (equipment[item.id] ?? 0) - 1))}
                            className="h-8 w-8 rounded-lg border-2 border-border bg-background flex items-center justify-center text-foreground hover:border-primary/50 hover:text-primary transition-all disabled:opacity-50"
                            disabled={(equipment[item.id] ?? 0) <= 0}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={0}
                            max={item.available}
                            value={equipment[item.id] ?? 0}
                            onChange={(e) => toggleEquipment(item.id, Number(e.target.value))}
                            className="w-12 rounded-lg border-2 border-border px-1 py-1 text-sm font-medium text-center focus:border-primary focus:ring-2 focus:ring-ring/20 focus:outline-none transition-all bg-card text-foreground appearance-none"
                          />
                          <button
                            onClick={() => toggleEquipment(item.id, Math.min(item.available, (equipment[item.id] ?? 0) + 1))}
                            className="h-8 w-8 rounded-lg border-2 border-border bg-background flex items-center justify-center text-foreground hover:border-primary/50 hover:text-primary transition-all disabled:opacity-50"
                            disabled={(equipment[item.id] ?? 0) >= item.available}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-sm font-semibold text-foreground mb-2 block">Duration</label>
                    <select
                      value={durationHrs}
                      onChange={(e) => setDurationHrs(Number(e.target.value))}
                      className="w-full rounded-lg border-2 border-border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-ring/20 focus:outline-none transition-all text-foreground"
                    >
                      <option value={1}>1 hour</option>
                      <option value={2}>2 hours</option>
                      <option value={3}>3 hours</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Price Breakdown & Booking */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2 rounded-2xl bg-card/80 backdrop-blur-sm shadow-xl border border-border p-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Price Breakdown
            </h2>
            {quoteLoading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-sm text-muted-foreground mt-2">Calculating price...</p>
              </div>
            ) : !pricing ? (
              <div className="text-center py-8 rounded-xl bg-muted border-2 border-dashed border-border">
                <p className="text-sm text-muted-foreground font-medium">Select a court to see pricing</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Court base rate ({durationHrs} hr{durationHrs > 1 ? "s" : ""})</span>
                    <span className="font-semibold text-foreground">₹{pricing.baseCourt}</span>
                  </div>
                  {pricing.adjustments.map((adj, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        {adj.label}
                      </span>
                      <span className="font-medium">+₹{adj.amount}</span>
                    </div>
                  ))}
                  {pricing.equipmentTotal > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Equipment rental</span>
                      <span className="font-semibold text-foreground">₹{pricing.equipmentTotal}</span>
                    </div>
                  )}
                  {pricing.coachTotal > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Coach fee</span>
                      <span className="font-semibold text-foreground">₹{pricing.coachTotal}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center rounded-xl bg-primary text-primary-foreground p-4 shadow-lg">
                  <span className="text-lg font-bold">Total Amount</span>
                  <span className="text-2xl font-bold">₹{pricing.total}</span>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-card/80 backdrop-blur-sm shadow-xl border border-border p-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Your Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Full Name *</label>
                <input
                  className="w-full rounded-lg border-2 border-border bg-card px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-ring/20 focus:outline-none transition-all text-foreground placeholder:text-muted-foreground"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Contact (Phone/Email)</label>
                <input
                  className="w-full rounded-lg border-2 border-border bg-card px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-ring/20 focus:outline-none transition-all text-foreground placeholder:text-muted-foreground"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Phone number or email"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Special Requests</label>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border-2 border-border bg-card px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-ring/20 focus:outline-none transition-all resize-none text-foreground placeholder:text-muted-foreground"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requirements..."
                />
              </div>
              <button
                onClick={submitBooking}
                disabled={!selectedSlot || !courtId || !userName || bookingLoading}
                className="w-full rounded-xl bg-gradient-to-r from-secondary to-primary px-6 py-3.5 font-bold text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {bookingLoading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Confirm Booking
                  </>
                )}
              </button>
              {bookingMessage && (
                <div
                  className={`rounded-lg p-3 text-sm font-medium ${bookingMessage.startsWith("✅")
                    ? "bg-success/10 text-success border border-success/20"
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                    }`}
                >
                  {bookingMessage}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Booking History */}
        <section className="mt-6 rounded-2xl bg-card/80 backdrop-blur-sm shadow-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Bookings
            </h2>
            <span className="text-xs font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-full">
              Latest {history.length}
            </span>
          </div>
          {history.length === 0 ? (
            <div className="text-center py-12 rounded-xl bg-muted border-2 border-dashed border-border">
              <svg className="w-12 h-12 mx-auto text-muted-foreground mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm text-muted-foreground font-medium">No bookings yet</p>
              <p className="text-xs text-muted-foreground mt-1">Your bookings will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl border-2 border-border bg-gradient-to-br from-card to-muted p-4 hover:border-primary/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-2 border-b border-border/50 pb-2">
                    <div>
                      <p className="font-bold text-foreground">{b.userName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(b.startTime).toLocaleDateString()} at {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">₹{b.totalPrice}</p>
                      <p className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full inline-block mt-1">{b.court?.name || "Court #" + b.courtId}</p>
                    </div>
                  </div>

                  {b.coach && (
                    <div className="mb-2 text-xs flex items-center gap-1.5 text-muted-foreground">
                      <span className="font-semibold text-primary">Coach:</span> {b.coach.name}
                    </div>
                  )}

                  {b.reference && (
                    <div className="mt-2 pt-2 border-t border-border/50 flex justify-between items-center">
                      <p className="text-xs font-mono text-muted-foreground">
                        Ref: <span className="font-semibold text-foreground">{b.reference}</span>
                      </p>
                      <span className="text-[10px] uppercase font-bold text-success tracking-wider bg-success/10 px-2 py-0.5 rounded-full">Paid</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
