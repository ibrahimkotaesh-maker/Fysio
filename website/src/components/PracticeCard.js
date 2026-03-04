'use client';

import Link from 'next/link';
import { MapPin, Phone, Globe, ArrowRight } from 'lucide-react';
import StarRating from './StarRating';

export default function PracticeCard({ practice }) {
    const slug = practice.google_place_id;

    return (
        <Link href={`/praktijk/${slug}`} className="practice-card">
            {practice.image_url && (
                <div className="practice-card-thumb">
                    <img
                        src={practice.image_url}
                        alt={practice.name}
                        loading="lazy"
                        onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                    />
                </div>
            )}
            <div className="practice-info">
                <h3 className="practice-name">{practice.name}</h3>
                <div className="practice-address">
                    <MapPin size={14} />
                    {practice.city && `${practice.city}`}
                    {practice.postal_code && ` · ${practice.postal_code}`}
                </div>
                {practice.rating && (
                    <div style={{ marginBottom: 8 }}>
                        <StarRating rating={practice.rating} count={practice.reviews_count} />
                    </div>
                )}
                {practice.specializations && practice.specializations.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                        {practice.specializations.slice(0, 3).map(spec => (
                            <span key={spec} className="spec-tag" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                                {spec}
                            </span>
                        ))}
                        {practice.specializations.length > 3 && (
                            <span className="spec-tag" style={{ fontSize: '0.65rem', padding: '2px 8px', background: '#F3F4F6', color: '#6B7280', borderColor: '#E5E7EB' }}>
                                +{practice.specializations.length - 3}
                            </span>
                        )}
                    </div>
                )}
                <div className="practice-tags">
                    {practice.province && (
                        <span className="tag tag-primary">{practice.province}</span>
                    )}
                    {practice.phone && (
                        <span className="tag">
                            <Phone size={11} /> Telefoon
                        </span>
                    )}
                    {practice.website && (
                        <span className="tag">
                            <Globe size={11} /> Website
                        </span>
                    )}
                </div>
            </div>
            <div className="practice-cta">
                <div className="btn btn-outline btn-sm">
                    Bekijk details
                    <ArrowRight size={14} />
                </div>
            </div>
        </Link>
    );
}
