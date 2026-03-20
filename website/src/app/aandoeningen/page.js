import Link from 'next/link';
import Image from 'next/image';
import { Stethoscope, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { aandoeningen } from '@/lib/aandoeningen';

export const metadata = {
    title: 'Aandoeningen & Klachten | Wat kan de fysiotherapeut doen? | VindFysio',
    description: 'Heb je last van een fysieke klacht of aandoening? Ontdek informatie over symptomen, oorzaken en fysiotherapiebehandelingen voor diverse gezondheidsklachten.',
    alternates: {
        canonical: 'https://vindfysio.nl/aandoeningen',
    },
    openGraph: {
        title: 'Aandoeningen & Klachten | VindFysio',
        description: 'Overzicht van fysieke aandoeningen en de bijbehorende fysiotherapeutische behandelingen.',
        url: 'https://vindfysio.nl/aandoeningen',
        siteName: 'VindFysio',
        locale: 'nl_NL',
        type: 'website',
    },
};

export default function AandoeningenPage() {
    // Group by category
    const categories = {};
    aandoeningen.forEach(item => {
        if (!categories[item.category]) categories[item.category] = [];
        categories[item.category].push(item);
    });

    return (
        <>
            <Header />

            {/* Hero */}
            <div className="blog-hero">
                <div className="container">
                    <h1>Informatie over <span className="city-highlight">Aandoeningen & Klachten</span></h1>
                    <p className="blog-subtitle">
                        Ontdek wat jouw klachten betekenen, wat de mogelijke oorzaken zijn en hoe fysiotherapie kan helpen bij het herstel.
                    </p>
                </div>
            </div>

            {/* Grid */}
            <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
                {Object.entries(categories).map(([category, items]) => (
                    <div key={category} style={{ marginBottom: 48 }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Stethoscope size={20} style={{ color: 'var(--primary)' }} />
                            {category}
                        </h2>
                        <div className="blog-grid">
                            {items.map(item => (
                                <Link
                                    key={item.slug}
                                    href={`/aandoening/${item.slug}`}
                                    className="blog-card"
                                >
                                    <div className="blog-card-image">
                                        <img
                                            src={`/images/aandoeningen/${item.slug}.png`}
                                            alt={item.title}
                                            loading="lazy"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div className="blog-card-body">
                                        <div className="blog-card-category">{item.category}</div>
                                        <h3 className="blog-card-title">{item.title}</h3>
                                        <p className="blog-card-description">{item.description}</p>
                                        <div className="blog-card-footer">
                                            <span className="blog-card-link">
                                                Lees meer over de behandeling <ArrowRight size={14} />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <Footer />
        </>
    );
}
