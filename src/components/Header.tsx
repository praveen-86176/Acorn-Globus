import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect } from "react";

type HeaderProps = {
    date: string;
    setDate: (date: string) => void;
    mounted: boolean;
};

export default function Header({ date, setDate, mounted }: HeaderProps) {
    const { theme, setTheme } = useTheme();

    return (
        <header className="mb-8 rounded-2xl bg-card/80 backdrop-blur-sm shadow-sm border border-border p-6 transition-colors">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-sm">
                            AG
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wider text-primary font-semibold">Acorn Globus</p>
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                Badminton Court Booking
                            </h1>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">📍 Bengaluru • Indoor & Outdoor Courts • Professional Coaches • Equipment Rental</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                    {mounted && (
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="p-3 rounded-xl bg-secondary text-secondary-foreground hover:opacity-80 transition-all border border-border shadow-sm"
                            aria-label="Toggle Theme"
                        >
                            {theme === "dark" ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>
                    )}
                    <div className="rounded-xl bg-card p-4 shadow-sm border border-border">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Select Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={new Date().toISOString().slice(0, 10)}
                            className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-foreground"
                        />
                    </div>
                    <Link
                        href="/admin"
                        className="self-end sm:self-auto rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-all hover:scale-105 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Admin Panel
                    </Link>
                </div>
            </div>
        </header>
    );
}
