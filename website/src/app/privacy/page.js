import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
    title: 'Privacybeleid — VindFysio',
    description: 'Lees het privacybeleid van VindFysio.nl.',
};

export default function Privacy() {
    return (
        <>
            <Header />
            <div className="section">
                <div className="container" style={{ maxWidth: 720 }}>
                    <h1 style={{ marginBottom: 24 }}>Privacybeleid</h1>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontSize: '0.938rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                        <div>
                            <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>1. Gegevensverzameling</h3>
                            <p>VindFysio verzamelt alleen openbaar beschikbare informatie over fysiotherapiepraktijken in Nederland, zoals naam, adres, telefoonnummer, website en beoordelingen uit openbare bronnen.</p>
                        </div>
                        <div>
                            <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>2. Gebruik van gegevens</h3>
                            <p>De verzamelde gegevens worden uitsluitend gebruikt om bezoekers van deze website te helpen bij het vinden van een fysiotherapeut bij hen in de buurt.</p>
                        </div>
                        <div>
                            <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>3. Cookies</h3>
                            <p>Deze website maakt gebruik van functionele cookies die noodzakelijk zijn voor de werking van de website. We gebruiken geen tracking cookies of analytic cookies zonder uw toestemming.</p>
                        </div>
                        <div>
                            <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>4. Contact</h3>
                            <p>Heeft u vragen over ons privacybeleid of wilt u dat uw gegevens worden verwijderd? Neem dan contact met ons op via info@vindfysio.nl.</p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
