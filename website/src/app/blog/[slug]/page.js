import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getArticleBySlug, getAllSlugs, articles } from '@/lib/articles';

export async function generateStaticParams() {
    return getAllSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const article = getArticleBySlug(slug);
    if (!article) return { title: 'Artikel niet gevonden' };

    return {
        title: article.metaTitle,
        description: article.description,
        alternates: {
            canonical: `https://vindfysio.nl/blog/${slug}`,
        },
        openGraph: {
            title: article.metaTitle,
            description: article.description,
            url: `https://vindfysio.nl/blog/${slug}`,
            siteName: 'VindFysio',
            locale: 'nl_NL',
            type: 'article',
            publishedTime: article.publishedAt,
            modifiedTime: article.updatedAt,
        },
    };
}

function ArticleJsonLd({ article }) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.description,
        datePublished: article.publishedAt,
        dateModified: article.updatedAt,
        author: {
            '@type': 'Organization',
            name: 'VindFysio',
            url: 'https://vindfysio.nl',
        },
        publisher: {
            '@type': 'Organization',
            name: 'VindFysio',
            url: 'https://vindfysio.nl',
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://vindfysio.nl/blog/${article.slug}`,
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

// Simple markdown-to-html converter for our articles
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

        // Empty line — flush any open blocks
        if (!trimmed) {
            if (inTable) flushTable();
            if (inBlockquote) flushBlockquote();
            if (inList) flushList();
            continue;
        }

        // Table row
        if (trimmed.startsWith('|')) {
            if (!inTable) inTable = true;
            if (inList) flushList();
            if (inBlockquote) flushBlockquote();
            tableRows.push(trimmed);
            continue;
        } else if (inTable) {
            flushTable();
        }

        // Blockquote
        if (trimmed.startsWith('> ')) {
            if (inList) flushList();
            inBlockquote = true;
            blockquoteLines.push(trimmed.slice(2).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'));
            continue;
        } else if (inBlockquote) {
            flushBlockquote();
        }

        // List item
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

        // Headers
        if (trimmed.startsWith('### ')) {
            html.push(`<h3>${trimmed.slice(4)}</h3>`);
        } else if (trimmed.startsWith('## ')) {
            html.push(`<h2>${trimmed.slice(3)}</h2>`);
        }
        // Numbered list items
        else if (/^\d+\.\s/.test(trimmed)) {
            let text = trimmed.replace(/^\d+\.\s/, '')
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            html.push(`<div class="article-step"><span class="step-number">${trimmed.match(/^\d+/)[0]}</span><span>${text}</span></div>`);
        }
        // Regular paragraph
        else {
            let text = trimmed
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
            html.push(`<p>${text}</p>`);
        }
    }

    // Flush remaining blocks
    if (inTable) flushTable();
    if (inBlockquote) flushBlockquote();
    if (inList) flushList();

    return html.join('\n');
}

export default async function ArticlePage({ params }) {
    const { slug } = await params;
    const article = getArticleBySlug(slug);

    if (!article) notFound();

    // Get related articles (same category, different slug)
    const related = articles
        .filter(a => a.slug !== slug)
        .slice(0, 3);

    const contentHtml = renderMarkdown(article.content);

    return (
        <>
            <ArticleJsonLd article={article} />
            <Header />

            {/* Breadcrumb */}
            <div style={{ background: 'var(--bg-gray)', borderBottom: '1px solid var(--border)', padding: '12px 0' }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <Link href="/" style={{ color: 'var(--primary)' }}>Home</Link>
                    <ChevronRight size={14} />
                    <Link href="/blog" style={{ color: 'var(--primary)' }}>Blog</Link>
                    <ChevronRight size={14} />
                    <span style={{ color: 'var(--text)' }}>{article.title.substring(0, 50)}...</span>
                </div>
            </div>

            {/* Article */}
            <div className="container" style={{ maxWidth: 760, paddingTop: 40, paddingBottom: 60 }}>
                {/* Article Header */}
                <div style={{ marginBottom: 32 }}>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 16, fontSize: '0.85rem' }}>
                        <span className="blog-card-category">{article.category}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
                            <Clock size={14} /> {article.readTime} leestijd
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
                            <Calendar size={14} /> {new Date(article.updatedAt).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.3, letterSpacing: '-0.02em' }}>
                        {article.title}
                    </h1>
                    <p style={{ marginTop: 12, fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {article.description}
                    </p>
                </div>

                {/* Article Content */}
                <div className="article-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />

                {/* CTA */}
                <div className="article-cta">
                    <h3>Fysiotherapeut zoeken?</h3>
                    <p>Vind de beste fysiotherapeut bij jou in de buurt op VindFysio.</p>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <Link href="/zoeken" className="btn btn-primary">
                            Zoek fysiotherapeut
                        </Link>
                        <Link href="/steden" className="btn btn-outline">
                            Bekijk alle steden
                        </Link>
                    </div>
                </div>

                {/* Related Articles */}
                {related.length > 0 && (
                    <div style={{ marginTop: 48 }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 20 }}>
                            Lees ook
                        </h2>
                        <div className="blog-grid">
                            {related.map(a => (
                                <Link key={a.slug} href={`/blog/${a.slug}`} className="blog-card">
                                    <div className="blog-card-category">{a.category}</div>
                                    <h3 className="blog-card-title" style={{ fontSize: '1rem' }}>{a.title}</h3>
                                    <div className="blog-card-footer">
                                        <span className="blog-card-meta">
                                            <Clock size={14} />
                                            {a.readTime}
                                        </span>
                                    </div>
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
