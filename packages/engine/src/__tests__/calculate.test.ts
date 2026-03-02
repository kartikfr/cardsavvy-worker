import { describe, it, expect } from 'vitest';
import { calculateCardSaving, rankCards } from '../calculate';
import { SpendProfile, CardRuleSet } from '../types';

describe('Calculation Engine', () => {
    const mockProfile: SpendProfile = {
        monthly: {
            fuel: 5000,
            groceries: 10000,
            dining: 5000,
            online_shopping: 5000,
            travel_flights: 0,
            travel_hotels: 0,
            utilities: 2000,
            ott: 1000,
            other: 2000
        },
        preferences: {
            reward_type: 'ANY',
            max_annual_fee: null,
            income_bracket: 'MID'
        }
    };

    const mockCard: CardRuleSet = {
        card: {
            id: '1',
            name: 'Test Cashback Card',
            bank_name: 'Test Bank',
            joining_fee: 500,
            annual_fee: 1000,
            fee_waiver_spend: 100000,
            reward_type: 'CASHBACK',
            base_reward_rate: 0.01,
            point_value_inr: 1
        },
        category_rules: [
            {
                category: 'groceries',
                reward_rate: 0.05
            }
        ],
        milestones: [
            {
                milestone_type: 'BONUS_VOUCHER',
                spend_threshold: 200000,
                threshold_period: 'YEAR',
                benefit_points: 0,
                benefit_inr_value: 1000,
                fee_waived_amount: 0
            }
        ]
    };

    it('calculates net savings correctly', () => {
        const result = calculateCardSaving(mockProfile, mockCard);

        expect(result.totalRewardsInr).toBe(8400);
        expect(result.effectiveAnnualFee).toBe(0);
        expect(result.feeWaiverApplied).toBe(true);
        expect(result.milestoneBonus).toBe(1000);
        expect(result.netAnnualSaving).toBe(9400);
        expect(result.netFirstYearSaving).toBe(8900);
    });

    it('ranks cards correctly based on net annual saving', () => {
        const worseCard: CardRuleSet = {
            ...mockCard,
            card: { ...mockCard.card, base_reward_rate: 0.005, name: 'Worse Card' },
            category_rules: []
        };

        const ranked = rankCards(mockProfile, [worseCard, mockCard]);
        expect(ranked[0].card.name).toBe('Test Cashback Card');
        expect(ranked[1].card.name).toBe('Worse Card');
        expect(ranked[0].rank).toBe(1);
        expect(ranked[1].rank).toBe(2);
    });
});
