import { supabase } from '@/lib/supabase';
import ProfileClient from './ProfileClient';

export async function generateMetadata({ params }) {
    const { id } = await params;
    const { data } = await supabase
        .from('practices')
        .select('name, city, address, rating, reviews_count')
        .eq('google_place_id', id)
        .single();

    if (!data) return { title: 'Praktijk niet gevonden' };

    const title = `${data.name} — Fysiotherapie ${data.city || ''} | VindFysio`;
    const description = `${data.name} in ${data.city}${data.rating ? ` ⭐ ${data.rating}/5` : ''}${data.reviews_count ? ` (${data.reviews_count} reviews)` : ''}. Bekijk contactgegevens, openingstijden en beoordelingen.`;

    return {
        title,
        description,
        alternates: {
            canonical: `https://vindfysio.nl/praktijk/${id}`,
        },
        openGraph: {
            title,
            description,
            url: `https://vindfysio.nl/praktijk/${id}`,
            siteName: 'VindFysio',
            locale: 'nl_NL',
            type: 'website',
        },
    };
}

function PracticeJsonLd({ practice }) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'HealthBusiness',
        name: practice.name,
        description: `Fysiotherapie praktijk in ${practice.city}`,
        url: `https://vindfysio.nl/praktijk/${practice.google_place_id}`,
        ...(practice.address && {
            address: {
                '@type': 'PostalAddress',
                streetAddress: practice.address,
                addressLocality: practice.city,
                addressRegion: practice.province,
                addressCountry: 'NL',
            }
        }),
        ...(practice.phone && { telephone: practice.phone }),
        ...(practice.website && { sameAs: practice.website }),
        ...(practice.rating && {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: practice.rating,
                reviewCount: practice.reviews_count || 1,
                bestRating: 5,
            },
        }),
        ...(practice.lat && practice.lng && {
            geo: {
                '@type': 'GeoCoordinates',
                latitude: practice.lat,
                longitude: practice.lng,
            },
        }),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

export default async function PracticePage({ params }) {
    const { id } = await params;

    const { data: practice } = await supabase
        .from('practices')
        .select('*')
        .eq('google_place_id', id)
        .single();

    if (!practice) {
        return (
            <div style={{ textAlign: 'center', padding: 120 }}>
                <h1>Praktijk niet gevonden</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
                    Deze praktijk bestaat niet of is verwijderd.
                </p>
            </div>
        );
    }

    // Get similar practices in same city
    const { data: similar } = await supabase
        .from('practices')
        .select('*')
        .eq('city', practice.city)
        .neq('google_place_id', id)
        .order('rating', { ascending: false })
        .limit(3);

    return (
        <>
            <PracticeJsonLd practice={practice} />
            <ProfileClient practice={practice} similar={similar || []} />
        </>
    );
}
