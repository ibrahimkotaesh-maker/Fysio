'use client';

import Link from 'next/link';

export default function Header() {
    return (
        <header className="header">
            <div className="container header-inner">
                <Link href="/" className="logo">
                    <img
                        src="/logo.svg"
                        alt="VindFysio Logo"
                        width={32}
                        height={32}
                        className="logo-img"
                    />
                    VindFysio
                </Link>
                <nav className="header-nav">
                    <Link href="/zoeken">Zoeken</Link>
                    <Link href="/steden">Steden</Link>
                    <Link href="/specialisaties">Specialisaties</Link>
                    <Link href="/blog">Blog</Link>
                    <Link href="/aandoeningen">Aandoeningen</Link>
                    <Link href="/over-ons">Over ons</Link>
                    <Link href="/contact">Contact</Link>
                </nav>
            </div>
        </header>
    );
}
