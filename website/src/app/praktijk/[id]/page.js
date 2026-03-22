import { supabase } from '@/lib/supabase';
import { practiceToSlug, isGooglePlaceId } from '@/lib/practiceSlug';
import { getAllPractices } from '@/lib/practiceCache';
import { redirect } from 'next/navigation';
import ProfileClient from './ProfileClient';

// Pre-generate all slug-based URLs at build time
export async function generateStaticParams() {
    const { placeIdMap } = await getAllPractices();
    // Return all slugs for static generation
    return Array.from(placeIdMap.values()).map(slug => ({ id: slug }));
}

export async function generateMetadata({ params }) {
    const { id } = await params;
    const practice = await resolvePractice(id);

    if (!practice) return { title: 'Praktijk niet gevonden' };

    const slug = (await getAllPractices()).placeIdMap.get(practice.google_place_id) || id;
    const title = `${practice.name} — Fysiotherapie ${practice.city || ''}`;
    const specText = practice.specializations?.length > 0 ? ` Specialisaties: ${practice.specializations.slice(0, 3).join(', ')}.` : '';
    const description = `${practice.name} in ${practice.city}${practice.rating ? ` ⭐ ${practice.rating}/5` : ''}${practice.reviews_count ? ` (${practice.reviews_count} reviews)` : ''}.${specText} Bekijk contactgegevens, openingstijden en beoordelingen.`;

    return {
        title,
        description,
        alternates: {
            canonical: `https://vindfysio.nl/praktijk/${slug}`,
        },
        openGraph: {
            title,
            description,
            url: `https://vindfysio.nl/praktijk/${slug}`,
            siteName: 'VindFysio',
            locale: 'nl_NL',
            type: 'website',
        },
    };
}

async function resolvePractice(id) {
    if (isGooglePlaceId(id)) {
        const { data } = await supabase
            .from('practices')
            .select('*')
            .eq('google_place_id', id)
            .single();
        return data;
    }
    // Slug-based lookup
    const { slugMap } = await getAllPractices();
    return slugMap.get(id) || null;
}

function PracticeJsonLd({ practice, slug }) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'HealthBusiness',
        name: practice.name,
        description: practice.description || `Fysiotherapie praktijk in ${practice.city}`,
        ...(practice.specializations?.length > 0 && {
            medicalSpecialty: practice.specializations,
            keywords: practice.specializations.join(', '),
        }),
        url: `https://vindfysio.nl/praktijk/${slug}`,
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

// Auto-generated "About this practice" text for SEO
function PracticeAboutSection({ practice }) {
    const specs = practice.specializations || [];
    const specList = specs.length > 0
        ? `Specialisaties van deze praktijk zijn onder andere: ${specs.slice(0, 5).join(', ')}.`
        : '';
    const ratingText = practice.rating
        ? `Met een beoordeling van ${practice.rating} uit 5 sterren${practice.reviews_count ? ` op basis van ${practice.reviews_count} beoordelingen` : ''}, is deze praktijk goed beoordeeld door patiënten.`
        : '';

    return (
        <section style={{
            background: 'var(--bg-gray)',
            borderRadius: 12,
            padding: '24px 28px',
            marginTop: 24,
            lineHeight: 1.7,
        }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: 12 }}>
                Over {practice.name}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                {practice.name} is een fysiotherapiepraktijk gevestigd in {practice.city || 'Nederland'}
                {practice.address ? `, op het adres ${practice.address}` : ''}.{' '}
                {specList}{' '}
                {ratingText}{' '}
                {practice.no_referral_needed ? 'U kunt bij deze praktijk terecht zonder verwijzing van de huisarts. ' : ''}
                {practice.all_insurances ? 'De praktijk werkt samen met alle zorgverzekeraars. ' : ''}
                Neem contact op voor het maken van een afspraak of bekijk de contactgegevens op deze pagina.
            </p>
        </section>
    );
}

// FAQ section for SEO
function PracticeFAQ({ practice }) {
    const city = practice.city || 'uw regio';
    const faqs = [
        {
            q: `Heb ik een verwijzing nodig voor ${practice.name}?`,
            a: practice.no_referral_needed
                ? `Nee, u kunt bij ${practice.name} terecht zonder verwijzing van de huisarts. U kunt direct een afspraak maken.`
                : `In de meeste gevallen kunt u zonder verwijzing van uw huisarts bij een fysiotherapeut terecht. Neem contact op met ${practice.name} voor meer informatie.`,
        },
        {
            q: `Welke behandelingen biedt ${practice.name} aan?`,
            a: practice.specializations?.length > 0
                ? `${practice.name} biedt verschillende behandelingen aan, waaronder: ${practice.specializations.slice(0, 5).join(', ')}. Neem contact op voor een volledig overzicht.`
                : `${practice.name} biedt diverse fysiotherapeutische behandelingen aan. Neem contact op voor meer informatie over de specifieke behandelmogelijkheden.`,
        },
        {
            q: `Wordt fysiotherapie bij ${practice.name} vergoed door mijn verzekering?`,
            a: practice.all_insurances
                ? `${practice.name} werkt samen met alle zorgverzekeraars. De vergoeding hangt af van uw aanvullende verzekering. Informeer bij uw verzekeraar naar de exacte voorwaarden.`
                : `De vergoeding van fysiotherapie hangt af van uw zorgverzekering en aanvullende dekking. Neem contact op met ${practice.name} of uw zorgverzekeraar voor de exacte voorwaarden.`,
        },
    ];

    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
    };

    return (
        <section style={{
            background: 'var(--bg-gray)',
            borderRadius: 12,
            padding: '24px 28px',
            marginTop: 24,
        }}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: 16 }}>
                Veelgestelde vragen
            </h2>
            {faqs.map((f, i) => (
                <details key={i} style={{
                    marginBottom: 12,
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: 12,
                }}>
                    <summary style={{
                        fontWeight: 500,
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        color: 'var(--text)',
                    }}>
                        {f.q}
                    </summary>
                    <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem',
                        marginTop: 8,
                        lineHeight: 1.6,
                    }}>
                        {f.a}
                    </p>
                </details>
            ))}
        </section>
    );
}

export default async function PracticePage({ params }) {
    const { id } = await params;

    // If old ChIJ URL, redirect to the new slug
    if (isGooglePlaceId(id)) {
        const practice = await resolvePractice(id);
        if (practice) {
            const { placeIdMap } = await getAllPractices();
            const slug = placeIdMap.get(practice.google_place_id);
            if (slug) {
                redirect(`/praktijk/${slug}`);
            }
        }
    }

    const practice = await resolvePractice(id);

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

    const { placeIdMap } = await getAllPractices();
    const slug = placeIdMap.get(practice.google_place_id) || id;

    // Get similar practices in same city
    const { data: similar } = await supabase
        .from('practices')
        .select('*')
        .eq('city', practice.city)
        .neq('google_place_id', practice.google_place_id)
        .order('rating', { ascending: false })
        .limit(3);

    return (
        <>
            <PracticeJsonLd practice={practice} slug={slug} />
            <ProfileClient practice={practice} similar={similar || []} />
            <div className="container" style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px 40px' }}>
                <PracticeAboutSection practice={practice} />
                <PracticeFAQ practice={practice} />
            </div>
        </>
    );
}
