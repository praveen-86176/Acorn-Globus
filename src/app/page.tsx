"use client";

import { useEffect, useState } from "react";
import { BookingHistory, Pricing, Slot } from "@/lib/types";
import Header from "@/components/Header";
import SlotSelector from "@/components/SlotSelector";
import BookingForm from "@/components/BookingForm";
import PriceBreakdown from "@/components/PriceBreakdown";
import UserDetailsForm from "@/components/UserDetailsForm";
import BookingHistoryList from "@/components/BookingHistoryList";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const [contactError, setContactError] = useState<string | null>(null);

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

  function validateContact(value: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    return emailRegex.test(value) || phoneRegex.test(value);
  }

  async function submitBooking() {
    if (!selectedSlot || !courtId || !userName) {
      setBookingMessage("Please select a slot, court, and enter your name.");
      return;
    }

    if (!validateContact(contact)) {
      setContactError("Please enter a valid 10-digit phone number or email address.");
      return;
    }

    setBookingLoading(true);
    setBookingMessage(null);
    setContactError(null);

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

  const handleContactChange = (val: string) => {
    setContact(val);
    if (contactError) setContactError(null);
  };

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Header date={date} setDate={setDate} mounted={mounted} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <SlotSelector
            slots={slots}
            loadingSlots={loadingSlots}
            selectedSlot={selectedSlot}
            setSelectedSlot={setSelectedSlot}
          />

          <BookingForm
            selectedSlot={selectedSlot}
            courtId={courtId}
            setCourtId={setCourtId}
            coachId={coachId}
            setCoachId={setCoachId}
            equipment={equipment}
            toggleEquipment={toggleEquipment}
            durationHrs={durationHrs}
            setDurationHrs={setDurationHrs}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <PriceBreakdown
            quoteLoading={quoteLoading}
            pricing={pricing}
            durationHrs={durationHrs}
          />

          <UserDetailsForm
            userName={userName}
            setUserName={setUserName}
            contact={contact}
            setContact={handleContactChange}
            notes={notes}
            setNotes={setNotes}
            bookingLoading={bookingLoading}
            submitBooking={submitBooking}
            bookingMessage={bookingMessage}
            isValid={!!(selectedSlot && courtId && userName && contact)}
            contactError={contactError}
          />
        </div>

        <BookingHistoryList history={history} />
      </div>
    </main>
  );
}
