import { supabase } from '@/lib/supabase';
import { toSlug } from '@/lib/slug';
import { articles } from '@/lib/articles';
import { aandoeningen } from '@/lib/aandoeningen';
import { getAllPractices } from '@/lib/practiceCache';

const PRACTICE_CHUNK_SIZE = 500;

/**
 * Next.js sitemap index: generates multiple sitemaps.
 * Sitemap 0: static pages, blog, specializations, diseases
 * Sitemap 1..N: practice pages in chunks of 500
 */
export async function generateSitemaps() {
    const { practices } = await getAllPractices();
    const practiceChunks = Math.ceil(practices.length / PRACTICE_CHUNK_SIZE);
    // sitemap 0 = static content, 1..N = practices
    const ids = [];
    for (let i = 0; i <= practiceChunks; i++) {
        ids.push({ id: i });
    }
    return ids;
}

export default async function sitemap({ id }) {
    const baseUrl = 'https://vindfysio.nl';

    // Sitemap 0: static pages, blog, specializations, diseases, cities
    if (id === 0) {
        const staticPages = [
            { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
            { url: `${baseUrl}/zoeken`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
            { url: `${baseUrl}/steden`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
            { url: `${baseUrl}/over-ons`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
            { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
            { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.1 },
            { url: `${baseUrl}/voorwaarden`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.1 },
        ];

        // Blog pages
        const blogPages = [
            { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
            ...articles.map(a => ({
                url: `${baseUrl}/blog/${a.slug}`,
                lastModified: new Date(a.updatedAt),
                changeFrequency: 'monthly',
                priority: 0.7,
            })),
        ];

        // Specialization pages
        const SPECIALIZATIONS = [
            'manuele therapie', 'revalidatie', 'dry needling', 'sportfysiotherapie',
            'ademhalingstherapie', 'medical taping', 'neurologische fysiotherapie',
            'echografie', 'schouder specialist', 'lymfedrainage', 'kinderfysiotherapie',
            'shockwave therapie', 'fysiotherapie aan huis', 'bekkenfysiotherapie',
            'geriatrie fysiotherapie', 'personal training', 'psychosomatische fysiotherapie',
            'fysiofitness', 'oncologische fysiotherapie', 'triggerpoint therapie',
            'knie specialist', 'kaakfysiotherapie', 'looptraining', 'bindweefsel therapie',
            'rugpijn specialist', 'BFR training', 'nekpijn specialist',
        ];

        const specPages = [
            { url: `${baseUrl}/specialisaties`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
            ...SPECIALIZATIONS.map(spec => ({
                url: `${baseUrl}/specialisatie/${toSlug(spec)}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
            })),
        ];

        // Aandoeningen pages
        const aandoeningPages = [
            { url: `${baseUrl}/aandoeningen`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
            ...aandoeningen.map(a => ({
                url: `${baseUrl}/aandoening/${a.slug}`,
                lastModified: new Date(a.updatedAt || new Date()),
                changeFrequency: 'monthly',
                priority: 0.7,
            })),
        ];

        // City pages
        let allCities = [];
        let page = 0;
        const pageSize = 1000;
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

        const uniqueCities = [...new Set(allCities.map(r => r.city))];
        const cityPages = uniqueCities.map(city => ({
            url: `${baseUrl}/stad/${toSlug(city)}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        }));

        return [...staticPages, ...blogPages, ...specPages, ...aandoeningPages, ...cityPages];
    }

    // Sitemaps 1..N: practice chunks with SEO-friendly slugs
    const { practices, placeIdMap } = await getAllPractices();
    const chunkIndex = id - 1; // id=1 → chunk 0
    const start = chunkIndex * PRACTICE_CHUNK_SIZE;
    const end = Math.min(start + PRACTICE_CHUNK_SIZE, practices.length);
    const chunk = practices.slice(start, end);

    return chunk.map(p => {
        const slug = placeIdMap.get(p.google_place_id) || p.google_place_id;
        return {
            url: `${baseUrl}/praktijk/${slug}`,
            lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        };
    });
}
