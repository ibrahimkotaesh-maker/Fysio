/**
 * Practice Website Scraper
 * Crawls physiotherapy practice websites and extracts enrichment data.
 * 
 * Usage:
 *   node scrape_practices.js            → scrape all practices with websites
 *   node scrape_practices.js --test     → test mode: first 10 only
 *   node scrape_practices.js --dry-run  → just show what would be scraped
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase connection using service role for writes
const SUPABASE_URL = 'https://wxdwpnuxxcpsfgjfmxax.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZHdwbnV4eGNwc2ZnamZteGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NzU1MDcsImV4cCI6MjA4NzI1MTUwN30.WgfkMMHrg8adsz8iPfqRA66toy6Qi4hOiEw6unRFPPs';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Specialization Dictionary ───────────────────────────────────────────────
// Dutch physiotherapy specializations to match against page content
const SPECIALIZATIONS = [
    { key: 'fysiotherapie', patterns: ['fysiotherapie', 'physiotherapy'] },
    { key: 'manuele therapie', patterns: ['manuele therapie', 'manueel therapie', 'manual therapy'] },
    { key: 'sportfysiotherapie', patterns: ['sportfysiotherapie', 'sportfysio', 'sports physiotherapy'] },
    { key: 'dry needling', patterns: ['dry needling', 'dryneedling'] },
    { key: 'echografie', patterns: ['echografie', 'echography', 'ultrasound diagnostiek'] },
    { key: 'shockwave therapie', patterns: ['shockwave', 'shock wave', 'radiale schokgolf'] },
    { key: 'kaakfysiotherapie', patterns: ['kaakfysiotherapie', 'kaakfysio', 'kaak fysiotherapie', 'craniofaci'] },
    { key: 'bekkenfysiotherapie', patterns: ['bekkenfysiotherapie', 'bekkenfysio', 'bekkenbodem'] },
    { key: 'kinderfysiotherapie', patterns: ['kinderfysiotherapie', 'kinderfysio', 'pediatric'] },
    { key: 'geriatrie fysiotherapie', patterns: ['geriatrie', 'ouderen fysiotherapie', 'geriatrisch'] },
    { key: 'revalidatie', patterns: ['revalidatie', 'rehabilitation', 'herstel na operatie'] },
    { key: 'neurologische fysiotherapie', patterns: ['neurologi', 'parkinson', 'beroerte', 'CVA'] },
    { key: 'oncologische fysiotherapie', patterns: ['oncologi', 'kanker fysiotherapie'] },
    { key: 'psychosomatische fysiotherapie', patterns: ['psychosomati', 'psychofysio'] },
    { key: 'fysiofitness', patterns: ['fysiofitness', 'medische fitness', 'medical fitness'] },
    { key: 'triggerpoint therapie', patterns: ['triggerpoint', 'trigger point'] },
    { key: 'medical taping', patterns: ['medical taping', 'kinesiotaping', 'kinesio taping'] },
    { key: 'looptraining', patterns: ['looptraining', 'hardloop', 'running coaching', 'bikefitting'] },
    { key: 'personal training', patterns: ['personal training'] },
    { key: 'lymfedrainage', patterns: ['lymfedrainage', 'oedeemtherapie', 'lymfe'] },
    { key: 'ademhalingstherapie', patterns: ['ademhaling', 'respiratory', 'longfysiotherapie', 'COPD'] },
    { key: 'rugpijn specialist', patterns: ['rugpijn specialist', 'rugspecialist', 'spine'] },
    { key: 'nekpijn specialist', patterns: ['nekpijn specialist', 'nekspecialist'] },
    { key: 'schouder specialist', patterns: ['schouder specialist', 'schoudernetwerk', 'schouderklachten'] },
    { key: 'knie specialist', patterns: ['kniespecialist', 'kruisband', 'knie specialist'] },
    { key: 'BFR training', patterns: ['blood flow restriction', 'BFR training', 'BFR'] },
    { key: 'fysiotherapie aan huis', patterns: ['aan huis', 'thuisfysiotherapie', 'home visit'] },
    { key: 'bindweefsel therapie', patterns: ['bindweefsel'] },
];

// ─── HTML Helper Functions ───────────────────────────────────────────────────

function stripHtml(html) {
    return html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

function getMetaDescription(html) {
    const match = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
        || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
    return match ? match[1].trim() : null;
}

function getOgDescription(html) {
    const match = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
        || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);
    return match ? match[1].trim() : null;
}

// ─── Data Extraction ─────────────────────────────────────────────────────────

function extractSpecializations(text) {
    const textLower = text.toLowerCase();
    const found = [];

    for (const spec of SPECIALIZATIONS) {
        // Skip the generic "fysiotherapie" — too common
        if (spec.key === 'fysiotherapie') continue;

        for (const pattern of spec.patterns) {
            if (textLower.includes(pattern.toLowerCase())) {
                found.push(spec.key);
                break;
            }
        }
    }

    return [...new Set(found)]; // deduplicate
}

function extractDescription(html, textContent) {
    // Priority: meta description > OG description > first meaningful paragraph
    const metaDesc = getMetaDescription(html);
    if (metaDesc && metaDesc.length > 40) return metaDesc;

    const ogDesc = getOgDescription(html);
    if (ogDesc && ogDesc.length > 40) return ogDesc;

    // Try to find a meaningful first paragraph
    const paragraphs = textContent.split(/[.!?]\s/).filter(s => s.length > 60 && s.length < 500);
    if (paragraphs.length > 0) {
        return paragraphs[0].trim() + '.';
    }

    return null;
}

function extractNoReferralNeeded(textLower) {
    const patterns = [
        'geen verwijzing nodig',
        'geen verwijzing',
        'zonder verwijzing',
        'direct toegankelijk',
        'directe toegankelijkheid',
        'dtf',
        'no referral',
    ];
    return patterns.some(p => textLower.includes(p));
}

function extractAllInsurances(textLower) {
    const patterns = [
        'alle zorgverzekeraars',
        'alle verzekeraars',
        'contracten met alle',
        'vergoed door alle',
        'alle zorgverzekeringen',
    ];
    return patterns.some(p => textLower.includes(p));
}

function extractOpeningHours(textContent) {
    // Try to find opening hours patterns like "Ma-vr: 08:00-17:00"
    const hourPatterns = [
        /(?:ma(?:andag)?)\s*(?:t\/m|tot|[-–])\s*(?:vr(?:ijdag)?)\s*[:]\s*(\d{1,2}[:.]\d{2})\s*[-–]\s*(\d{1,2}[:.]\d{2})/i,
        /openingstijden[:\s]*([^.]+)/i,
    ];

    for (const pattern of hourPatterns) {
        const match = textContent.match(pattern);
        if (match) {
            return { raw: match[0].trim().substring(0, 200) };
        }
    }
    return null;
}

// ─── Scraper Core ────────────────────────────────────────────────────────────

async function scrapeWebsite(url) {
    try {
        // Clean URL
        let cleanUrl = url.split('?')[0]; // Remove UTM params
        if (!cleanUrl.startsWith('http')) cleanUrl = 'https://' + cleanUrl;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

        const response = await fetch(cleanUrl, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'nl,en;q=0.5',
            },
        });

        clearTimeout(timeout);

        if (!response.ok) {
            return { error: `HTTP ${response.status}` };
        }

        const html = await response.text();
        const textContent = stripHtml(html);
        const textLower = textContent.toLowerCase();

        return {
            specializations: extractSpecializations(textContent),
            description: extractDescription(html, textContent),
            no_referral_needed: extractNoReferralNeeded(textLower),
            all_insurances: extractAllInsurances(textLower),
            opening_hours: extractOpeningHours(textContent),
        };
    } catch (err) {
        return { error: err.message || 'Unknown error' };
    }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
    const args = process.argv.slice(2);
    const testMode = args.includes('--test');
    const dryRun = args.includes('--dry-run');

    console.log('🔍 Practice Website Scraper');
    console.log(`   Mode: ${dryRun ? 'DRY RUN' : testMode ? 'TEST (10 only)' : 'FULL'}`);
    console.log('');

    // Fetch ALL practices with websites (paginated to avoid 1000 row limit)
    let practices = [];

    if (testMode) {
        const { data, error } = await supabase
            .from('practices')
            .select('id, google_place_id, name, city, website')
            .not('website', 'is', null)
            .neq('website', '')
            .limit(10);
        if (error) { console.error('❌ Error:', error); return; }
        practices = data;
    } else {
        let page = 0;
        const pageSize = 1000;
        while (true) {
            const { data, error } = await supabase
                .from('practices')
                .select('id, google_place_id, name, city, website')
                .not('website', 'is', null)
                .neq('website', '')
                .range(page * pageSize, (page + 1) * pageSize - 1);

            if (error) { console.error('❌ Error:', error); break; }
            if (!data || data.length === 0) break;
            practices = practices.concat(data);
            if (data.length < pageSize) break;
            page++;
        }
    }

    if (practices.length === 0) {
        console.error('❌ No practices found');
        return;
    }

    console.log(`📋 Found ${practices.length} practices with websites\n`);

    if (dryRun) {
        practices.forEach((p, i) => console.log(`  ${i + 1}. ${p.name} — ${p.website?.split('?')[0]}`));
        return;
    }

    let success = 0, failed = 0, enriched = 0;

    for (let i = 0; i < practices.length; i++) {
        const p = practices[i];
        const progress = `[${i + 1}/${practices.length}]`;

        process.stdout.write(`${progress} ${p.name.substring(0, 50).padEnd(50)} `);

        const result = await scrapeWebsite(p.website);

        if (result.error) {
            console.log(`❌ ${result.error}`);
            failed++;
        } else {
            // Build update object — only include non-null values
            const update = {};
            if (result.specializations.length > 0) update.specializations = result.specializations;
            if (result.description) update.description = result.description;
            if (result.no_referral_needed) update.no_referral_needed = true;
            if (result.all_insurances) update.all_insurances = true;
            if (result.opening_hours) update.opening_hours = result.opening_hours;

            const fieldCount = Object.keys(update).length;

            if (fieldCount > 0) {
                const { error: updateError } = await supabase
                    .from('practices')
                    .update(update)
                    .eq('id', p.id);

                if (updateError) {
                    console.log(`⚠️  DB error: ${updateError.message}`);
                } else {
                    const specs = update.specializations ? update.specializations.join(', ') : '';
                    console.log(`✅ ${fieldCount} fields | ${specs || 'desc/info only'}`);
                    enriched++;
                }
            } else {
                console.log(`⏭️  No data found`);
            }
            success++;
        }

        // Rate limit: 500ms between requests
        await new Promise(r => setTimeout(r, 500));
    }

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`✅ Done! Scraped: ${success}/${practices.length} | Enriched: ${enriched} | Failed: ${failed}`);
}

main().catch(console.error);
