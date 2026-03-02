import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <div className="logo" style={{ color: 'white' }}>
                            <div className="logo-icon">
                                <Heart size={18} />
                            </div>
                            FysioVind
                        </div>
                        <p>
                            Dé plek om snel en eenvoudig de juiste fysiotherapeut bij jou in de buurt te vinden.
                            Vergelijk praktijken, lees beoordelingen en neem direct contact op.
                        </p>
                    </div>
                    <div>
                        <h4>Populaire steden</h4>
                        <ul>
                            <li><Link href="/zoeken?city=Amsterdam">Amsterdam</Link></li>
                            <li><Link href="/zoeken?city=Rotterdam">Rotterdam</Link></li>
                            <li><Link href="/zoeken?city=Den+Haag">Den Haag</Link></li>
                            <li><Link href="/zoeken?city=Utrecht">Utrecht</Link></li>
                            <li><Link href="/zoeken?city=Eindhoven">Eindhoven</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4>Specialisaties</h4>
                        <ul>
                            <li><Link href="/zoeken?q=sportfysiotherapie">Sportfysiotherapie</Link></li>
                            <li><Link href="/zoeken?q=manuele+therapie">Manuele therapie</Link></li>
                            <li><Link href="/zoeken?q=bekkenfysiotherapie">Bekkenfysiotherapie</Link></li>
                            <li><Link href="/zoeken?q=kinderfysiotherapie">Kinderfysiotherapie</Link></li>
                            <li><Link href="/zoeken?q=revalidatie">Revalidatie</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4>Over FysioVind</h4>
                        <ul>
                            <li><Link href="/over-ons">Over ons</Link></li>
                            <li><Link href="/contact">Contact</Link></li>
                            <li><Link href="/privacy">Privacybeleid</Link></li>
                            <li><Link href="/voorwaarden">Voorwaarden</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    © {new Date().getFullYear()} FysioVind.nl — Alle rechten voorbehouden
                </div>
            </div>
        </footer>
    );
}
