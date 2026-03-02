import { supabase } from '@/lib/supabase';

export default async function sitemap() {
    const baseUrl = 'https://vindfysio.nl';

    // Static pages
    const staticPages = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
        { url: `${baseUrl}/zoeken`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${baseUrl}/steden`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/over-ons`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
        { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
        { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.1 },
        { url: `${baseUrl}/voorwaarden`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.1 },
    ];

    // Fetch all practices for dynamic pages
    let allPractices = [];
    let page = 0;
    const pageSize = 1000;

    while (true) {
        const { data, error } = await supabase
            .from('practices')
            .select('google_place_id, updated_at')
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error || !data || data.length === 0) break;
        allPractices = allPractices.concat(data);
        if (data.length < pageSize) break;
        page++;
    }

    const practicePages = allPractices.map((p) => ({
        url: `${baseUrl}/praktijk/${p.google_place_id}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
    }));

    // City pages (via search)
    let allCities = [];
    page = 0;
    while (true) {
        const { data, error } = await supabase
            .from('practices')
            .select('city')
            .not('city', 'is', null)
            .neq('city', '')
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error || !data || data.length === 0) break;
        allCities = allCities.concat(data);
        if (data.length < pageSize) break;
        page++;
    }

    const uniqueCities = [...new Set(allCities.map((r) => r.city))];
    const cityPages = uniqueCities.map((city) => ({
        url: `${baseUrl}/zoeken?city=${encodeURIComponent(city)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    return [...staticPages, ...practicePages, ...cityPages];
}
