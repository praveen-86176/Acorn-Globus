type UserDetailsFormProps = {
    userName: string;
    setUserName: (val: string) => void;
    contact: string;
    setContact: (val: string) => void;
    notes: string;
    setNotes: (val: string) => void;
    bookingLoading: boolean;
    submitBooking: () => void;
    bookingMessage: string | null;
    isValid: boolean;
    contactError: string | null;
};

export default function UserDetailsForm({
    userName,
    setUserName,
    contact,
    setContact,
    notes,
    setNotes,
    bookingLoading,
    submitBooking,
    bookingMessage,
    isValid,
    contactError,
}: UserDetailsFormProps) {
    return (
        <section className="rounded-2xl bg-card border border-border p-6 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Your Details
            </h2>
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">Full Name *</label>
                    <input
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Enter your name"
                    />
                </div>
                <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">Contact (Phone/Email) *</label>
                    <input
                        className={`w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none transition-all text-foreground ${contactError
                                ? "border-destructive focus:border-destructive focus:ring-1 focus:ring-destructive"
                                : "border-border focus:border-primary focus:ring-1 focus:ring-primary"
                            }`}
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="10-digit mobile or valid email"
                    />
                    {contactError && (
                        <p className="mt-1 text-xs text-destructive">{contactError}</p>
                    )}
                </div>
                <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">Special Requests</label>
                    <textarea
                        rows={3}
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all resize-none text-foreground"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any special requirements..."
                    />
                </div>
                <button
                    onClick={submitBooking}
                    disabled={!isValid || bookingLoading}
                    className="w-full rounded-xl bg-primary px-6 py-3.5 font-bold text-primary-foreground shadow-sm hover:opacity-90 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
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
                            ? "bg-green-500/10 text-green-600 border border-green-500/20"
                            : "bg-destructive/10 text-destructive border border-destructive/20"
                            }`}
                    >
                        {bookingMessage}
                    </div>
                )}
            </div>
        </section>
    );
}
