import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Heart, Users, Target, Shield } from 'lucide-react';

export const metadata = {
    title: 'Over ons — FysioVind',
    description: 'Leer meer over FysioVind en onze missie om fysiotherapie toegankelijker te maken in Nederland.',
};

export default function OverOns() {
    return (
        <>
            <Header />
            <div className="section">
                <div className="container" style={{ maxWidth: 720 }}>
                    <h1 style={{ marginBottom: 16 }}>Over FysioVind</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', marginBottom: 48, lineHeight: 1.7 }}>
                        FysioVind is dé plek om snel en eenvoudig een fysiotherapeut bij jou in de buurt te vinden.
                        Wij geloven dat iedereen snel toegang moet hebben tot goede fysiotherapeutische zorg.
                    </p>

                    <div className="steps-grid" style={{ textAlign: 'left' }}>
                        <div className="step" style={{ textAlign: 'center' }}>
                            <div className="step-icon">
                                <Target size={28} />
                            </div>
                            <h3>Onze missie</h3>
                            <p>Fysiotherapie toegankelijker maken door de juiste informatie op één plek te verzamelen.</p>
                        </div>
                        <div className="step" style={{ textAlign: 'center' }}>
                            <div className="step-icon">
                                <Users size={28} />
                            </div>
                            <h3>Voor iedereen</h3>
                            <p>Of je nu sportblessures hebt, rugklachten of revalidatie nodig hebt — wij helpen je zoeken.</p>
                        </div>
                        <div className="step" style={{ textAlign: 'center' }}>
                            <div className="step-icon">
                                <Shield size={28} />
                            </div>
                            <h3>Betrouwbaar</h3>
                            <p>Alle informatie is afkomstig uit officiële bronnen en wordt regelmatig bijgewerkt.</p>
                        </div>
                    </div>

                    <div style={{ marginTop: 48, padding: 32, background: 'var(--primary-light)', borderRadius: 'var(--radius-md)' }}>
                        <h3 style={{ marginBottom: 8 }}>In cijfers</h3>
                        <div className="stats-bar" style={{ justifyContent: 'flex-start', gap: 40, padding: '16px 0 0' }}>
                            <div className="stat">
                                <div className="stat-number" style={{ fontSize: '1.5rem' }}>1.945</div>
                                <div className="stat-label">Praktijken</div>
                            </div>
                            <div className="stat">
                                <div className="stat-number" style={{ fontSize: '1.5rem' }}>190</div>
                                <div className="stat-label">Steden</div>
                            </div>
                            <div className="stat">
                                <div className="stat-number" style={{ fontSize: '1.5rem' }}>12</div>
                                <div className="stat-label">Provincies</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
