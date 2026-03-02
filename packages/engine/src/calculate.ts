import { SpendProfile, CardRuleSet, CardSavingResult, CategoryRule } from './types';

const SPEND_CATEGORIES = [
    'fuel',
    'groceries',
    'dining',
    'online_shopping',
    'travel_flights',
    'travel_hotels',
    'utilities',
    'ott',
    'other'
] as const;

function getRuleForCategory(rules: CategoryRule[], category: string): CategoryRule | undefined {
    return rules.find(r => r.category.toLowerCase() === category.toLowerCase());
}

export function calculateCardSaving(
    profile: SpendProfile,
    cardRuleSet: CardRuleSet
): CardSavingResult {

    const annualSpend = (Object.keys(profile.monthly) as (keyof SpendProfile['monthly'])[]).reduce((acc, cat) => {
        acc[cat] = profile.monthly[cat] * 12;
        return acc;
    }, {} as SpendProfile['monthly']);

    const totalAnnualSpend = Object.values(annualSpend).reduce((sum, val) => sum + val, 0);

    let totalRewardPoints = 0;
    let totalRewardsInr = 0;
    const categoryBreakdown = [];

    for (const category of SPEND_CATEGORIES) {
        const spendAmount = annualSpend[category] || 0;
        const rule = getRuleForCategory(cardRuleSet.category_rules, category);

        const rate = rule?.reward_rate ?? cardRuleSet.card.base_reward_rate;
        const pointsEarned = spendAmount * rate;

        const pointValue = rule?.point_value_override ?? cardRuleSet.card.point_value_inr;
        const inrValue = pointsEarned * pointValue;

        totalRewardPoints += pointsEarned;
        totalRewardsInr += inrValue;

        categoryBreakdown.push({ category, spendAmount, pointsEarned, inrValue });
    }

    let effectiveAnnualFee = cardRuleSet.card.annual_fee;
    let feeWaiverApplied = false;

    const feeWaiverMilestone = cardRuleSet.milestones.find(
        m => m.milestone_type === 'FEE_WAIVER'
    );

    if (feeWaiverMilestone) {
        const relevantSpend = feeWaiverMilestone.threshold_period === 'QUARTER'
            ? totalAnnualSpend / 4
            : totalAnnualSpend;

        if (relevantSpend >= feeWaiverMilestone.spend_threshold) {
            effectiveAnnualFee -= feeWaiverMilestone.fee_waived_amount;
            effectiveAnnualFee = Math.max(0, effectiveAnnualFee);
            feeWaiverApplied = true;
        }
    } else if (cardRuleSet.card.fee_waiver_spend && totalAnnualSpend >= cardRuleSet.card.fee_waiver_spend) {
        effectiveAnnualFee = 0;
        feeWaiverApplied = true;
    }

    let milestoneBonus = 0;
    for (const milestone of cardRuleSet.milestones) {
        if (milestone.milestone_type === 'BONUS_POINTS') {
            const relevantSpend = milestone.threshold_period === 'QUARTER' ? totalAnnualSpend / 4 : totalAnnualSpend;
            if (relevantSpend >= milestone.spend_threshold) {
                milestoneBonus += milestone.benefit_points * cardRuleSet.card.point_value_inr;
            }
        }
        if (milestone.milestone_type === 'BONUS_VOUCHER') {
            const relevantSpend = milestone.threshold_period === 'QUARTER' ? totalAnnualSpend / 4 : totalAnnualSpend;
            if (relevantSpend >= milestone.spend_threshold) {
                milestoneBonus += milestone.benefit_inr_value;
            }
        }
    }

    const joiningFeeAmortized = cardRuleSet.card.joining_fee;

    const netAnnualSaving = totalRewardsInr + milestoneBonus - effectiveAnnualFee;
    const netFirstYearSaving = netAnnualSaving - joiningFeeAmortized;

    return {
        card: cardRuleSet.card,
        netAnnualSaving,
        netFirstYearSaving,
        totalRewardsInr,
        effectiveAnnualFee,
        feeWaiverApplied,
        milestoneBonus,
        joiningFeeAmortized,
        categoryBreakdown,
    };
}

export function rankCards(
    profile: SpendProfile,
    allCardRuleSets: CardRuleSet[]
) {
    const feeFiltered = allCardRuleSets.filter(c => {
        if (profile.preferences.max_annual_fee === null) return true;
        const estimatedAnnualSpend = Object.values(profile.monthly).reduce((a, b) => a + b, 0) * 12;
        return c.card.annual_fee <= profile.preferences.max_annual_fee || (c.card.fee_waiver_spend && estimatedAnnualSpend >= c.card.fee_waiver_spend);
    });

    const typeFiltered = profile.preferences.reward_type === 'ANY'
        ? feeFiltered
        : feeFiltered.filter(c => c.card.reward_type === profile.preferences.reward_type);

    const results = typeFiltered.map(card => calculateCardSaving(profile, card));
    results.sort((a, b) => b.netAnnualSaving - a.netAnnualSaving);

    return results.map((result, index) => ({
        ...result,
        rank: index + 1
    }));
}
