import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SpendProfile } from "@cardsavvy/engine";

interface FormState {
    profile: SpendProfile;
    updateMonthlySpend: (category: keyof SpendProfile["monthly"], value: number) => void;
    updatePreference: (key: keyof SpendProfile["preferences"], value: any) => void;
    reset: () => void;
}

const defaultProfile: SpendProfile = {
    monthly: {
        fuel: 0,
        groceries: 0,
        dining: 0,
        online_shopping: 0,
        travel_flights: 0,
        travel_hotels: 0,
        utilities: 0,
        ott: 0,
        other: 0,
    },
    preferences: {
        reward_type: "ANY",
        max_annual_fee: null,
        income_bracket: null,
    },
};

export const useFormStore = create<FormState>()(
    persist(
        (set) => ({
            profile: defaultProfile,
            updateMonthlySpend: (category, value) =>
                set((state) => ({
                    profile: {
                        ...state.profile,
                        monthly: {
                            ...state.profile.monthly,
                            [category]: value,
                        },
                    },
                })),
            updatePreference: (key, value) =>
                set((state) => ({
                    profile: {
                        ...state.profile,
                        preferences: {
                            ...state.profile.preferences,
                            [key]: value,
                        },
                    },
                })),
            reset: () => set({ profile: defaultProfile }),
        }),
        {
            name: "cardsavvy-spend-profile",
        }
    )
);
