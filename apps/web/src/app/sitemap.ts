import { MetadataRoute } from 'next'
import { createClient } from "@/lib/supabase/server"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = await createClient();

    // Base static routes
    const routes: MetadataRoute.Sitemap = [
        {
            url: 'https://cardsavvy.in',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: 'https://cardsavvy.in/find-my-card',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
    ];

    // Dynamically fetch all active cards for individual SEO pages
    const { data: cards } = await supabase
        .from("cards")
        .select("slug, updated_at")
        .eq("is_active", true);

    if (cards) {
        const cardRoutes = cards.map((card) => ({
            url: `https://cardsavvy.in/card/${card.slug}`,
            lastModified: new Date(card.updated_at),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));
        routes.push(...cardRoutes);
    }

    return routes;
}
