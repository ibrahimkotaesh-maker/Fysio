/**
 * Bulk URL Indexing Script
 * 
 * Submits URLs to:
 * 1. IndexNow (Bing, Yandex, Seznam, Naver) — instant
 * 2. Google Ping (sitemap notification)
 * 
 * Usage:
 *   node submit_urls.js                → submit ALL practice + city + blog URLs
 *   node submit_urls.js --priority     → submit only high-priority pages (cities, blog, static)
 *   node submit_urls.js --test         → dry run, show what would be submitted
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://wxdwpnuxxcpsfgjfmxax.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZHdwbnV4eGNwc2ZnamZteGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NzU1MDcsImV4cCI6MjA4NzI1MTUwN30.WgfkMMHrg8adsz8iPfqRA66toy6Qi4hOiEw6unRFPPs'
);

const BASE_URL = 'https://vindfysio.nl';
const INDEXNOW_KEY = '3976b4a6ec74e64fb4fcb8698dcfec3d';

// ─── Static/Blog Pages ──────────────────────────────────────────────────────
const STATIC_PAGES = [
    '/',
    '/zoeken',
    '/steden',
    '/blog',
    '/over-ons',
    '/contact',
];

const BLOG_SLUGS = [
    'wat-kost-fysiotherapie',
    'fysiotherapie-vergoeding-zorgverzekering',
    'fysiotherapie-zonder-verwijzing',
    'verschil-fysiotherapie-manuele-therapie',
    'wanneer-naar-fysiotherapeut',
];

// ─── Fetch Dynamic URLs ─────────────────────────────────────────────────────

function toSlug(cityName) {
    return cityName
        .toLowerCase()
        .replace(/[''`]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function practiceToSlug(name, city) {
    const raw = `${name || 'praktijk'} ${city || ''}`.trim();
    return raw
        .toLowerCase()
        .replace(/[''`]/g, '')
        .replace(/ë/g, 'e').replace(/é/g, 'e').replace(/è/g, 'e')
        .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ä/g, 'a')
        .replace(/ï/g, 'i').replace(/ñ/g, 'n')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 80);
}

async function getCityUrls() {
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

    const unique = [...new Set(allCities.map(r => r.city))];
    return unique.map(city => `/stad/${toSlug(city)}`);
}

async function getPracticeUrls() {
    let allPractices = [];
    let page = 0;
    const pageSize = 1000;

    while (true) {
        const { data, error } = await supabase
            .from('practices')
            .select('name, city')
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error || !data || data.length === 0) break;
        allPractices = allPractices.concat(data);
        if (data.length < pageSize) break;
        page++;
    }

    // Deduplicate slugs (same logic as practiceCache.js)
    const slugCount = new Map();
    return allPractices.map(p => {
        let baseSlug = practiceToSlug(p.name, p.city);
        if (!baseSlug) baseSlug = 'praktijk';
        const count = slugCount.get(baseSlug) || 0;
        const finalSlug = count > 0 ? `${baseSlug}-${count + 1}` : baseSlug;
        slugCount.set(baseSlug, count + 1);
        return `/praktijk/${finalSlug}`;
    });
}

// ─── IndexNow Submission ────────────────────────────────────────────────────

async function submitToIndexNow(urls) {
    // IndexNow accepts max 10,000 URLs per batch
    const batchSize = 10000;
    let totalSubmitted = 0;

    // Submit to both Bing and Yandex
    const engines = [
        { name: 'Bing', url: 'https://www.bing.com/indexnow' },
        { name: 'Yandex', url: 'https://yandex.com/indexnow' },
    ];

    for (const engine of engines) {
        for (let i = 0; i < urls.length; i += batchSize) {
            const batch = urls.slice(i, i + batchSize);
            const fullUrls = batch.map(u => u.startsWith('http') ? u : `${BASE_URL}${u}`);

            const body = {
                host: 'vindfysio.nl',
                key: INDEXNOW_KEY,
                keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
                urlList: fullUrls,
            };

            try {
                const res = await fetch(engine.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });

                if (res.ok || res.status === 200 || res.status === 202) {
                    console.log(`   ✅ ${engine.name}: submitted batch ${Math.floor(i / batchSize) + 1} (${batch.length} URLs) — status ${res.status}`);
                    totalSubmitted += batch.length;
                } else {
                    const text = await res.text().catch(() => '');
                    console.log(`   ⚠️  ${engine.name}: batch ${Math.floor(i / batchSize) + 1} — status ${res.status} ${text.substring(0, 100)}`);
                }
            } catch (err) {
                console.log(`   ❌ ${engine.name} error: ${err.message}`);
            }
        }
    }

    return totalSubmitted;
}

// ─── Google Sitemap Ping ────────────────────────────────────────────────────

async function pingGoogle() {
    try {
        const res = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(BASE_URL + '/sitemap.xml')}`);
        console.log(`   ✅ Google Ping: status ${res.status}`);
        return true;
    } catch (err) {
        console.log(`   ❌ Google Ping failed: ${err.message}`);
        return false;
    }
}

// ─── Bing Webmaster Ping ────────────────────────────────────────────────────

async function pingBing() {
    try {
        const res = await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(BASE_URL + '/sitemap.xml')}`);
        console.log(`   ✅ Bing Ping: status ${res.status}`);
        return true;
    } catch (err) {
        console.log(`   ❌ Bing Ping failed: ${err.message}`);
        return false;
    }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
    const args = process.argv.slice(2);
    const priorityOnly = args.includes('--priority');
    const testMode = args.includes('--test');

    console.log('🚀 Bulk URL Indexing Submission');
    console.log(`   Mode: ${testMode ? 'TEST (dry run)' : priorityOnly ? 'PRIORITY' : 'FULL'}`);
    console.log('');

    // Build URL list
    let urls = [...STATIC_PAGES, ...BLOG_SLUGS.map(s => `/blog/${s}`)];

    console.log('📊 Fetching URLs...');
    const cityUrls = await getCityUrls();
    console.log(`   Cities: ${cityUrls.length}`);
    urls = urls.concat(cityUrls);

    if (!priorityOnly) {
        const practiceUrls = await getPracticeUrls();
        console.log(`   Practices: ${practiceUrls.length}`);
        urls = urls.concat(practiceUrls);
    }

    console.log(`\n📋 Total URLs to submit: ${urls.length}\n`);

    if (testMode) {
        console.log('Preview (first 20):');
        urls.slice(0, 20).forEach(u => console.log(`  ${BASE_URL}${u}`));
        if (urls.length > 20) console.log(`  ... and ${urls.length - 20} more`);
        return;
    }

    // 1. Submit to IndexNow (Bing, Yandex, etc.)
    console.log('1️⃣  Submitting to IndexNow (Bing, Yandex, Seznam, Naver)...');
    const indexNowCount = await submitToIndexNow(urls);

    // 2. Ping Google
    console.log('\n2️⃣  Pinging Google sitemap...');
    await pingGoogle();

    // 3. Ping Bing
    console.log('\n3️⃣  Pinging Bing sitemap...');
    await pingBing();

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`✅ Done!`);
    console.log(`   IndexNow: ${indexNowCount} URLs submitted`);
    console.log(`   Google: sitemap pinged`);
    console.log(`   Bing: sitemap pinged`);
    console.log(`\n💡 Tips for faster Google indexing:`);
    console.log(`   1. In Search Console → URL Inspection → paste important URLs → "Request Indexing"`);
    console.log(`   2. Use Google Search Console API for programmatic inspection requests`);
    console.log(`   3. Build backlinks to key pages (city pages + blog articles)`);
    console.log(`   4. Share blog articles on social media for external signals`);
}

main().catch(console.error);
