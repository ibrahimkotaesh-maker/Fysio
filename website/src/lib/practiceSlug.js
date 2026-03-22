/**
 * Practice slug utilities
 * Generates SEO-friendly URLs from practice name + city
 * Format: "praktijknaam-stad" (e.g., "fysio-huis-amsterdam")
 * 
 * Since we don't have a slug column in the DB, we use a lookup strategy:
 * The [id] param now accepts EITHER a google_place_id OR an SEO slug.
 * For slugs, we search by name/city match.
 */

export function practiceToSlug(name, city) {
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

export function isGooglePlaceId(id) {
    // Google Place IDs start with "ChIJ" and are base64-ish strings
    return id && id.startsWith('ChIJ');
}
