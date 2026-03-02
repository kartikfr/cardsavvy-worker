export interface SpendProfile {
    monthly: {
        fuel: number;
        groceries: number;
        dining: number;
        online_shopping: number;
        travel_flights: number;
        travel_hotels: number;
        utilities: number;
        ott: number;
        other: number;
    };
    preferences: {
        reward_type: 'CASHBACK' | 'POINTS' | 'MILES' | 'ANY';
        max_annual_fee: number | null;
        income_bracket: 'LOW' | 'MID' | 'HIGH' | null;
    };
}

export interface CardBasicInfo {
    id: string;
    name: string;
    bank_name: string;
    joining_fee: number;
    annual_fee: number;
    fee_waiver_spend?: number | null;
    reward_type: 'CASHBACK' | 'POINTS' | 'MILES';
    base_reward_rate: number;
    point_value_inr: number;
}

export interface CategoryRule {
    category: string;
    reward_rate: number;
    reward_type_override?: 'CASHBACK' | 'POINTS' | 'MILES' | null;
    point_value_override?: number | null;
}

export interface MilestoneBenefit {
    milestone_type: 'FEE_WAIVER' | 'BONUS_POINTS' | 'BONUS_VOUCHER';
    spend_threshold: number;
    threshold_period: 'YEAR' | 'QUARTER';
    benefit_points: number;
    benefit_inr_value: number;
    fee_waived_amount: number;
}

export interface CardRuleSet {
    card: CardBasicInfo;
    category_rules: CategoryRule[];
    milestones: MilestoneBenefit[];
}

export interface CardSavingResult {
    card: CardBasicInfo;
    netAnnualSaving: number;
    netFirstYearSaving: number;
    totalRewardsInr: number;
    effectiveAnnualFee: number;
    feeWaiverApplied: boolean;
    milestoneBonus: number;
    joiningFeeAmortized: number;
    categoryBreakdown: {
        category: string;
        spendAmount: number;
        pointsEarned: number;
        inrValue: number;
    }[];
}
