"use client";

import { useEffect, useState } from "react";

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
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        <header>
          <p className="text-xs uppercase tracking-wide text-teal-700">Admin</p>
          <h1 className="text-3xl font-semibold">Facility configuration</h1>
          <p className="text-sm text-slate-600">Manage courts, equipment, coaches, and pricing rules.</p>
          {message && <p className="mt-2 text-sm text-teal-700">{message}</p>}
        </header>

        <section className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Courts</h2>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-2 text-sm">
              {courts.map((c) => (
                <div key={c.id} className="rounded border border-slate-200 p-3">
                  <div className="flex justify-between">
                    <p className="font-semibold">
                      {c.name} <span className="text-xs text-slate-500">({c.type})</span>
                    </p>
                    <span className="text-xs text-slate-600">{c.isActive ? "active" : "disabled"}</span>
                  </div>
                  <p className="text-xs text-slate-600">{c.location}</p>
                  <p className="text-sm mt-1">₹{c.baseRate}/hr</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm">
              <label className="text-xs font-medium text-slate-600">Name</label>
              <input
                className="rounded border border-slate-200 px-2 py-2"
                value={newCourt.name}
                onChange={(e) => setNewCourt((s) => ({ ...s, name: e.target.value }))}
              />
              <label className="text-xs font-medium text-slate-600">Location</label>
              <input
                className="rounded border border-slate-200 px-2 py-2"
                value={newCourt.location}
                onChange={(e) => setNewCourt((s) => ({ ...s, location: e.target.value }))}
              />
              <label className="text-xs font-medium text-slate-600">Type</label>
              <select
                className="rounded border border-slate-200 px-2 py-2"
                value={newCourt.type}
                onChange={(e) => setNewCourt((s) => ({ ...s, type: e.target.value }))}
              >
                <option value="INDOOR">INDOOR</option>
                <option value="OUTDOOR">OUTDOOR</option>
              </select>
              <label className="text-xs font-medium text-slate-600">Base rate (₹/hr)</label>
              <input
                type="number"
                className="rounded border border-slate-200 px-2 py-2"
                value={newCourt.baseRate}
                onChange={(e) => setNewCourt((s) => ({ ...s, baseRate: Number(e.target.value) }))}
              />
              <button
                onClick={handleCreateCourt}
                className="mt-2 w-full rounded bg-teal-600 px-4 py-2 text-white font-semibold"
              >
                Save court
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Equipment</h2>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-2 text-sm">
              {equipment.map((e) => (
                <div key={e.id} className="rounded border border-slate-200 p-3">
                  <div className="flex justify-between">
                    <p className="font-semibold">{e.name}</p>
                    <span className="text-xs text-slate-600">{e.isActive ? "active" : "disabled"}</span>
                  </div>
                  <p className="text-xs text-slate-600">Qty: {e.quantity}</p>
                  <p className="text-sm mt-1">₹{e.baseFee}/unit/hr</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm">
              <label className="text-xs font-medium text-slate-600">Name</label>
              <input
                className="rounded border border-slate-200 px-2 py-2"
                value={newEquip.name}
                onChange={(e) => setNewEquip((s) => ({ ...s, name: e.target.value }))}
              />
              <label className="text-xs font-medium text-slate-600">Quantity</label>
              <input
                type="number"
                className="rounded border border-slate-200 px-2 py-2"
                value={newEquip.quantity}
                onChange={(e) => setNewEquip((s) => ({ ...s, quantity: Number(e.target.value) }))}
              />
              <label className="text-xs font-medium text-slate-600">Base fee (₹/unit/hr)</label>
              <input
                type="number"
                className="rounded border border-slate-200 px-2 py-2"
                value={newEquip.baseFee}
                onChange={(e) => setNewEquip((s) => ({ ...s, baseFee: Number(e.target.value) }))}
              />
              <button
                onClick={handleCreateEquipment}
                className="mt-2 w-full rounded bg-teal-600 px-4 py-2 text-white font-semibold"
              >
                Save equipment
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Coaches & availability</h2>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-2 text-sm">
              {coaches.map((c) => (
                <div key={c.id} className="rounded border border-slate-200 p-3 space-y-1">
                  <div className="flex justify-between">
                    <p className="font-semibold">{c.name}</p>
                    <span className="text-xs text-slate-600">{c.isActive ? "active" : "disabled"}</span>
                  </div>
                  <p className="text-xs text-slate-600">{c.city}</p>
                  <p className="text-sm">₹{c.ratePerHour}/hr</p>
                  <p className="text-xs text-slate-600">Avail: {c.availability.map((a) => `${a.dayOfWeek}-${a.startHour}-${a.endHour}`).join(", ") || "—"}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm">
              <label className="text-xs font-medium text-slate-600">Name</label>
              <input
                className="rounded border border-slate-200 px-2 py-2"
                value={newCoach.name}
                onChange={(e) => setNewCoach((s) => ({ ...s, name: e.target.value }))}
              />
              <label className="text-xs font-medium text-slate-600">Bio</label>
              <textarea
                className="rounded border border-slate-200 px-2 py-2"
                value={newCoach.bio}
                onChange={(e) => setNewCoach((s) => ({ ...s, bio: e.target.value }))}
              />
              <label className="text-xs font-medium text-slate-600">City</label>
              <input
                className="rounded border border-slate-200 px-2 py-2"
                value={newCoach.city}
                onChange={(e) => setNewCoach((s) => ({ ...s, city: e.target.value }))}
              />
              <label className="text-xs font-medium text-slate-600">Rate (₹/hr)</label>
              <input
                type="number"
                className="rounded border border-slate-200 px-2 py-2"
                value={newCoach.ratePerHour}
                onChange={(e) => setNewCoach((s) => ({ ...s, ratePerHour: Number(e.target.value) }))}
              />
              <label className="text-xs font-medium text-slate-600">Availability (comma list day-start-end, e.g. 1-18-22,5-16-20)</label>
              <input
                className="rounded border border-slate-200 px-2 py-2"
                value={newCoach.availability}
                onChange={(e) => setNewCoach((s) => ({ ...s, availability: e.target.value }))}
              />
              <button
                onClick={handleCreateCoach}
                className="mt-2 w-full rounded bg-teal-600 px-4 py-2 text-white font-semibold"
              >
                Save coach
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Pricing rules</h2>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-2 text-sm">
              {rules.map((r) => (
                <div key={r.id} className="rounded border border-slate-200 p-3 space-y-1">
                  <div className="flex justify-between">
                    <p className="font-semibold">{r.name}</p>
                    <span className="text-xs text-slate-600">{r.isActive ? "active" : "disabled"}</span>
                  </div>
                  <p className="text-xs text-slate-600">{r.ruleType} · {r.adjustment}</p>
                  <p className="text-sm">Amount: {r.amount}</p>
                  <p className="text-xs text-slate-600">
                    Window: {r.startHour !== null ? `${r.startHour}:00` : "any"} - {r.endHour !== null ? `${r.endHour}:00` : "any"}
                  </p>
                  {r.description && <p className="text-xs text-slate-600">{r.description}</p>}
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm">
              <label className="text-xs font-medium text-slate-600">Name</label>
              <input
                className="rounded border border-slate-200 px-2 py-2"
                value={newRule.name}
                onChange={(e) => setNewRule((s) => ({ ...s, name: e.target.value }))}
              />
              <label className="text-xs font-medium text-slate-600">Rule type</label>
              <select
                className="rounded border border-slate-200 px-2 py-2"
                value={newRule.ruleType}
                onChange={(e) => setNewRule((s) => ({ ...s, ruleType: e.target.value }))}
              >
                <option value="PEAK_HOUR">PEAK_HOUR</option>
                <option value="WEEKEND">WEEKEND</option>
                <option value="INDOOR_PREMIUM">INDOOR_PREMIUM</option>
              </select>
              <label className="text-xs font-medium text-slate-600">Adjustment</label>
              <select
                className="rounded border border-slate-200 px-2 py-2"
                value={newRule.adjustment}
                onChange={(e) => setNewRule((s) => ({ ...s, adjustment: e.target.value }))}
              >
                <option value="FIXED">FIXED</option>
                <option value="PERCENT">PERCENT</option>
              </select>
              <label className="text-xs font-medium text-slate-600">Amount</label>
              <input
                type="number"
                className="rounded border border-slate-200 px-2 py-2"
                value={newRule.amount}
                onChange={(e) => setNewRule((s) => ({ ...s, amount: Number(e.target.value) }))}
              />
              <label className="text-xs font-medium text-slate-600">Start hour (optional)</label>
              <input
                type="number"
                className="rounded border border-slate-200 px-2 py-2"
                value={newRule.startHour}
                onChange={(e) => setNewRule((s) => ({ ...s, startHour: e.target.value }))}
              />
              <label className="text-xs font-medium text-slate-600">End hour (optional)</label>
              <input
                type="number"
                className="rounded border border-slate-200 px-2 py-2"
                value={newRule.endHour}
                onChange={(e) => setNewRule((s) => ({ ...s, endHour: e.target.value }))}
              />
              <label className="text-xs font-medium text-slate-600">Description</label>
              <textarea
                className="rounded border border-slate-200 px-2 py-2"
                value={newRule.description}
                onChange={(e) => setNewRule((s) => ({ ...s, description: e.target.value }))}
              />
              <button
                onClick={handleCreateRule}
                className="mt-2 w-full rounded bg-teal-600 px-4 py-2 text-white font-semibold"
              >
                Save pricing rule
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

