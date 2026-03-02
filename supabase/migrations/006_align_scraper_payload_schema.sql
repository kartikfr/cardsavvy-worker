-- Align legacy schema from 001_initial_schema.sql with the current scraper payload.
-- This keeps backward compatibility for existing rows while allowing modern inserts.

ALTER TABLE public.card_category_rules
ADD COLUMN IF NOT EXISTS effective_rate DECIMAL(6,4),
ADD COLUMN IF NOT EXISTS multiplier DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS max_monthly_spend INTEGER;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'card_category_rules'
          AND column_name = 'reward_rate'
    ) THEN
        EXECUTE '
            UPDATE public.card_category_rules
            SET effective_rate = COALESCE(effective_rate, reward_rate)
            WHERE reward_rate IS NOT NULL
        ';

        EXECUTE '
            ALTER TABLE public.card_category_rules
            ALTER COLUMN reward_rate DROP NOT NULL
        ';
    END IF;
END $$;

ALTER TABLE public.card_milestones
ADD COLUMN IF NOT EXISTS bonus_points INTEGER,
ADD COLUMN IF NOT EXISTS bonus_cash_inr INTEGER,
ADD COLUMN IF NOT EXISTS bonus_description TEXT;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'card_milestones'
          AND column_name = 'milestone_type'
    ) THEN
        EXECUTE '
            ALTER TABLE public.card_milestones
            ALTER COLUMN milestone_type SET DEFAULT ''SPEND_BONUS''
        ';

        EXECUTE '
            ALTER TABLE public.card_milestones
            ALTER COLUMN milestone_type DROP NOT NULL
        ';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'card_milestones'
          AND column_name = 'benefit_points'
    ) THEN
        EXECUTE '
            UPDATE public.card_milestones
            SET bonus_points = COALESCE(bonus_points, benefit_points, 0)
        ';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'card_milestones'
          AND column_name = 'benefit_inr_value'
    ) THEN
        EXECUTE '
            UPDATE public.card_milestones
            SET bonus_cash_inr = COALESCE(bonus_cash_inr, benefit_inr_value, 0)
        ';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'card_milestones'
          AND column_name = 'description'
    ) THEN
        EXECUTE '
            UPDATE public.card_milestones
            SET bonus_description = COALESCE(bonus_description, description)
        ';
    END IF;
END $$;
