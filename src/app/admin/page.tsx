"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";

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
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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

  async function refreshAll() {
    try {
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
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    refreshAll();
  }, []);

  async function handleCreateCourt() {
    try {
      await jsonFetch("/api/admin/courts", {
        method: "POST",
        body: JSON.stringify(newCourt),
      });
      setNewCourt({ name: "", location: "", type: "INDOOR", baseRate: 400 });
      await refreshAll();
      setMessage("Court saved.");
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error(error);
      setMessage("Error saving court.");
    }
  }

  async function handleCreateEquipment() {
    try {
      await jsonFetch("/api/admin/equipment", {
        method: "POST",
        body: JSON.stringify(newEquip),
      });
      setNewEquip({ name: "", quantity: 1, baseFee: 50 });
      await refreshAll();
      setMessage("Equipment saved.");
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error(error);
      setMessage("Error saving equipment.");
    }
  }

  async function handleCreateCoach() {
    try {
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
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error(error);
      setMessage("Error saving coach.");
    }
  }

  async function handleCreateRule() {
    try {
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
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error(error);
      setMessage("Error saving pricing rule.");
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors selection:bg-primary/20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <header className="rounded-2xl bg-card border border-border p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Admin Dashboard</p>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Facility Configuration</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your sports facility resources and settings.</p>
            {message && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-1 text-sm font-medium text-green-600 border border-green-500/20">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {message}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-secondary"
            >
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Booking
            </Link>
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-105 active:scale-95 transition-all border border-border shadow-sm"
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? (
                  <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Courts Section */}
          <section className="rounded-2xl bg-card border border-border p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </span>
                Courts
              </h2>
              <span className="text-xs font-medium bg-secondary px-2.5 py-1 rounded-full text-secondary-foreground">{courts.length} Active</span>
            </div>

            <div className="space-y-6">
              <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {courts.map((c) => (
                  <div key={c.id} className="group flex items-center justify-between rounded-xl border border-border p-4 bg-background/50 hover:bg-background hover:border-primary/30 transition-all">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-foreground">{c.name}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide font-bold ${c.isActive ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                          {c.isActive ? "Active" : "Disabled"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          {c.location}
                        </span>
                        <span>•</span>
                        <span>{c.type}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">₹{c.baseRate}<span className="text-xs text-muted-foreground font-normal">/hr</span></p>
                    </div>
                  </div>
                ))}
                {!courts.length && <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">No courts found</div>}
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <p className="text-sm font-semibold text-foreground">Add New Court</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Name</label>
                    <input
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                      placeholder="e.g. Court A"
                      value={newCourt.name}
                      onChange={(e) => setNewCourt((s) => ({ ...s, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Location</label>
                    <input
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                      placeholder="e.g. North Wing"
                      value={newCourt.location}
                      onChange={(e) => setNewCourt((s) => ({ ...s, location: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Type</label>
                    <select
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                      value={newCourt.type}
                      onChange={(e) => setNewCourt((s) => ({ ...s, type: e.target.value }))}
                    >
                      <option value="INDOOR">INDOOR</option>
                      <option value="OUTDOOR">OUTDOOR</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Base Rate (₹)</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                      value={newCourt.baseRate}
                      onChange={(e) => setNewCourt((s) => ({ ...s, baseRate: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                <button
                  onClick={handleCreateCourt}
                  disabled={!newCourt.name || !newCourt.location}
                  className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Court
                </button>
              </div>
            </div>
          </section>

          {/* Equipment Section */}
          <section className="rounded-2xl bg-card border border-border p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                Equipment
              </h2>
              <span className="text-xs font-medium bg-secondary px-2.5 py-1 rounded-full text-secondary-foreground">{equipment.length} Items</span>
            </div>

            <div className="space-y-6">
              <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {equipment.map((e) => (
                  <div key={e.id} className="group flex items-center justify-between rounded-xl border border-border p-4 bg-background/50 hover:bg-background hover:border-primary/30 transition-all">
                    <div>
                      <p className="font-bold text-foreground">{e.name}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Qty: {e.quantity}</span>
                        <span>•</span>
                        <span className={`${e.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {e.isActive ? "Available" : "Unavailable"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">₹{e.baseFee}<span className="text-xs text-muted-foreground font-normal">/hr</span></p>
                    </div>
                  </div>
                ))}
                {!equipment.length && <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">No equipment found</div>}
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <p className="text-sm font-semibold text-foreground">Add New Equipment</p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-3 lg:col-span-1 space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Name</label>
                    <input
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                      placeholder="e.g. Racket"
                      value={newEquip.name}
                      onChange={(e) => setNewEquip((s) => ({ ...s, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Quantity</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                      value={newEquip.quantity}
                      onChange={(e) => setNewEquip((s) => ({ ...s, quantity: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Fee (₹)</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                      value={newEquip.baseFee}
                      onChange={(e) => setNewEquip((s) => ({ ...s, baseFee: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                <button
                  onClick={handleCreateEquipment}
                  disabled={!newEquip.name}
                  className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Equipment
                </button>
              </div>
            </div>
          </section>

          {/* Coaches Section */}
          <section className="rounded-2xl bg-card border border-border p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                Coaches
              </h2>
              <span className="text-xs font-medium bg-secondary px-2.5 py-1 rounded-full text-secondary-foreground">{coaches.length} Staff</span>
            </div>

            <div className="space-y-6">
              <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {coaches.map((c) => (
                  <div key={c.id} className="group flex flex-col rounded-xl border border-border p-4 bg-background/50 hover:bg-background hover:border-primary/30 transition-all">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-foreground">{c.name}</p>
                      <p className="text-sm font-bold text-primary">₹{c.ratePerHour}/hr</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{c.bio || "No bio available"}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="bg-secondary px-2 py-0.5 rounded text-secondary-foreground">{c.city}</span>
                      <span className="bg-secondary px-2 py-0.5 rounded text-secondary-foreground">
                        {c.availability.length ? `${c.availability.length} slots` : 'No availability'}
                      </span>
                    </div>
                  </div>
                ))}
                {!coaches.length && <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">No coaches found</div>}
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <p className="text-sm font-semibold text-foreground">Add New Coach</p>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    placeholder="Name"
                    value={newCoach.name}
                    onChange={(e) => setNewCoach((s) => ({ ...s, name: e.target.value }))}
                  />
                  <input
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    placeholder="City"
                    value={newCoach.city}
                    onChange={(e) => setNewCoach((s) => ({ ...s, city: e.target.value }))}
                  />
                  <input
                    type="number"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    placeholder="Rate/hr"
                    value={newCoach.ratePerHour}
                    onChange={(e) => setNewCoach((s) => ({ ...s, ratePerHour: Number(e.target.value) }))}
                  />
                  <input
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    placeholder="Avail: 1-9-17, 2-10-18..."
                    value={newCoach.availability}
                    onChange={(e) => setNewCoach((s) => ({ ...s, availability: e.target.value }))}
                  />
                  <textarea
                    rows={2}
                    className="col-span-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all resize-none"
                    placeholder="Bio"
                    value={newCoach.bio}
                    onChange={(e) => setNewCoach((s) => ({ ...s, bio: e.target.value }))}
                  />
                </div>
                <button
                  onClick={handleCreateCoach}
                  disabled={!newCoach.name}
                  className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Coach
                </button>
              </div>
            </div>
          </section>

          {/* Pricing Rules Section */}
          <section className="rounded-2xl bg-card border border-border p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                Pricing Rules
              </h2>
              <span className="text-xs font-medium bg-secondary px-2.5 py-1 rounded-full text-secondary-foreground">{rules.length} Active</span>
            </div>

            <div className="space-y-6">
              <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {rules.map((r) => (
                  <div key={r.id} className="group rounded-xl border border-border p-4 bg-background/50 hover:bg-background hover:border-primary/30 transition-all">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-foreground">{r.name}</p>
                      <span className="text-xs font-mono bg-secondary px-2 py-0.5 rounded">{r.ruleType}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className={`font-semibold ${r.adjustment === 'PERCENT' ? 'text-blue-600' : 'text-purple-600'}`}>
                        {r.adjustment === 'PERCENT' ? `+${r.amount}%` : `+₹${r.amount}`}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {r.startHour !== null ? `${r.startHour}:00` : "Any"} - {r.endHour !== null ? `${r.endHour}:00` : "Any"}
                      </span>
                    </div>
                    {r.description && <p className="mt-2 text-xs text-muted-foreground">{r.description}</p>}
                  </div>
                ))}
                {!rules.length && <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">No rules defined</div>}
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <p className="text-sm font-semibold text-foreground">Add New Rule</p>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    className="col-span-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    placeholder="Rule Name"
                    value={newRule.name}
                    onChange={(e) => setNewRule((s) => ({ ...s, name: e.target.value }))}
                  />
                  <select
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    value={newRule.ruleType}
                    onChange={(e) => setNewRule((s) => ({ ...s, ruleType: e.target.value }))}
                  >
                    <option value="PEAK_HOUR">Peak Hour</option>
                    <option value="WEEKEND">Weekend</option>
                    <option value="INDOOR_PREMIUM">Indoor Premium</option>
                  </select>
                  <div className="flex gap-2">
                    <select
                      className="w-1/2 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                      value={newRule.adjustment}
                      onChange={(e) => setNewRule((s) => ({ ...s, adjustment: e.target.value }))}
                    >
                      <option value="FIXED">Flat (₹)</option>
                      <option value="PERCENT">% Rate</option>
                    </select>
                    <input
                      type="number"
                      className="w-1/2 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                      placeholder="Amt"
                      value={newRule.amount}
                      onChange={(e) => setNewRule((s) => ({ ...s, amount: Number(e.target.value) }))}
                    />
                  </div>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    placeholder="Start Hr"
                    value={newRule.startHour}
                    onChange={(e) => setNewRule((s) => ({ ...s, startHour: e.target.value }))}
                  />
                  <input
                    type="number"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    placeholder="End Hr"
                    value={newRule.endHour}
                    onChange={(e) => setNewRule((s) => ({ ...s, endHour: e.target.value }))}
                  />
                  <textarea
                    rows={1}
                    className="col-span-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all resize-none"
                    placeholder="Description (Optional)"
                    value={newRule.description}
                    onChange={(e) => setNewRule((s) => ({ ...s, description: e.target.value }))}
                  />
                </div>
                <button
                  onClick={handleCreateRule}
                  disabled={!newRule.name}
                  className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Rule
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
