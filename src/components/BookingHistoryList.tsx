import { BookingHistory } from "@/lib/types";

type BookingHistoryListProps = {
    history: BookingHistory[];
};

export default function BookingHistoryList({ history }: BookingHistoryListProps) {
    return (
        <section className="mt-6 rounded-2xl bg-card border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Recent Bookings
                </h2>
                <span className="text-xs font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    Latest {history.length}
                </span>
            </div>
            {history.length === 0 ? (
                <div className="text-center py-12 rounded-xl bg-muted/30 border-2 border-dashed border-border">
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
                            className="rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:shadow-sm transition-all"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <p className="font-bold text-foreground text-lg">{b.userName}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(b.startTime).toLocaleDateString("en-IN", {
                                            weekday: "short",
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(b.startTime).toLocaleTimeString("en-IN", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-primary">₹{b.totalPrice}</p>
                                    <p className="text-xs text-muted-foreground">{b.court?.name || `Court #${b.courtId}`}</p>
                                    {b.coach && (
                                        <p className="text-xs font-medium text-secondary-foreground mt-0.5 flex items-center justify-end gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            {b.coach.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {b.reference && (
                                <div className="mt-2 pt-2 border-t border-border">
                                    <p className="text-xs font-mono text-muted-foreground">
                                        Ref: <span className="font-semibold">{b.reference}</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
