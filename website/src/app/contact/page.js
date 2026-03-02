import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Mail, MapPin, MessageSquare } from 'lucide-react';

export const metadata = {
    title: 'Contact — FysioVind',
    description: 'Neem contact op met FysioVind. Heb je vragen, feedback of wil je een praktijk aanmelden?',
};

export default function Contact() {
    return (
        <>
            <Header />
            <div className="section">
                <div className="container" style={{ maxWidth: 720 }}>
                    <h1 style={{ marginBottom: 16 }}>Contact</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', marginBottom: 48 }}>
                        Heb je vragen, feedback of wil je je praktijk aanmelden? Neem gerust contact met ons op.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginBottom: 48 }}>
                        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
                            <div className="step-icon" style={{ margin: '0 auto 16px' }}>
                                <Mail size={24} />
                            </div>
                            <h3 style={{ marginBottom: 8 }}>E-mail</h3>
                            <a href="mailto:info@fysiovind.nl" style={{ color: 'var(--primary)' }}>info@fysiovind.nl</a>
                        </div>
                        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
                            <div className="step-icon" style={{ margin: '0 auto 16px' }}>
                                <MessageSquare size={24} />
                            </div>
                            <h3 style={{ marginBottom: 8 }}>Feedback</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>We horen graag jouw suggesties</p>
                        </div>
                        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
                            <div className="step-icon" style={{ margin: '0 auto 16px' }}>
                                <MapPin size={24} />
                            </div>
                            <h3 style={{ marginBottom: 8 }}>Locatie</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Nederland</p>
                        </div>
                    </div>

                    <div style={{ padding: 32, background: 'var(--bg-gray)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                        <h3 style={{ marginBottom: 20 }}>Stuur een bericht</h3>
                        <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <input className="input" placeholder="Naam" />
                                <input className="input" type="email" placeholder="E-mailadres" />
                            </div>
                            <input className="input" placeholder="Onderwerp" />
                            <textarea className="input" placeholder="Jouw bericht..." rows={5} style={{ resize: 'vertical' }} />
                            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                                Versturen
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
