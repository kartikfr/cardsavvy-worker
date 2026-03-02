export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            cards: {
                Row: {
                    id: string
                    slug: string
                    name: string
                    bank_name: string
                    network: string
                    card_tier: string
                    joining_fee: number
                    annual_fee: number
                    fee_waiver_spend: number | null
                    fee_waiver_type: string | null
                    reward_type: string
                    reward_currency_name: string | null
                    base_reward_rate: number
                    point_value_inr: number
                    image_url: string | null
                    card_page_url: string | null
                    affiliate_url: string | null
                    earnkaro_id: string | null
                    is_active: boolean
                    is_featured: boolean
                    last_crawled_at: string | null
                    last_verified_at: string | null
                    crawl_source_url: string | null
                    created_at: string
                    updated_at: string
                }
            }
        }
    }
}
