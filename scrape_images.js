/**
 * Image URL Scraper — extracts og:image from practice websites
 * 
 * Usage:
 *   node scrape_images.js            → scrape all practices
 *   node scrape_images.js --test     → test mode: first 10 only
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://wxdwpnuxxcpsfgjfmxax.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZHdwbnV4eGNwc2ZnamZteGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NzU1MDcsImV4cCI6MjA4NzI1MTUwN30.WgfkMMHrg8adsz8iPfqRA66toy6Qi4hOiEw6unRFPPs'
);

function extractOgImage(html) {
    // Try og:image first
    const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
        || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (ogMatch) return ogMatch[1].trim();

    // Try twitter:image
    const twitterMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)
        || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);
    if (twitterMatch) return twitterMatch[1].trim();

    return null;
}

function isValidImageUrl(url) {
    if (!url) return false;
    // Must be absolute URL
    if (!url.startsWith('http')) return false;
    // Skip tiny favicons/icons
    if (url.includes('favicon') || url.includes('icon') || url.includes('.ico')) return false;
    // Skip SVG logos (too small usually)
    if (url.endsWith('.svg')) return false;
    // Must have image-like extension or be a known CDN
    const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const hasImageExt = imageExts.some(ext => url.toLowerCase().includes(ext));
    const isKnownCDN = url.includes('wp-content') || url.includes('squarespace') || url.includes('wixstatic') || url.includes('cloudinary') || url.includes('imgix') || url.includes('cdn');
    return hasImageExt || isKnownCDN;
}

async function main() {
    const args = process.argv.slice(2);
    const testMode = args.includes('--test');

    console.log('🖼️  Practice Image Scraper');
    console.log(`   Mode: ${testMode ? 'TEST (10 only)' : 'FULL'}\n`);

    // Fetch practices with websites but no image yet
    let practices = [];

    if (testMode) {
        const { data } = await supabase
            .from('practices')
            .select('id, name, website')
            .not('website', 'is', null)
            .neq('website', '')
            .is('image_url', null)
            .limit(10);
        practices = data || [];
    } else {
        let page = 0;
        const pageSize = 1000;
        while (true) {
            const { data, error } = await supabase
                .from('practices')
                .select('id, name, website')
                .not('website', 'is', null)
                .neq('website', '')
                .is('image_url', null)
                .range(page * pageSize, (page + 1) * pageSize - 1);

            if (error || !data || data.length === 0) break;
            practices = practices.concat(data);
            if (data.length < pageSize) break;
            page++;
        }
    }

    console.log(`📋 Found ${practices.length} practices to scrape\n`);

    let found = 0, notFound = 0, failed = 0;

    for (let i = 0; i < practices.length; i++) {
        const p = practices[i];
        const progress = `[${i + 1}/${practices.length}]`;

        process.stdout.write(`${progress} ${(p.name || '').substring(0, 45).padEnd(45)} `);

        try {
            let url = p.website.split('?')[0];
            if (!url.startsWith('http')) url = 'https://' + url;

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 6000);

            const res = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'text/html',
                },
            });
            clearTimeout(timeout);

            if (!res.ok) {
                console.log(`❌ HTTP ${res.status}`);
                failed++;
            } else {
                const html = await res.text();
                const imageUrl = extractOgImage(html);

                if (imageUrl && isValidImageUrl(imageUrl)) {
                    const { error: updateError } = await supabase
                        .from('practices')
                        .update({ image_url: imageUrl })
                        .eq('id', p.id);

                    if (updateError) {
                        console.log(`⚠️ DB error`);
                    } else {
                        console.log(`✅ ${imageUrl.substring(0, 70)}`);
                        found++;
                    }
                } else {
                    console.log(`⏭️ No valid image`);
                    notFound++;
                }
            }
        } catch (e) {
            console.log(`❌ ${(e.message || 'Error').substring(0, 40)}`);
            failed++;
        }

        await new Promise(r => setTimeout(r, 300));
    }

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`✅ Done! Found: ${found} | No image: ${notFound} | Failed: ${failed}`);
}

main().catch(console.error);
