import { Pricing } from "@/lib/types";

type PriceBreakdownProps = {
    quoteLoading: boolean;
    pricing: Pricing | null;
    durationHrs: number;
};

export default function PriceBreakdown({ quoteLoading, pricing, durationHrs }: PriceBreakdownProps) {
    return (
        <section className="lg:col-span-2 rounded-2xl bg-card border border-border p-6 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="text-center py-8 rounded-xl bg-muted/30 border-2 border-dashed border-border">
                    <p className="text-sm text-muted-foreground font-medium">Select a court to see pricing</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="rounded-lg bg-muted/50 p-4 space-y-2">
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
                    <div className="flex justify-between items-center rounded-xl bg-primary p-4 text-primary-foreground">
                        <span className="text-lg font-bold">Total Amount</span>
                        <span className="text-2xl font-bold">₹{pricing.total}</span>
                    </div>
                </div>
            )}
        </section>
    );
}
