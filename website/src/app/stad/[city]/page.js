import { supabase } from '@/lib/supabase';
import { toSlug, fromSlug } from '@/lib/slug';
import Link from 'next/link';
import { MapPin, Star, Phone, Globe, ArrowRight, ChevronDown, Building2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StarRating from '@/components/StarRating';

// Helper: fetch all rows with pagination
async function fetchAll(table, select, filters = {}) {
    let allRows = [];
    let page = 0;
    const pageSize = 1000;

    while (true) {
        let query = supabase.from(table).select(select).range(page * pageSize, (page + 1) * pageSize - 1);

        if (filters.eq) {
            for (const [col, val] of Object.entries(filters.eq)) {
                query = query.eq(col, val);
            }
        }
        if (filters.ilike) {
            for (const [col, val] of Object.entries(filters.ilike)) {
                query = query.ilike(col, val);
            }
        }
        if (filters.neq) {
            for (const [col, val] of Object.entries(filters.neq)) {
                query = query.neq(col, val);
            }
        }
        if (filters.not) {
            for (const [col, val] of Object.entries(filters.not)) {
                query = query.not(col, 'is', val);
            }
        }
        if (filters.order) {
            query = query.order(filters.order.col, { ascending: filters.order.asc ?? true, nullsFirst: false });
        }

        const { data, error } = await query;
        if (error || !data || data.length === 0) break;
        allRows = allRows.concat(data);
        if (data.length < pageSize) break;
        page++;
    }
    return allRows;
}

// Find the actual city name from slug by querying DB
async function findCityBySlug(slug) {
    // Get all unique city names
    const allCities = await fetchAll('practices', 'city', {
        not: { city: null },
        neq: { city: '' },
    });

    const uniqueCities = [...new Set(allCities.map(r => r.city))];

    // Find the city whose slug matches
    const match = uniqueCities.find(city => toSlug(city) === slug);
    return match || null;
}

export async function generateMetadata({ params }) {
    const { city: slug } = await params;
    const cityName = await findCityBySlug(slug);

    if (!cityName) return { title: 'Stad niet gevonden — VindFysio' };

    // Get count for metadata
    const { count } = await supabase
        .from('practices')
        .select('*', { count: 'exact', head: true })
        .eq('city', cityName);

    const title = `Fysiotherapeut ${cityName} — ${count || 0} praktijken | VindFysio`;
    const description = `Vind de beste fysiotherapeut in ${cityName}. Vergelijk ${count || 0} fysiotherapiepraktijken, bekijk beoordelingen en neem direct contact op. ✓ Gratis ✓ Onafhankelijk`;

    return {
        title,
        description,
        alternates: {
            canonical: `https://vindfysio.nl/stad/${slug}`,
        },
        openGraph: {
            title,
            description,
            url: `https://vindfysio.nl/stad/${slug}`,
            siteName: 'VindFysio',
            locale: 'nl_NL',
            type: 'website',
        },
    };
}

// JSON-LD structured data for the city
function CityJsonLd({ cityName, practices, slug, province }) {
    const avgRating = practices.length > 0
        ? (practices.reduce((sum, p) => sum + (p.rating || 0), 0) / practices.filter(p => p.rating).length).toFixed(1)
        : null;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `Fysiotherapeuten in ${cityName}`,
        description: `Overzicht van ${practices.length} fysiotherapiepraktijken in ${cityName}, ${province || 'Nederland'}`,
        url: `https://vindfysio.nl/stad/${slug}`,
        numberOfItems: practices.length,
        itemListElement: practices.slice(0, 10).map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
                '@type': 'HealthBusiness',
                name: p.name,
                url: `https://vindfysio.nl/praktijk/${p.google_place_id}`,
                ...(p.address && {
                    address: {
                        '@type': 'PostalAddress',
                        streetAddress: p.address,
                        addressLocality: cityName,
                        addressRegion: province,
                        addressCountry: 'NL',
                    }
                }),
                ...(p.rating && {
                    aggregateRating: {
                        '@type': 'AggregateRating',
                        ratingValue: p.rating,
                        reviewCount: p.reviews_count || 1,
                        bestRating: 5,
                    },
                }),
            },
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

// FAQ JSON-LD
function FaqJsonLd({ cityName, practiceCount, avgRating, province }) {
    const faqs = [
        {
            question: `Hoeveel fysiotherapeuten zijn er in ${cityName}?`,
            answer: `In ${cityName} zijn er ${practiceCount} fysiotherapiepraktijken geregistreerd bij VindFysio. Bekijk ze allemaal en vergelijk op basis van beoordelingen en specialisaties.`,
        },
        {
            question: `Wat is de gemiddelde beoordeling van fysiotherapeuten in ${cityName}?`,
            answer: avgRating
                ? `De gemiddelde beoordeling van fysiotherapeuten in ${cityName} is ${avgRating} uit 5 sterren, gebaseerd op Google Reviews.`
                : `Bekijk de individuele beoordelingen van fysiotherapeuten in ${cityName} op onze website.`,
        },
        {
            question: `Hoe vind ik de beste fysiotherapeut in ${cityName}?`,
            answer: `Op VindFysio kun je alle ${practiceCount} fysiotherapeuten in ${cityName} vergelijken op basis van beoordelingen, specialisaties en locatie. Filter op wat voor jou belangrijk is en bekijk de details van elke praktijk.`,
        },
        {
            question: `Heb ik een verwijzing nodig voor fysiotherapie in ${cityName}?`,
            answer: `Sinds 2006 heb je in Nederland geen verwijzing meer nodig om naar de fysiotherapeut te gaan. Je kunt rechtstreeks een afspraak maken bij een fysiotherapeut in ${cityName} via directe toegang (DTF).`,
        },
    ];

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: f.answer,
            },
        })),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Visible FAQ section */}
            <section className="section">
                <div className="container">
                    <h2 style={{ marginBottom: 24 }}>Veelgestelde vragen over fysiotherapie in {cityName}</h2>
                    <div className="faq-list">
                        {faqs.map((faq, i) => (
                            <details key={i} className="faq-item" open={i === 0}>
                                <summary className="faq-question">
                                    {faq.question}
                                    <ChevronDown size={18} className="faq-chevron" />
                                </summary>
                                <p className="faq-answer">{faq.answer}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}

export default async function CityPage({ params }) {
    const { city: slug } = await params;
    const cityName = await findCityBySlug(slug);

    if (!cityName) {
        return (
            <>
                <Header />
                <div style={{ textAlign: 'center', padding: 120 }}>
                    <h1>Stad niet gevonden</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
                        We konden geen fysiotherapeuten vinden voor deze stad.
                    </p>
                    <Link href="/steden" className="btn btn-primary" style={{ marginTop: 24 }}>
                        Bekijk alle steden
                    </Link>
                </div>
                <Footer />
            </>
        );
    }

    // Fetch all practices in this city
    const practices = await fetchAll('practices', '*', {
        eq: { city: cityName },
        order: { col: 'rating', asc: false },
    });

    const province = practices[0]?.province || '';

    // Calculate stats
    const totalPractices = practices.length;
    const practicesWithRating = practices.filter(p => p.rating);
    const avgRating = practicesWithRating.length > 0
        ? (practicesWithRating.reduce((sum, p) => sum + p.rating, 0) / practicesWithRating.length).toFixed(1)
        : null;
    const totalReviews = practices.reduce((sum, p) => sum + (p.reviews_count || 0), 0);
    const practicesWithPhone = practices.filter(p => p.phone).length;
    const practicesWithWebsite = practices.filter(p => p.website).length;

    // Fetch nearby cities (same province, sorted by count)
    const allInProvince = await fetchAll('practices', 'city', {
        eq: { province },
        not: { city: null },
        neq: { city: '' },
    });

    const cityCountMap = {};
    allInProvince.forEach(r => {
        if (r.city !== cityName) {
            cityCountMap[r.city] = (cityCountMap[r.city] || 0) + 1;
        }
    });

    const nearbyCities = Object.entries(cityCountMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

    return (
        <>
            <CityJsonLd cityName={cityName} practices={practices} slug={slug} province={province} />
            <Header />

            {/* City Hero Header */}
            <section className="city-hero">
                <div className="container">
                    <div className="city-breadcrumb">
                        <Link href="/">Home</Link>
                        <span>/</span>
                        <Link href="/steden">Steden</Link>
                        <span>/</span>
                        {province && (
                            <>
                                <span>{province}</span>
                                <span>/</span>
                            </>
                        )}
                        <span className="current">{cityName}</span>
                    </div>
                    <h1>
                        Fysiotherapeut in <span className="city-highlight">{cityName}</span>
                    </h1>
                    <p className="city-subtitle">
                        Vergelijk {totalPractices} fysiotherapiepraktijken in {cityName}
                        {province && `, ${province}`}. Bekijk beoordelingen en neem direct contact op.
                    </p>

                    {/* Stats */}
                    <div className="city-stats">
                        <div className="city-stat">
                            <Building2 size={20} />
                            <div>
                                <strong>{totalPractices}</strong>
                                <span>Praktijken</span>
                            </div>
                        </div>
                        {avgRating && (
                            <div className="city-stat">
                                <Star size={20} />
                                <div>
                                    <strong>{avgRating}</strong>
                                    <span>Gem. score</span>
                                </div>
                            </div>
                        )}
                        <div className="city-stat">
                            <MapPin size={20} />
                            <div>
                                <strong>{province || 'NL'}</strong>
                                <span>Provincie</span>
                            </div>
                        </div>
                        {totalReviews > 0 && (
                            <div className="city-stat">
                                <Star size={20} />
                                <div>
                                    <strong>{totalReviews.toLocaleString('nl-NL')}</strong>
                                    <span>Reviews</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Practice Listing */}
            <section className="section">
                <div className="container">
                    <h2 style={{ marginBottom: 4 }}>
                        Alle fysiotherapeuten in {cityName}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.938rem' }}>
                        Gesorteerd op beoordeling — {totalPractices} {totalPractices === 1 ? 'resultaat' : 'resultaten'}
                    </p>

                    <div className="results-grid">
                        {practices.map((p) => (
                            <Link key={p.id} href={`/praktijk/${p.google_place_id}`} className="practice-card">
                                <div className="practice-info">
                                    <h3 className="practice-name">{p.name}</h3>
                                    <div className="practice-address">
                                        <MapPin size={14} />
                                        {p.address && `${p.address}`}
                                        {p.postal_code && ` · ${p.postal_code}`}
                                    </div>
                                    {p.rating && (
                                        <div style={{ marginBottom: 12 }}>
                                            <StarRating rating={p.rating} count={p.reviews_count} />
                                        </div>
                                    )}
                                    <div className="practice-tags">
                                        {p.phone && (
                                            <span className="tag">
                                                <Phone size={11} /> Telefoon
                                            </span>
                                        )}
                                        {p.website && (
                                            <span className="tag">
                                                <Globe size={11} /> Website
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="practice-cta">
                                    <div className="btn btn-outline btn-sm">
                                        Bekijk details
                                        <ArrowRight size={14} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section with JSON-LD */}
            <FaqJsonLd
                cityName={cityName}
                practiceCount={totalPractices}
                avgRating={avgRating}
                province={province}
            />

            {/* Nearby Cities */}
            {nearbyCities.length > 0 && (
                <section className="section section-gray">
                    <div className="container">
                        <h2 style={{ marginBottom: 8 }}>Fysiotherapeuten in de buurt van {cityName}</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.938rem' }}>
                            Bekijk ook fysiotherapeuten in andere steden in {province}
                        </p>
                        <div className="city-grid">
                            {nearbyCities.map(([city, count]) => (
                                <Link
                                    key={city}
                                    href={`/stad/${toSlug(city)}`}
                                    className="city-card"
                                >
                                    <div className="city-icon">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <div className="city-name">{city}</div>
                                        <div className="city-count">{count} {count === 1 ? 'praktijk' : 'praktijken'}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="section">
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 style={{ marginBottom: 12 }}>Niet gevonden wat je zoekt?</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                        Bekijk alle fysiotherapeuten in heel Nederland
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/zoeken" className="btn btn-primary">
                            Alle praktijken bekijken
                            <ArrowRight size={16} />
                        </Link>
                        <Link href="/steden" className="btn btn-outline">
                            Alle steden bekijken
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}
