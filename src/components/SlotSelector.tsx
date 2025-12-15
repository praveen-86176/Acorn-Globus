import { Slot } from "@/lib/types";

type SlotSelectorProps = {
    slots: Slot[];
    loadingSlots: boolean;
    selectedSlot: Slot | null;
    setSelectedSlot: (slot: Slot) => void;
};

export default function SlotSelector({ slots, loadingSlots, selectedSlot, setSelectedSlot }: SlotSelectorProps) {

    return (
        <section className="lg:col-span-2 rounded-2xl bg-card border border-border p-6 shadow-sm">
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
                <div className="text-center py-12 rounded-xl bg-muted/30 border-2 border-dashed border-border">
                    <p className="text-muted-foreground font-medium">No slots available for this date</p>
                    <p className="text-sm text-muted-foreground mt-1">Try selecting another date</p>
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
                            className={`rounded-xl border px-4 py-3 text-left transition-all transform hover:scale-105 ${isSelected
                                ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
                                : isFull
                                    ? "border-border bg-muted opacity-60 cursor-not-allowed"
                                    : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
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
    );
}
