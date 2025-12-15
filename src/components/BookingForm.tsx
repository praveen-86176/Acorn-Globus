import { Slot } from "@/lib/types";
import { useMemo } from "react";

type BookingFormProps = {
    selectedSlot: Slot | null;
    courtId: number | null;
    setCourtId: (id: number | null) => void;
    coachId: number | null;
    setCoachId: (id: number | null) => void;
    equipment: Record<number, number>;
    toggleEquipment: (id: number, qty: number) => void;
    durationHrs: number;
    setDurationHrs: (hrs: number) => void;
};

export default function BookingForm({
    selectedSlot,
    courtId,
    setCourtId,
    coachId,
    setCoachId,
    equipment,
    toggleEquipment,
    durationHrs,
    setDurationHrs,
}: BookingFormProps) {
    const availableCourtsForSlot = selectedSlot?.availableCourts ?? [];
    const availableCoachesForSlot = selectedSlot?.availableCoaches ?? [];
    const equipmentForSlot = selectedSlot?.equipmentAvailability ?? [];

    const selectedSlotLabel = useMemo(() => {
        if (!selectedSlot) return "";
        const dt = new Date(selectedSlot.startTime);
        return dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    }, [selectedSlot]);

    return (
        <section className="rounded-2xl bg-card border border-border p-6 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Booking Details
            </h2>
            {!selectedSlot ? (
                <div className="text-center py-8 rounded-xl bg-muted/30 border-2 border-dashed border-border">
                    <svg className="w-12 h-12 mx-auto text-muted-foreground mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-muted-foreground font-medium">Select a time slot to continue</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="rounded-lg bg-primary/10 p-4 border border-primary/20">
                        <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Selected Time</label>
                        <p className="text-lg font-bold text-primary mt-1">{selectedSlotLabel}</p>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-foreground mb-2 block">Court *</label>
                        <select
                            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground"
                            value={courtId ?? ""}
                            onChange={(e) => setCourtId(Number(e.target.value) || null)}
                        >
                            <option value="">Choose a court</option>
                            {availableCourtsForSlot.map((court) => (
                                <option key={court.id} value={court.id}>
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
                            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground"
                            value={coachId ?? ""}
                            onChange={(e) => setCoachId(e.target.value ? Number(e.target.value) : null)}
                        >
                            <option value="">No coach</option>
                            {availableCoachesForSlot.map((coach) => (
                                <option key={coach.id} value={coach.id}>
                                    {coach.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-foreground mb-2 block">Equipment Rental</label>
                        <div className="space-y-2">
                            {equipmentForSlot.map((item) => (
                                <div key={item.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3 hover:border-primary/50 transition-all">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{item.available} available</p>
                                    </div>
                                    <input
                                        type="number"
                                        min={0}
                                        max={item.available}
                                        value={equipment[item.id] ?? 0}
                                        onChange={(e) => toggleEquipment(item.id, Number(e.target.value))}
                                        className="w-20 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-center focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground"
                                    />
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
                                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground"
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
    );
}
