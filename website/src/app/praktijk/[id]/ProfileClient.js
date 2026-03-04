'use client';

import Link from 'next/link';
import { MapPin, Phone, Globe, Clock, Star, ArrowLeft, ExternalLink, Navigation, CheckCircle, Shield, Tag } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StarRating from '@/components/StarRating';
import PracticeCard from '@/components/PracticeCard';

export default function ProfileClient({ practice, similar }) {
    return (
        <>
            <Header />

            {/* Breadcrumb */}
            <div style={{ background: 'var(--bg-gray)', borderBottom: '1px solid var(--border)', padding: '12px 0' }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <Link href="/zoeken" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ArrowLeft size={14} />
                        Terug naar resultaten
                    </Link>
                    <span>/</span>
                    <span>{practice.city}</span>
                    <span>/</span>
                    <span style={{ color: 'var(--text)' }}>{practice.name}</span>
                </div>
            </div>

            {/* Hero Image */}
            {practice.image_url && (
                <div className="practice-hero-image">
                    <img
                        src={practice.image_url}
                        alt={`${practice.name} - Fysiotherapie`}
                        onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                    />
                    <div className="practice-hero-overlay" />
                </div>
            )}

            {/* Profile Header */}
            <div className="profile-header">
                <div className="container">
                    <div className="profile-top">
                        <div className="profile-title">
                            <h1>{practice.name}</h1>
                            <div style={{ marginBottom: 8 }}>
                                <StarRating rating={practice.rating} count={practice.reviews_count} />
                            </div>
                            <div className="profile-meta">
                                <div className="profile-meta-item">
                                    <MapPin size={16} />
                                    {practice.address}
                                </div>
                                {practice.province && (
                                    <span className="tag tag-primary">{practice.province}</span>
                                )}
                            </div>
                            {/* Specializations */}
                            {practice.specializations && practice.specializations.length > 0 && (
                                <div className="specializations-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                                    {practice.specializations.map(spec => (
                                        <span key={spec} className="spec-tag">
                                            {spec}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="profile-cta-bar">
                            {practice.phone && (
                                <a href={`tel:${practice.phone}`} className="btn btn-primary">
                                    <Phone size={16} />
                                    Bellen
                                </a>
                            )}
                            {practice.website && (
                                <a href={practice.website} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                                    <Globe size={16} />
                                    Website
                                </a>
                            )}
                            {practice.google_maps_url && (
                                <a href={practice.google_maps_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                                    <Navigation size={16} />
                                    Route
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Body */}
            <div className="container">
                <div className="profile-body">
                    {/* Main Content */}
                    <div>
                        {/* Description */}
                        {practice.description && (
                            <div className="profile-section">
                                <h2>Over deze praktijk</h2>
                                <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                    {practice.description}
                                </p>
                            </div>
                        )}

                        {/* Contact Info */}
                        <div className="profile-section">
                            <h2>Contactgegevens</h2>
                            <div className="info-list">
                                <div className="info-item">
                                    <div className="info-icon"><MapPin size={18} /></div>
                                    <div>
                                        <div className="info-label">Adres</div>
                                        <div className="info-value">{practice.address}</div>
                                    </div>
                                </div>
                                {practice.phone && (
                                    <div className="info-item">
                                        <div className="info-icon"><Phone size={18} /></div>
                                        <div>
                                            <div className="info-label">Telefoon</div>
                                            <div className="info-value">
                                                <a href={`tel:${practice.phone}`} style={{ color: 'var(--primary)' }}>{practice.phone}</a>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {practice.website && (
                                    <div className="info-item">
                                        <div className="info-icon"><Globe size={18} /></div>
                                        <div>
                                            <div className="info-label">Website</div>
                                            <div className="info-value">
                                                <a href={practice.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    Bezoek website <ExternalLink size={12} />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Location Info */}
                        <div className="profile-section">
                            <h2>Locatie</h2>
                            <div style={{ background: 'var(--bg-gray)', borderRadius: 'var(--radius-md)', padding: 24, textAlign: 'center' }}>
                                {practice.latitude && practice.longitude ? (
                                    <div>
                                        <div style={{
                                            width: '100%',
                                            height: 300,
                                            borderRadius: 'var(--radius-md)',
                                            overflow: 'hidden',
                                            marginBottom: 16
                                        }}>
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                style={{ border: 0 }}
                                                loading="lazy"
                                                src={`https://www.google.com/maps?q=${practice.latitude},${practice.longitude}&output=embed`}
                                            />
                                        </div>
                                        <a
                                            href={practice.google_maps_url || `https://www.google.com/maps?q=${practice.latitude},${practice.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-outline btn-sm"
                                        >
                                            <Navigation size={14} />
                                            Open in Google Maps
                                        </a>
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--text-muted)' }}>Locatie niet beschikbaar</p>
                                )}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="profile-section">
                            <h2>Details</h2>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {practice.postal_code && <span className="tag">📮 {practice.postal_code}</span>}
                                {practice.city && <span className="tag">🏙️ {practice.city}</span>}
                                {practice.province && <span className="tag tag-primary">📍 {practice.province}</span>}
                                {practice.business_status === 'OPERATIONAL' && <span className="tag" style={{ background: '#ECFDF5', color: '#059669' }}>✅ Actief</span>}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="profile-sidebar">
                        {/* Quick Info */}
                        <div className="sidebar-card">
                            <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>Snel overzicht</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Beoordeling</span>
                                    <span style={{ fontWeight: 600 }}>
                                        {practice.rating ? `${practice.rating.toFixed(1)} ★` : 'Geen'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Reviews</span>
                                    <span style={{ fontWeight: 600 }}>{practice.reviews_count || 0}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Stad</span>
                                    <span style={{ fontWeight: 600 }}>{practice.city || '-'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Provincie</span>
                                    <span style={{ fontWeight: 600 }}>{practice.province || '-'}</span>
                                </div>
                                {practice.no_referral_needed && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Verwijzing</span>
                                        <span style={{ fontWeight: 600, color: '#059669', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <CheckCircle size={14} /> Niet nodig
                                        </span>
                                    </div>
                                )}
                                {practice.all_insurances && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Verzekering</span>
                                        <span style={{ fontWeight: 600, color: '#059669', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Shield size={14} /> Alle verzekeraars
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CTA Card */}
                        <div className="sidebar-card" style={{ background: 'var(--primary-light)', borderColor: 'transparent' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: 8 }}>Contact opnemen?</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                                Neem direct contact op met deze praktijk
                            </p>
                            {practice.phone && (
                                <a href={`tel:${practice.phone}`} className="btn btn-primary" style={{ width: '100%', marginBottom: 8 }}>
                                    <Phone size={16} />
                                    {practice.phone}
                                </a>
                            )}
                            {practice.website && (
                                <a href={practice.website} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ width: '100%', background: 'white' }}>
                                    <Globe size={16} />
                                    Bezoek website
                                </a>
                            )}
                        </div>
                    </aside>
                </div>

                {/* Similar Practices */}
                {similar.length > 0 && (
                    <div className="section" style={{ borderTop: '1px solid var(--border)' }}>
                        <h2 style={{ marginBottom: 20 }}>
                            Meer fysiotherapeuten in {practice.city}
                        </h2>
                        <div className="results-grid">
                            {similar.map(p => (
                                <PracticeCard key={p.id} practice={p} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </>
    );
}
