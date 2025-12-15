export type Slot = {
    startTime: string;
    availableCourts: { id: number; name: string; type: string; baseRate: number }[];
    availableCoaches: { id: number; name: string }[];
    equipmentAvailability: { id: number; name: string; available: number }[];
};

export type Pricing = {
    baseCourt: number;
    adjustments: { label: string; amount: number }[];
    equipmentTotal: number;
    coachTotal: number;
    total: number;
};

export type BookingHistory = {
    id: number;
    userName: string;
    startTime: string;
    totalPrice: number;
    courtId: number;
    reference?: string;
    court?: { name: string };
    coach?: { name: string } | null;
};
