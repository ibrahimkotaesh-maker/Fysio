import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, ChevronRight, Stethoscope } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getAandoeningBySlug, getAllAandoeningenSlugs, aandoeningen } from '@/lib/aandoeningen';

export async function generateStaticParams() {
    return getAllAandoeningenSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const aandoening = getAandoeningBySlug(slug);
    if (!aandoening) return { title: 'Aandoening niet gevonden' };

    return {
        title: aandoening.metaTitle || aandoening.title,
        description: aandoening.description,
        alternates: {
            canonical: `https://vindfysio.nl/aandoening/${slug}`,
        },
        openGraph: {
            title: aandoening.metaTitle || aandoening.title,
            description: aandoening.description,
            url: `https://vindfysio.nl/aandoening/${slug}`,
            siteName: 'VindFysio',
            locale: 'nl_NL',
            type: 'article',
            publishedTime: aandoening.publishedAt,
            modifiedTime: aandoening.updatedAt,
            images: [
                {
                    url: `https://vindfysio.nl/images/aandoeningen/${slug}.png`,
                    width: 1200,
                    height: 630,
                    alt: aandoening.title,
                },
            ],
        },
    };
}

function ArticleJsonLd({ article }) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'MedicalCondition',
        name: article.title,
        description: article.description,
        possibleTreatment: [
            {
                '@type': 'MedicalTherapy',
                name: 'Fysiotherapie',
            }
        ],
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://vindfysio.nl/aandoening/${article.slug}`,
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

// Simple markdown-to-html converter (reused from blog)
function renderMarkdown(content) {
    const lines = content.split('\n');
    const html = [];
    let inTable = false;
    let tableRows = [];
    let inBlockquote = false;
    let blockquoteLines = [];
    let inList = false;
    let listItems = [];

    function flushTable() {
        if (tableRows.length < 2) return;
        const headers = tableRows[0].split('|').filter(c => c.trim()).map(c => c.trim());
        const rows = tableRows.slice(2); // skip header + separator
        const tableHtml = `<div class="article-table-wrap"><table class="article-table"><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(row => {
            const cells = row.split('|').filter(c => c.trim()).map(c => c.trim());
            return `<tr>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`;
        }).join('')}</tbody></table></div>`;
        html.push(tableHtml);
        tableRows = [];
        inTable = false;
    }

    function flushBlockquote() {
        html.push(`<blockquote class="article-callout">${blockquoteLines.join(' ')}</blockquote>`);
        blockquoteLines = [];
        inBlockquote = false;
    }

    function flushList() {
        html.push(`<ul class="article-list">${listItems.map(li => `<li>${li}</li>`).join('')}</ul>`);
        listItems = [];
        inList = false;
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        if (!trimmed) {
            if (inTable) flushTable();
            if (inBlockquote) flushBlockquote();
            if (inList) flushList();
            continue;
        }

        if (trimmed.startsWith('|')) {
            if (!inTable) inTable = true;
            if (inList) flushList();
            if (inBlockquote) flushBlockquote();
            tableRows.push(trimmed);
            continue;
        } else if (inTable) {
            flushTable();
        }

        if (trimmed.startsWith('> ')) {
            if (inList) flushList();
            inBlockquote = true;
            blockquoteLines.push(trimmed.slice(2).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'));
            continue;
        } else if (inBlockquote) {
            flushBlockquote();
        }

        if (trimmed.startsWith('- ')) {
            inList = true;
            let text = trimmed.slice(2)
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
            listItems.push(text);
            continue;
        } else if (inList) {
            flushList();
        }

        if (trimmed.startsWith('### ')) {
            html.push(`<h3>${trimmed.slice(4)}</h3>`);
        } else if (trimmed.startsWith('## ')) {
            html.push(`<h2>${trimmed.slice(3)}</h2>`);
        }
        else if (/^\d+\.\s/.test(trimmed)) {
            let text = trimmed.replace(/^\d+\.\s/, '')
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            html.push(`<div class="article-step"><span class="step-number">${trimmed.match(/^\d+/)[0]}</span><span>${text}</span></div>`);
        }
        else {
            let text = trimmed
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
            html.push(`<p>${text}</p>`);
        }
    }

    if (inTable) flushTable();
    if (inBlockquote) flushBlockquote();
    if (inList) flushList();

    return html.join('\n');
}

export default async function AandoeningPage({ params }) {
    const { slug } = await params;
    const aandoening = getAandoeningBySlug(slug);

    if (!aandoening) notFound();

    // Get related from same category
    const related = aandoeningen
        .filter(a => a.slug !== slug && a.category === aandoening.category)
        .slice(0, 3);

    const contentHtml = renderMarkdown(aandoening.content);

    return (
        <>
            <ArticleJsonLd article={aandoening} />
            <Header />

            {/* Breadcrumb */}
            <div style={{ background: 'var(--bg-gray)', borderBottom: '1px solid var(--border)', padding: '12px 0' }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <Link href="/" style={{ color: 'var(--primary)' }}>Home</Link>
                    <ChevronRight size={14} />
                    <Link href="/aandoeningen" style={{ color: 'var(--primary)' }}>Aandoeningen</Link>
                    <ChevronRight size={14} />
                    <span style={{ color: 'var(--text)' }}>{aandoening.title.substring(0, 50)}...</span>
                </div>
            </div>

            {/* Article */}
            <div className="container" style={{ maxWidth: 760, paddingTop: 40, paddingBottom: 60 }}>
                {/* Article Header */}
                <div style={{ marginBottom: 32 }}>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 16, fontSize: '0.85rem' }}>
                        <span className="blog-card-category">{aandoening.category}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
                            <Clock size={14} /> {aandoening.readTime} leestijd
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
                            <Calendar size={14} /> {new Date(aandoening.updatedAt).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.3, letterSpacing: '-0.02em' }}>
                        {aandoening.title}
                    </h1>
                    <p style={{ marginTop: 12, fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {aandoening.description}
                    </p>
                </div>

                {/* Hero Image */}
                <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 32, aspectRatio: '16/9', position: 'relative' }}>
                    <img
                        src={`/images/aandoeningen/${aandoening.slug}.png`}
                        alt={aandoening.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }}
                    />
                </div>

                {/* Article Content */}
                <div className="article-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />

                {/* CTA */}
                <div className="article-cta" style={{ marginTop: 40 }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Stethoscope size={24} style={{ color: 'white' }} />
                        Deskundige hulp nodig bij {aandoening.title.split(' ')[0]}?
                    </h3>
                    <p>Wacht niet te lang met klachten. Vind direct een gespecialiseerde fysiotherapeut bij jou in de buurt die je kan helpen bij het herstel.</p>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
                        <Link href="/zoeken" className="btn btn-primary" style={{ background: 'white', color: 'var(--primary)' }}>
                            Zoek fysiotherapeut
                        </Link>
                    </div>
                </div>

                {/* Related */}
                {related.length > 0 && (
                    <div style={{ marginTop: 48 }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 20 }}>
                            Gerelateerde aandoeningen
                        </h2>
                        <div className="blog-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                            {related.map(a => (
                                <Link key={a.slug} href={`/aandoening/${a.slug}`} className="blog-card" style={{ padding: 16 }}>
                                    <h3 className="blog-card-title" style={{ fontSize: '1rem', marginBottom: 4 }}>{a.title}</h3>
                                    <p className="blog-card-description" style={{ fontSize: '0.85rem' }}>{a.description.substring(0, 80)}...</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </>
    );
}
