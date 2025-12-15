"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";

type Court = { id: number; name: string; location: string; type: string; baseRate: number; isActive: boolean };
type Equipment = { id: number; name: string; quantity: number; baseFee: number; isActive: boolean };
type Coach = {
  id: number;
  name: string;
  bio: string;
  city: string;
  ratePerHour: number;
  isActive: boolean;
  availability: { id: number; dayOfWeek: number; startHour: number; endHour: number }[];
};
type PricingRule = {
  id: number;
  name: string;
  description: string | null;
  ruleType: string;
  adjustment: string;
  amount: number;
  startHour: number | null;
  endHour: number | null;
  isActive: boolean;
};

async function jsonFetch<T>(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data as T;
}

export default function AdminPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const [newCourt, setNewCourt] = useState({ name: "", location: "", type: "INDOOR", baseRate: 400 });
  const [newEquip, setNewEquip] = useState({ name: "", quantity: 1, baseFee: 50 });
  const [newCoach, setNewCoach] = useState({ name: "", bio: "", city: "", ratePerHour: 700, availability: "" });
  const [newRule, setNewRule] = useState({
    name: "",
    ruleType: "PEAK_HOUR",
    adjustment: "FIXED",
    amount: 50,
    startHour: "",
    endHour: "",
    description: "",
  });

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function refreshAll() {
    const [c, e, co, r] = await Promise.all([
      jsonFetch<{ courts: Court[] }>("/api/admin/courts"),
      jsonFetch<{ equipment: Equipment[] }>("/api/admin/equipment"),
      jsonFetch<{ coaches: Coach[] }>("/api/admin/coaches"),
      jsonFetch<{ rules: PricingRule[] }>("/api/admin/pricing-rules"),
    ]);
    setCourts(c.courts);
    setEquipment(e.equipment);
    setCoaches(co.coaches);
    setRules(r.rules);
  }

  useEffect(() => {
    // Initial load; data fetching inside effects is intentional here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshAll();
  }, []);

  async function handleCreateCourt() {
    await jsonFetch("/api/admin/courts", {
      method: "POST",
      body: JSON.stringify(newCourt),
    });
    setNewCourt({ name: "", location: "", type: "INDOOR", baseRate: 400 });
    await refreshAll();
    setMessage("Court saved.");
  }

  async function handleCreateEquipment() {
    await jsonFetch("/api/admin/equipment", {
      method: "POST",
      body: JSON.stringify(newEquip),
    });
    setNewEquip({ name: "", quantity: 1, baseFee: 50 });
    await refreshAll();
    setMessage("Equipment saved.");
  }

  async function handleCreateCoach() {
    const availability = newCoach.availability
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((chunk) => {
        const [day, start, end] = chunk.split("-").map((n) => Number(n));
        return { dayOfWeek: day, startHour: start, endHour: end };
      });

    await jsonFetch("/api/admin/coaches", {
      method: "POST",
      body: JSON.stringify({ ...newCoach, availability }),
    });
    setNewCoach({ name: "", bio: "", city: "", ratePerHour: 700, availability: "" });
    await refreshAll();
    setMessage("Coach saved.");
  }

  async function handleCreateRule() {
    await jsonFetch("/api/admin/pricing-rules", {
      method: "POST",
      body: JSON.stringify({
        ...newRule,
        amount: Number(newRule.amount),
        startHour: newRule.startHour ? Number(newRule.startHour) : null,
        endHour: newRule.endHour ? Number(newRule.endHour) : null,
      }),
    });
    setNewRule({
      name: "",
      ruleType: "PEAK_HOUR",
      adjustment: "FIXED",
      amount: 50,
      startHour: "",
      endHour: "",
      description: "",
    });
    await refreshAll();
    setMessage("Pricing rule saved.");
  }

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <header className="rounded-2xl bg-card/80 backdrop-blur-sm shadow-lg border border-border p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/" className="group flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
                  AG
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-primary font-bold">Acorn Globus</p>
                  <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                </div>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground font-medium">Manage courts, equipment, coaches, and pricing rules.</p>
          </div>
          <div className="flex items-center gap-3">
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
            <Link
              href="/"
              className="rounded-xl bg-gradient-to-r from-secondary to-primary/80 px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md hover:shadow-lg transition-all hover:scale-105"
            >
              Back to Booking
            </Link>
          </div>
        </header>

        {message && (
          <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 text-primary font-medium flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8">
          <section className="rounded-2xl bg-card border border-border shadow-sm p-6">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                Courts
              </h2>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">{courts.length} Courts</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Existing Courts</h3>
                <div className="grid gap-3">
                  {courts.map((c) => (
                    <div key={c.id} className="rounded-xl border border-border bg-muted/30 p-4 hover:border-primary/50 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-foreground">{c.name}</p>
                          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mt-1">
                            <span className="inline-block w-2 h-2 rounded-full bg-primary/50"></span>
                            {c.type} • {c.location}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                          {c.isActive ? "Active" : "Disabled"}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-primary mt-2">₹{c.baseRate}<span className="text-xs text-muted-foreground font-normal">/hr</span></p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-muted/30 p-6 rounded-xl border border-border space-y-4 h-fit">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">+</span>
                  Add New Court
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Name</label>
                    <input
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground"
                      value={newCourt.name}
                      onChange={(e) => setNewCourt((s) => ({ ...s, name: e.target.value }))}
                      placeholder="e.g. Court 1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Location</label>
                      <input
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground"
                        value={newCourt.location}
                        onChange={(e) => setNewCourt((s) => ({ ...s, location: e.target.value }))}
                        placeholder="Indiranagar"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Type</label>
                      <select
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground"
                        value={newCourt.type}
                        onChange={(e) => setNewCourt((s) => ({ ...s, type: e.target.value }))}
                      >
                        <option value="INDOOR">INDOOR</option>
                        <option value="OUTDOOR">OUTDOOR</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Base rate (₹/hr)</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground"
                      value={newCourt.baseRate}
                      onChange={(e) => setNewCourt((s) => ({ ...s, baseRate: Number(e.target.value) }))}
                    />
                  </div>
                  <button
                    onClick={handleCreateCourt}
                    className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
                  >
                    Save Court
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-card border border-border shadow-sm p-6">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Equipment
              </h2>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">{equipment.length} Items</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Inventory</h3>
                <div className="grid gap-3">
                  {equipment.map((e) => (
                    <div key={e.id} className="rounded-xl border border-border bg-muted/30 p-4 hover:border-primary/50 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-foreground">{e.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">Available Quantity: {e.quantity}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${e.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                          {e.isActive ? "Active" : "Disabled"}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-primary mt-2">₹{e.baseFee}<span className="text-xs text-muted-foreground font-normal">/unit/hr</span></p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-muted/30 p-6 rounded-xl border border-border space-y-4 h-fit">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">+</span>
                  Add Equipment
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Name</label>
                    <input
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground"
                      value={newEquip.name}
                      onChange={(e) => setNewEquip((s) => ({ ...s, name: e.target.value }))}
                      placeholder="e.g. Racket"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Quantity</label>
                      <input
                        type="number"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground"
                        value={newEquip.quantity}
                        onChange={(e) => setNewEquip((s) => ({ ...s, quantity: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Base fee (₹/hr)</label>
                      <input
                        type="number"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground"
                        value={newEquip.baseFee}
                        onChange={(e) => setNewEquip((s) => ({ ...s, baseFee: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleCreateEquipment}
                    className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
                  >
                    Save Equipment
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-card border border-border shadow-sm p-6">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                Coaches
              </h2>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">{coaches.length} Coaches</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Roster</h3>
                <div className="grid gap-3">
                  {coaches.map((c) => (
                    <div key={c.id} className="rounded-xl border border-border bg-muted/30 p-4 hover:border-primary/50 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-foreground">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.city}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                          {c.isActive ? "Active" : "Disabled"}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mt-2 line-clamp-2 italic opacity-80">"{c.bio}"</p>
                      <div className="flex justify-between items-end mt-3 pt-3 border-t border-border/50">
                        <div className="text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">Avail:</span> {c.availability.map((a) => `${a.dayOfWeek}: ${a.startHour}-${a.endHour}`).join(", ") || "—"}
                        </div>
                        <p className="text-lg font-bold text-primary">₹{c.ratePerHour}<span className="text-xs text-muted-foreground font-normal">/hr</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-muted/30 p-6 rounded-xl border border-border space-y-4 h-fit">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">+</span>
                  Add New Coach
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Name</label>
                      <input
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground"
                        value={newCoach.name}
                        onChange={(e) => setNewCoach((s) => ({ ...s, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">City</label>
                      <input
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground"
                        value={newCoach.city}
                        onChange={(e) => setNewCoach((s) => ({ ...s, city: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Bio</label>
                    <textarea
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground resize-none"
                      rows={2}
                      value={newCoach.bio}
                      onChange={(e) => setNewCoach((s) => ({ ...s, bio: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Rate (₹/hr)</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground"
                      value={newCoach.ratePerHour}
                      onChange={(e) => setNewCoach((s) => ({ ...s, ratePerHour: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Availability (day-start-end, comma sep)</label>
                    <input
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground"
                      value={newCoach.availability}
                      onChange={(e) => setNewCoach((s) => ({ ...s, availability: e.target.value }))}
                      placeholder="e.g. 1-18-22, 5-09-17"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">Format: Day(0-6)-Start(0-23)-End(0-23)</p>
                  </div>
                  <button
                    onClick={handleCreateCoach}
                    className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
                  >
                    Save Coach
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-card border border-border shadow-sm p-6">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Pricing Rules
              </h2>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">{rules.length} Rules</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Active Rules</h3>
                <div className="grid gap-3">
                  {rules.map((r) => (
                    <div key={r.id} className="rounded-xl border border-border bg-muted/30 p-4 hover:border-primary/50 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-foreground">{r.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{r.ruleType} • {r.adjustment}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                          {r.isActive ? "Active" : "Disabled"}
                        </span>
                      </div>
                      <p className="text-sm mt-3 font-medium text-foreground">
                        Amount: <span className="font-bold text-primary">{r.amount}{r.adjustment === "PERCENT" ? "%" : "₹"}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>Window: {r.startHour !== null ? `${r.startHour}:00` : "Any"} - {r.endHour !== null ? `${r.endHour}:00` : "Any"}</span>
                      </div>
                      {r.description && <p className="text-xs text-muted-foreground mt-2 italic">"{r.description}"</p>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-muted/30 p-6 rounded-xl border border-border space-y-4 h-fit">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">+</span>
                  Add Pricing Rule
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Name</label>
                    <input
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground"
                      value={newRule.name}
                      onChange={(e) => setNewRule((s) => ({ ...s, name: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Rule Type</label>
                      <select
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground"
                        value={newRule.ruleType}
                        onChange={(e) => setNewRule((s) => ({ ...s, ruleType: e.target.value }))}
                      >
                        <option value="PEAK_HOUR">PEAK_HOUR</option>
                        <option value="WEEKEND">WEEKEND</option>
                        <option value="INDOOR_PREMIUM">INDOOR_PREMIUM</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Adjustment</label>
                      <select
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground"
                        value={newRule.adjustment}
                        onChange={(e) => setNewRule((s) => ({ ...s, adjustment: e.target.value }))}
                      >
                        <option value="FIXED">FIXED</option>
                        <option value="PERCENT">PERCENT</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Amount</label>
                      <input
                        type="number"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground"
                        value={newRule.amount}
                        onChange={(e) => setNewRule((s) => ({ ...s, amount: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Start Hour</label>
                      <input
                        type="number"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground"
                        value={newRule.startHour}
                        onChange={(e) => setNewRule((s) => ({ ...s, startHour: e.target.value }))}
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">End Hour</label>
                      <input
                        type="number"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground"
                        value={newRule.endHour}
                        onChange={(e) => setNewRule((s) => ({ ...s, endHour: e.target.value }))}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
                    <textarea
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground resize-none"
                      value={newRule.description}
                      onChange={(e) => setNewRule((s) => ({ ...s, description: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  <button
                    onClick={handleCreateRule}
                    className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
                  >
                    Save Pricing Rule
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

