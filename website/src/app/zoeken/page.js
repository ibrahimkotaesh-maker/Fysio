'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PracticeCard from '@/components/PracticeCard';

const PROVINCES = [
    'Zuid-Holland', 'Noord-Brabant', 'Noord-Holland', 'Limburg',
    'Overijssel', 'Gelderland', 'Groningen', 'Utrecht',
    'Zeeland', 'Friesland', 'Flevoland', 'Drenthe',
];

const PAGE_SIZE = 20;

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [practices, setPractices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [selectedProvince, setSelectedProvince] = useState(searchParams.get('province') || '');
    const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
    const [sortBy, setSortBy] = useState('rating');

    const fetchPractices = useCallback(async () => {
        setLoading(true);
        let query = supabase
            .from('practices')
            .select('*', { count: 'exact' });

        // Search filter
        const q = searchParams.get('q') || '';
        const city = searchParams.get('city') || '';
        const province = searchParams.get('province') || '';

        if (q) {
            query = query.or(`name.ilike.%${q}%,city.ilike.%${q}%,address.ilike.%${q}%`);
        }
        if (city) {
            query = query.ilike('city', `%${city}%`);
        }
        if (province) {
            query = query.eq('province', province);
        }

        // Sort
        if (sortBy === 'rating') {
            query = query.order('rating', { ascending: false, nullsFirst: false });
        } else if (sortBy === 'reviews') {
            query = query.order('reviews_count', { ascending: false, nullsFirst: false });
        } else {
            query = query.order('name');
        }

        // Pagination
        const from = page * PAGE_SIZE;
        query = query.range(from, from + PAGE_SIZE - 1);

        const { data, count, error } = await query;
        if (!error) {
            if (page === 0) {
                setPractices(data || []);
            } else {
                setPractices(prev => [...prev, ...(data || [])]);
            }
            setTotal(count || 0);
        }
        setLoading(false);
    }, [searchParams, page, sortBy]);

    useEffect(() => {
        setPage(0);
        setPractices([]);
    }, [searchParams]);

    useEffect(() => {
        fetchPractices();
    }, [fetchPractices]);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        if (selectedProvince) params.set('province', selectedProvince);
        if (selectedCity) params.set('city', selectedCity);
        router.push(`/zoeken?${params.toString()}`);
    };

    const currentQuery = searchParams.get('q') || searchParams.get('city') || 'Alle praktijken';

    return (
        <>
            <Header />

            {/* Search Bar */}
            <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-gray)', padding: '16px 0' }}>
                <div className="container">
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                className="input"
                                placeholder="Stad, postcode of naam..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{ paddingLeft: 40 }}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Zoeken</button>
                    </form>
                </div>
            </div>

            <div className="container">
                <div className="listing-layout">
                    {/* Filters Panel */}
                    <aside className="filters-panel">
                        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 24 }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: 20 }}>Filters</h3>

                            <div className="filter-group">
                                <h4>Provincie</h4>
                                <label className="filter-option" style={{ fontWeight: selectedProvince === '' ? 600 : 400, color: selectedProvince === '' ? 'var(--primary)' : undefined }}>
                                    <input
                                        type="radio"
                                        name="province"
                                        checked={selectedProvince === ''}
                                        onChange={() => { setSelectedProvince(''); handleFilterChange(''); }}
                                        style={{ display: 'none' }}
                                    />
                                    Alle provincies
                                </label>
                                {PROVINCES.map(p => (
                                    <label key={p} className="filter-option" onClick={() => {
                                        const params = new URLSearchParams(searchParams.toString());
                                        params.set('province', p);
                                        router.push(`/zoeken?${params.toString()}`);
                                    }} style={{ cursor: 'pointer', fontWeight: searchParams.get('province') === p ? 600 : 400, color: searchParams.get('province') === p ? 'var(--primary)' : undefined }}>
                                        <MapPin size={14} />
                                        {p}
                                    </label>
                                ))}
                            </div>

                            <div className="filter-group">
                                <h4>Sorteren op</h4>
                                <select className="input" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ fontSize: '0.875rem' }}>
                                    <option value="rating">Beste beoordeling</option>
                                    <option value="reviews">Meeste reviews</option>
                                    <option value="name">Naam (A-Z)</option>
                                </select>
                            </div>
                        </div>
                    </aside>

                    {/* Results */}
                    <main>
                        <div className="results-header">
                            <div>
                                <h2 style={{ fontSize: '1.25rem', marginBottom: 4 }}>{currentQuery}</h2>
                                <p className="results-count"><strong>{total}</strong> praktijken gevonden</p>
                            </div>
                        </div>

                        <div className="results-grid">
                            {practices.map((p) => (
                                <PracticeCard key={p.id} practice={p} />
                            ))}
                        </div>

                        {loading && (
                            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                                Laden...
                            </div>
                        )}

                        {!loading && practices.length === 0 && (
                            <div style={{ textAlign: 'center', padding: 60 }}>
                                <h3 style={{ marginBottom: 8 }}>Geen resultaten gevonden</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>Probeer een andere zoekterm of verwijder filters</p>
                            </div>
                        )}

                        {!loading && practices.length < total && (
                            <div style={{ textAlign: 'center', padding: 32 }}>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setPage(prev => prev + 1)}
                                >
                                    Meer laden ({total - practices.length} resterend)
                                </button>
                            </div>
                        )}
                    </main>
                </div>

                {/* Mobile filter button */}
                <button className="mobile-filter-btn">
                    <SlidersHorizontal size={18} />
                    Filters
                </button>
            </div>

            <Footer />
        </>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div style={{ textAlign: 'center', padding: 60 }}>Laden...</div>}>
            <SearchContent />
        </Suspense>
    );
}
