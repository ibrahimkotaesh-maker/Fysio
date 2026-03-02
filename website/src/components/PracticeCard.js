'use client';

import Link from 'next/link';
import { MapPin, Phone, Globe, ArrowRight } from 'lucide-react';
import StarRating from './StarRating';

export default function PracticeCard({ practice }) {
    const slug = practice.google_place_id;

    return (
        <Link href={`/praktijk/${slug}`} className="practice-card">
            <div className="practice-info">
                <h3 className="practice-name">{practice.name}</h3>
                <div className="practice-address">
                    <MapPin size={14} />
                    {practice.city && `${practice.city}`}
                    {practice.postal_code && ` · ${practice.postal_code}`}
                </div>
                {practice.rating && (
                    <div style={{ marginBottom: 12 }}>
                        <StarRating rating={practice.rating} count={practice.reviews_count} />
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
