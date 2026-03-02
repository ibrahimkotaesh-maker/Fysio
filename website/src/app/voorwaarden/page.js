import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
    title: 'Voorwaarden — FysioVind',
    description: 'Lees de algemene voorwaarden van FysioVind.nl.',
};

export default function Voorwaarden() {
    return (
        <>
            <Header />
            <div className="section">
                <div className="container" style={{ maxWidth: 720 }}>
                    <h1 style={{ marginBottom: 24 }}>Algemene Voorwaarden</h1>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontSize: '0.938rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                        <div>
                            <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>1. Doel van de website</h3>
                            <p>FysioVind.nl is een informatieplatform dat bezoekers helpt bij het vinden van fysiotherapiepraktijken in Nederland. De informatie op deze website is uitsluitend bedoeld ter informatie.</p>
                        </div>
                        <div>
                            <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>2. Aansprakelijkheid</h3>
                            <p>Hoewel wij ons best doen om de informatie op deze website actueel en correct te houden, kunnen wij geen garantie geven over de nauwkeurigheid of volledigheid van de gepubliceerde informatie.</p>
                        </div>
                        <div>
                            <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>3. Externe links</h3>
                            <p>Deze website bevat links naar websites van derden. FysioVind is niet verantwoordelijk voor de inhoud van deze externe websites.</p>
                        </div>
                        <div>
                            <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>4. Wijzigingen</h3>
                            <p>FysioVind behoudt zich het recht voor om deze voorwaarden te allen tijde te wijzigen. We raden aan om deze pagina regelmatig te raadplegen.</p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
