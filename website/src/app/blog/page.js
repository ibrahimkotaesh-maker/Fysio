import Link from 'next/link';
import { FileText, Clock, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { articles } from '@/lib/articles';

export const metadata = {
    title: 'Blog — Alles over Fysiotherapie | VindFysio',
    description: 'Lees onze artikelen over fysiotherapie: kosten, vergoedingen, behandelingen en praktische tips. Alles wat je moet weten over fysiotherapie in Nederland.',
    alternates: {
        canonical: 'https://vindfysio.nl/blog',
    },
    openGraph: {
        title: 'Blog — Alles over Fysiotherapie | VindFysio',
        description: 'Lees onze artikelen over fysiotherapie: kosten, vergoedingen, behandelingen en praktische tips.',
        url: 'https://vindfysio.nl/blog',
        siteName: 'VindFysio',
        locale: 'nl_NL',
        type: 'website',
    },
};

export default function BlogPage() {
    // Group articles by category
    const categories = {};
    articles.forEach(article => {
        if (!categories[article.category]) categories[article.category] = [];
        categories[article.category].push(article);
    });

    return (
        <>
            <Header />

            {/* Hero */}
            <div className="blog-hero">
                <div className="container">
                    <h1>Alles over <span className="city-highlight">fysiotherapie</span></h1>
                    <p className="blog-subtitle">
                        Praktische artikelen over kosten, vergoedingen, behandelingen en meer.
                        Alles wat je moet weten voordat je naar de fysiotherapeut gaat.
                    </p>
                </div>
            </div>

            {/* Articles Grid */}
            <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
                {Object.entries(categories).map(([category, categoryArticles]) => (
                    <div key={category} style={{ marginBottom: 48 }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FileText size={20} style={{ color: 'var(--primary)' }} />
                            {category}
                        </h2>
                        <div className="blog-grid">
                            {categoryArticles.map(article => (
                                <Link
                                    key={article.slug}
                                    href={`/blog/${article.slug}`}
                                    className="blog-card"
                                >
                                    <div className="blog-card-category">{article.category}</div>
                                    <h3 className="blog-card-title">{article.title}</h3>
                                    <p className="blog-card-description">{article.description}</p>
                                    <div className="blog-card-footer">
                                        <span className="blog-card-meta">
                                            <Clock size={14} />
                                            {article.readTime} leestijd
                                        </span>
                                        <span className="blog-card-link">
                                            Lees meer <ArrowRight size={14} />
                                        </span>
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
