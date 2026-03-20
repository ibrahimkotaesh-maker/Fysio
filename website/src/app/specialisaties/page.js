import { supabase } from '@/lib/supabase';
import { toSlug } from '@/lib/slug';
import Link from 'next/link';
import { Activity, ArrowRight, Users } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
    title: 'Fysiotherapie Specialisaties — Alle Behandelingen | VindFysio',
    description: 'Overzicht van alle fysiotherapie specialisaties in Nederland. Van manuele therapie tot bekkenfysiotherapie — vind een specialist bij jou in de buurt.',
    alternates: {
        canonical: 'https://vindfysio.nl/specialisaties',
    },
    openGraph: {
        title: 'Fysiotherapie Specialisaties — Alle Behandelingen | VindFysio',
        description: 'Overzicht van alle fysiotherapie specialisaties in Nederland. Vind een specialist bij jou in de buurt.',
        url: 'https://vindfysio.nl/specialisaties',
        siteName: 'VindFysio',
        locale: 'nl_NL',
        type: 'website',
    },
};

// Spec display info
const SPEC_INFO = {
    'manuele therapie': { icon: '🦴', desc: 'Behandeling van rug-, nek- en gewrichtsklachten' },
    'revalidatie': { icon: '🏥', desc: 'Herstel na operatie, blessure of ziekte' },
    'dry needling': { icon: '📍', desc: 'Triggerpoints behandelen met dunne naalden' },
    'sportfysiotherapie': { icon: '⚽', desc: 'Sportblessures voorkomen en behandelen' },
    'ademhalingstherapie': { icon: '🫁', desc: 'Verbetering van longfunctie (COPD, astma)' },
    'medical taping': { icon: '🩹', desc: 'Elastische tape voor spier- en gewrichtsondersteuning' },
    'neurologische fysiotherapie': { icon: '🧠', desc: 'Bij beroerte, MS, Parkinson en meer' },
    'echografie': { icon: '📱', desc: 'Diagnostiek met echografie (MSK echo)' },
    'schouder specialist': { icon: '💪', desc: 'Frozen shoulder, impingement en meer' },
    'lymfedrainage': { icon: '💧', desc: 'Behandeling van oedeem en lymfoedeem' },
    'kinderfysiotherapie': { icon: '👶', desc: 'Motorische ontwikkeling van kinderen (0-18 jr)' },
    'shockwave therapie': { icon: '⚡', desc: 'Geluidsgolven bij chronische peesklachten' },
    'fysiotherapie aan huis': { icon: '🏠', desc: 'De fysiotherapeut komt bij u thuis' },
    'bekkenfysiotherapie': { icon: '🤰', desc: 'Bekkenbodemklachten en zwangerschap' },
    'geriatrie fysiotherapie': { icon: '🧓', desc: 'Speciaal voor ouderen en valpreventie' },
    'personal training': { icon: '🏋️', desc: 'Medisch verantwoord trainen' },
    'psychosomatische fysiotherapie': { icon: '🧘', desc: 'Lichamelijke klachten door stress/spanning' },
    'fysiofitness': { icon: '🏃', desc: 'Sporten onder begeleiding van een fysio' },
    'oncologische fysiotherapie': { icon: '🎗️', desc: 'Begeleiding bij en na kankerbehandeling' },
    'triggerpoint therapie': { icon: '🎯', desc: 'Pijnlijke spierknobbels behandelen' },
    'knie specialist': { icon: '🦵', desc: 'Kruisband, meniscus en knieartrose' },
    'kaakfysiotherapie': { icon: '😬', desc: 'Kaakklachten, CMD en tandenknarsen' },
    'looptraining': { icon: '🚶', desc: 'Verbetering van je looppatroon' },
    'bindweefsel therapie': { icon: '🤲', desc: 'Behandeling van fascia en bindweefsel' },
    'rugpijn specialist': { icon: '🔙', desc: 'Hernia, lage rugpijn en spit' },
    'BFR training': { icon: '💉', desc: 'Blood Flow Restriction voor spierherstel' },
    'nekpijn specialist': { icon: '🦒', desc: 'Nekklachten, whiplash en hoofdpijn' },
};

export default async function SpecializationsPage() {
    // Get counts for each specialization
    let allPractices = [];
    let page = 0;
    const pageSize = 1000;

    while (true) {
        const { data, error } = await supabase
            .from('practices')
            .select('specializations')
            .not('specializations', 'is', null)
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error || !data || data.length === 0) break;
        allPractices = allPractices.concat(data);
        if (data.length < pageSize) break;
        page++;
    }

    const specMap = {};
    allPractices.forEach(p => {
        if (!p.specializations) return;
        p.specializations.forEach(s => {
            specMap[s] = (specMap[s] || 0) + 1;
        });
    });

    const sortedSpecs = Object.entries(specMap).sort((a, b) => b[1] - a[1]);
    const totalWithSpecs = allPractices.length;

    return (
        <>
            <Header />

            {/* Hero */}
            <section className="city-hero">
                <div className="container">
                    <div className="city-breadcrumb">
                        <Link href="/">Home</Link>
                        <span>/</span>
                        <span className="current">Specialisaties</span>
                    </div>
                    <h1>
                        Fysiotherapie <span className="city-highlight">Specialisaties</span>
                    </h1>
                    <p className="city-subtitle">
                        Ontdek {sortedSpecs.length} specialisaties bij {totalWithSpecs.toLocaleString('nl-NL')} fysiotherapiepraktijken in Nederland.
                        Vind de juiste specialist voor jouw klacht.
                    </p>
                </div>
            </section>

            {/* Specialization Grid */}
            <section className="section">
                <div className="container">
                    <h2 style={{ marginBottom: 4 }}>Alle specialisaties</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.938rem' }}>
                        Klik op een specialisatie om alle praktijken te bekijken
                    </p>

                    <div className="city-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                        {sortedSpecs.map(([spec, count]) => {
                            const info = SPEC_INFO[spec] || { icon: '🏥', desc: spec };
                            return (
                                <Link
                                    key={spec}
                                    href={`/specialisatie/${toSlug(spec)}`}
                                    className="city-card"
                                    style={{ textDecoration: 'none' }}
                                >
                                    <div className="city-icon" style={{ fontSize: 24 }}>
                                        {info.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div className="city-name" style={{ marginBottom: 2 }}>
                                            {spec.charAt(0).toUpperCase() + spec.slice(1)}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                                            {info.desc}
                                        </div>
                                        <div className="city-count">
                                            {count} {count === 1 ? 'praktijk' : 'praktijken'}
                                        </div>
                                    </div>
                                    <ArrowRight size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section section-gray">
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 style={{ marginBottom: 12 }}>Weet je niet welke specialist je nodig hebt?</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                        Zoek op locatie of klacht en wij helpen je de juiste fysiotherapeut te vinden
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/zoeken" className="btn btn-primary">
                            Zoek een fysiotherapeut
                            <ArrowRight size={16} />
                        </Link>
                        <Link href="/steden" className="btn btn-outline">
                            Zoek per stad
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}
