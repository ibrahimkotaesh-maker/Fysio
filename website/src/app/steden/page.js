import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
    title: 'Alle steden — Fysiotherapeuten per provincie',
    description: 'Blader door alle 280+ steden en 12 provincies in Nederland. Vind een fysiotherapeut bij jou in de buurt uit 4.200+ praktijken.',
    alternates: {
        canonical: 'https://vindfysio.nl/steden',
    },
};

async function fetchAllCities() {
    // Supabase default limit is 1000 — we need all 4000+ rows
    // Fetch in pages of 1000
    let allRows = [];
    let page = 0;
    const pageSize = 1000;

    while (true) {
        const { data, error } = await supabase
            .from('practices')
            .select('city, province')
            .not('city', 'is', null)
            .neq('city', '')
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error || !data || data.length === 0) break;
        allRows = allRows.concat(data);
        if (data.length < pageSize) break;
        page++;
    }

    return allRows;
}

export default async function StedenPage() {
    const cities = await fetchAllCities();

    // Group by province and count
    const provinceMap = {};

    cities.forEach(row => {
        const c = row.city;
        const p = row.province || 'Overig';
        if (!provinceMap[p]) provinceMap[p] = {};
        if (!provinceMap[p][c]) provinceMap[p][c] = 0;
        provinceMap[p][c]++;
    });

    // Sort provinces
    const sortedProvinces = Object.keys(provinceMap).sort();
    const totalPractices = cities.length;
    const totalCities = new Set(cities.map(r => r.city)).size;

    return (
        <>
            <Header />
            <div style={{ background: 'var(--bg-gray)', padding: '32px 0 16px', borderBottom: '1px solid var(--border)' }}>
                <div className="container">
                    <h1 style={{ marginBottom: 8 }}>Alle steden</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Blader per provincie en stad door alle {totalPractices.toLocaleString('nl-NL')} fysiotherapiepraktijken
                        in {totalCities} steden van Nederland
                    </p>
                </div>
            </div>

            <div className="container section">
                {sortedProvinces.map(province => {
                    const citiesInProvince = Object.entries(provinceMap[province])
                        .sort((a, b) => b[1] - a[1]);

                    const provinceTotalPractices = citiesInProvince.reduce((s, [, c]) => s + c, 0);

                    return (
                        <div key={province} style={{ marginBottom: 40 }}>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: 16, paddingBottom: 12, borderBottom: '2px solid var(--primary-light)' }}>
                                <span style={{ color: 'var(--primary)' }}>📍</span> {province}
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>
                                    ({provinceTotalPractices} praktijken in {citiesInProvince.length} {citiesInProvince.length === 1 ? 'stad' : 'steden'})
                                </span>
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                                {citiesInProvince.map(([city, count]) => (
                                    <Link
                                        key={city}
                                        href={`/zoeken?city=${encodeURIComponent(city)}`}
                                        className="city-card"
                                        style={{ padding: 16 }}
                                    >
                                        <div className="city-icon" style={{ width: 36, height: 36 }}>
                                            <MapPin size={16} />
                                        </div>
                                        <div>
                                            <div className="city-name" style={{ fontSize: '0.875rem' }}>{city}</div>
                                            <div className="city-count" style={{ fontSize: '0.75rem' }}>{count} {count === 1 ? 'praktijk' : 'praktijken'}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
            <Footer />
        </>
    );
}
