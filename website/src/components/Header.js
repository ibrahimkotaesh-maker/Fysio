'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function Header() {
    return (
        <header className="header">
            <div className="container header-inner">
                <Link href="/" className="logo">
                    <div className="logo-icon">
                        <Heart size={18} />
                    </div>
                    VindFysio
                </Link>
                <nav className="header-nav">
                    <Link href="/zoeken">Zoeken</Link>
                    <Link href="/steden">Steden</Link>
                    <Link href="/blog">Blog</Link>
                    <Link href="/over-ons">Over ons</Link>
                    <Link href="/contact">Contact</Link>
                </nav>
            </div>
        </header>
    );
}
