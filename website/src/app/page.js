'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, MapPin, Star, Phone, ArrowRight, Users, Building2, Map } from 'lucide-react';
import { toSlug } from '@/lib/slug';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const POPULAR_CITIES = [
  { name: 'Rotterdam', count: 88 },
  { name: 'Amsterdam', count: 87 },
  { name: 'Den Haag', count: 87 },
  { name: 'Nijmegen', count: 82 },
  { name: 'Maastricht', count: 79 },
  { name: 'Enschede', count: 78 },
  { name: "'s-Hertogenbosch", count: 75 },
  { name: 'Tilburg', count: 75 },
];

const SPECIALTIES = [
  'Sportfysiotherapie',
  'Manuele therapie',
  'Bekkenfysiotherapie',
  'Kinderfysiotherapie',
  'Revalidatie',
  'Geriatrie',
  'Dry needling',
  'Oedeem therapie',
];

export default function HomePage() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/zoeken?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <>
      <Header />

      {/* Hero */}
      <section className="hero">
        <div className="container hero-content animate-in">
          <h1>
            Vind jouw <span>fysiotherapeut</span>
          </h1>
          <p className="hero-subtitle">
            Zoek, vergelijk en neem contact op met fysiotherapeuten bij jou in de buurt.
            Snel en eenvoudig de juiste zorg vinden.
          </p>

          <form className="search-box" onSubmit={handleSearch}>
            <div className="search-box-inner">
              <div className="search-icon">
                <Search size={20} />
              </div>
              <input
                type="text"
                className="search-input"
                placeholder="Stad, postcode of naam..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" className="search-btn">
                <Search size={18} />
                Zoeken
              </button>
            </div>
          </form>

          <div className="quick-filters">
            {SPECIALTIES.map((s) => (
              <Link
                key={s}
                href={`/zoeken?q=${encodeURIComponent(s)}`}
                className="quick-filter"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section">
        <div className="container">
          <div className="stats-bar">
            <div className="stat">
              <div className="stat-number">4.200+</div>
              <div className="stat-label">Praktijken</div>
            </div>
            <div className="stat">
              <div className="stat-number">280+</div>
              <div className="stat-label">Steden</div>
            </div>
            <div className="stat">
              <div className="stat-number">12</div>
              <div className="stat-label">Provincies</div>
            </div>
            <div className="stat">
              <div className="stat-number">4.7</div>
              <div className="stat-label">Gem. beoordeling</div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="section section-gray">
        <div className="container">
          <div className="section-header">
            <h2>Populaire steden</h2>
            <p>Ontdek fysiotherapeuten in de meest gezochte steden van Nederland</p>
          </div>
          <div className="city-grid">
            {POPULAR_CITIES.map((city) => (
              <Link
                key={city.name}
                href={`/stad/${toSlug(city.name)}`}
                className="city-card"
              >
                <div className="city-icon">
                  <MapPin size={20} />
                </div>
                <div>
                  <div className="city-name">{city.name}</div>
                  <div className="city-count">{city.count} praktijken</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Hoe het werkt</h2>
            <p>In drie eenvoudige stappen de juiste fysiotherapeut vinden</p>
          </div>
          <div className="steps-grid">
            <div className="step">
              <div className="step-icon">
                <Search size={28} />
                <span className="step-number">1</span>
              </div>
              <h3>Zoeken</h3>
              <p>Voer jouw stad, postcode of klacht in en bekijk direct welke praktijken beschikbaar zijn.</p>
            </div>
            <div className="step">
              <div className="step-icon">
                <Star size={28} />
                <span className="step-number">2</span>
              </div>
              <h3>Vergelijken</h3>
              <p>Bekijk beoordelingen, specialisaties en beschikbaarheid om de beste keuze te maken.</p>
            </div>
            <div className="step">
              <div className="step-icon">
                <Phone size={28} />
                <span className="step-number">3</span>
              </div>
              <h3>Contact opnemen</h3>
              <p>Bel direct, bezoek de website of plan een afspraak bij de fysiotherapeut van jouw keuze.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section section-gray">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: 16 }}>Klaar om te zoeken?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
            Vind vandaag nog de fysiotherapeut die bij jou past
          </p>
          <Link href="/zoeken" className="btn btn-primary btn-lg">
            Bekijk alle praktijken
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
