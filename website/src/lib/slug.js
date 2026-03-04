/**
 * City name ↔ URL slug utilities
 * "Den Haag" → "den-haag"
 * "'s-Hertogenbosch" → "s-hertogenbosch"
 */

export function toSlug(cityName) {
    return cityName
        .toLowerCase()
        .replace(/[''`]/g, '')       // Remove apostrophes
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
        .replace(/\s+/g, '-')         // Spaces → hyphens
        .replace(/-+/g, '-')          // Collapse multiple hyphens
        .replace(/^-|-$/g, '');       // Trim leading/trailing hyphens
}

export function fromSlug(slug) {
    // Basic conversion: hyphens → spaces, title case
    return slug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
}
