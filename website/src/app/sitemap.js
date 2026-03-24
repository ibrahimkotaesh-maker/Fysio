import { supabase } from '@/lib/supabase';
import { toSlug } from '@/lib/slug';
import { practiceToSlug } from '@/lib/practiceSlug';
import { articles } from '@/lib/articles';
import { aandoeningen } from '@/lib/aandoeningen';

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

    // Fetch all practices for dynamic pages (with SEO-friendly slugs)
    let allPractices = [];
    let page = 0;
    const pageSize = 1000;

    while (true) {
        const { data, error } = await supabase
            .from('practices')
            .select('google_place_id, name, city, updated_at')
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error || !data || data.length === 0) break;
        allPractices = allPractices.concat(data);
        if (data.length < pageSize) break;
        page++;
    }

    // Deduplicate slugs (same logic as practiceCache)
    const slugCount = new Map();
    const practicePages = allPractices.map((p) => {
        let baseSlug = practiceToSlug(p.name, p.city);
        if (!baseSlug) baseSlug = 'praktijk';
        const count = slugCount.get(baseSlug) || 0;
        const finalSlug = count > 0 ? `${baseSlug}-${count + 1}` : baseSlug;
        slugCount.set(baseSlug, count + 1);

        return {
            url: `${baseUrl}/praktijk/${finalSlug}`,
            lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        };
    });

    // City pages
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
        url: `${baseUrl}/stad/${toSlug(city)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

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

    return [...staticPages, ...cityPages, ...blogPages, ...specPages, ...aandoeningPages, ...practicePages];
}
