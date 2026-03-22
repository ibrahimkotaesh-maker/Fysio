import { supabase } from '@/lib/supabase';
import { practiceToSlug } from '@/lib/practiceSlug';

/**
 * Shared cache: fetches ALL practices once and builds a slug→practice map.
 * Used by both generateStaticParams and the page itself during build.
 * At runtime (ISR/SSR), individual lookups are used instead.
 */
let _cache = null;

export async function getAllPractices() {
    if (_cache) return _cache;

    let allPractices = [];
    let page = 0;
    const pageSize = 1000;

    while (true) {
        const { data, error } = await supabase
            .from('practices')
            .select('*')
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error || !data || data.length === 0) break;
        allPractices = allPractices.concat(data);
        if (data.length < pageSize) break;
        page++;
    }

    // Build slug map with deduplication
    const slugCount = new Map();
    const slugMap = new Map();     // slug → practice
    const placeIdMap = new Map();  // google_place_id → slug

    for (const p of allPractices) {
        let baseSlug = practiceToSlug(p.name, p.city);
        if (!baseSlug) baseSlug = 'praktijk';

        const count = slugCount.get(baseSlug) || 0;
        const finalSlug = count > 0 ? `${baseSlug}-${count + 1}` : baseSlug;
        slugCount.set(baseSlug, count + 1);

        slugMap.set(finalSlug, p);
        placeIdMap.set(p.google_place_id, finalSlug);
    }

    _cache = { practices: allPractices, slugMap, placeIdMap };
    return _cache;
}
