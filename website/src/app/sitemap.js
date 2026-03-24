import { supabase } from '@/lib/supabase';
import { toSlug } from '@/lib/slug';
import { practiceToSlug } from '@/lib/practiceSlug';
import { articles } from '@/lib/articles';
import { aandoeningen } from '@/lib/aandoeningen';

const BASE_URL = 'https://vindfysio.nl';
const PRACTICE_BATCH_SIZE = 1000;

/**
 * Generate multiple sitemaps via sitemap index.
 * ID 0 = static + blog + specializations + conditions + cities
 * ID 1..N = practice pages in batches of 1000
 */
export async function generateSitemaps() {
    // Count total practices
    const { count } = await supabase
        .from('practices')
        .select('*', { count: 'exact', head: true });

    const totalPractices = count || 0;
    const practiceSitemapCount = Math.ceil(totalPractices / PRACTICE_BATCH_SIZE);

    // ID 0 = static/blog/specs/conditions/cities, IDs 1..N = practice batches
    const ids = [{ id: 0 }];
    for (let i = 1; i <= practiceSitemapCount; i++) {
        ids.push({ id: i });
    }

    return ids;
}

export default async function sitemap({ id }) {
    // ─── Sitemap 0: Static + Blog + Specializations + Conditions + Cities ───
    if (id === 0) {
        const staticPages = [
            { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
            { url: `${BASE_URL}/zoeken`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
            { url: `${BASE_URL}/steden`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
            { url: `${BASE_URL}/over-ons`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
            { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
            { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.1 },
            { url: `${BASE_URL}/voorwaarden`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.1 },
        ];

        // Blog pages
        const blogPages = [
            { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
            ...articles.map(a => ({
                url: `${BASE_URL}/blog/${a.slug}`,
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
            { url: `${BASE_URL}/specialisaties`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
            ...SPECIALIZATIONS.map(spec => ({
                url: `${BASE_URL}/specialisatie/${toSlug(spec)}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
            })),
        ];

        // Aandoeningen pages
        const aandoeningPages = [
            { url: `${BASE_URL}/aandoeningen`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
            ...aandoeningen.map(a => ({
                url: `${BASE_URL}/aandoening/${a.slug}`,
                lastModified: new Date(a.updatedAt || new Date()),
                changeFrequency: 'monthly',
                priority: 0.7,
            })),
        ];

        // City pages
        let allCities = [];
        let page = 0;
        while (true) {
            const { data, error } = await supabase
                .from('practices')
                .select('city')
                .not('city', 'is', null)
                .neq('city', '')
                .range(page * PRACTICE_BATCH_SIZE, (page + 1) * PRACTICE_BATCH_SIZE - 1);

            if (error || !data || data.length === 0) break;
            allCities = allCities.concat(data);
            if (data.length < PRACTICE_BATCH_SIZE) break;
            page++;
        }

        const uniqueCities = [...new Set(allCities.map(r => r.city))];
        const cityPages = uniqueCities.map(city => ({
            url: `${BASE_URL}/stad/${toSlug(city)}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        }));

        return [...staticPages, ...blogPages, ...specPages, ...aandoeningPages, ...cityPages];
    }

    // ─── Sitemaps 1..N: Practice pages in batches of 1000 ───────────────────
    const batchIndex = id - 1;
    const from = batchIndex * PRACTICE_BATCH_SIZE;
    const to = from + PRACTICE_BATCH_SIZE - 1;

    const { data: practices } = await supabase
        .from('practices')
        .select('google_place_id, name, city, updated_at')
        .order('google_place_id', { ascending: true })
        .range(from, to);

    if (!practices || practices.length === 0) return [];

    // For slug deduplication within this batch we need ALL practices
    // to maintain consistent slugs with the rest of the site.
    // Fetch all practices up to and including this batch.
    let allPracticesForSlugs = [];
    let page = 0;
    while (true) {
        const { data, error } = await supabase
            .from('practices')
            .select('google_place_id, name, city, updated_at')
            .order('google_place_id', { ascending: true })
            .range(page * PRACTICE_BATCH_SIZE, (page + 1) * PRACTICE_BATCH_SIZE - 1);

        if (error || !data || data.length === 0) break;
        allPracticesForSlugs = allPracticesForSlugs.concat(data);
        if (data.length < PRACTICE_BATCH_SIZE) break;
        page++;
    }

    // Build slug map for ALL practices (needed for deduplication consistency)
    const slugCount = new Map();
    const placeIdToSlug = new Map();

    for (const p of allPracticesForSlugs) {
        let baseSlug = practiceToSlug(p.name, p.city);
        if (!baseSlug) baseSlug = 'praktijk';
        const count = slugCount.get(baseSlug) || 0;
        const finalSlug = count > 0 ? `${baseSlug}-${count + 1}` : baseSlug;
        slugCount.set(baseSlug, count + 1);
        placeIdToSlug.set(p.google_place_id, finalSlug);
    }

    // Only return entries for this batch's practices
    const batchPlaceIds = new Set(practices.map(p => p.google_place_id));

    return allPracticesForSlugs
        .filter(p => batchPlaceIds.has(p.google_place_id))
        .map(p => ({
            url: `${BASE_URL}/praktijk/${placeIdToSlug.get(p.google_place_id)}`,
            lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        }));
}
