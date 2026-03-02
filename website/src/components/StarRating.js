'use client';

import { Star } from 'lucide-react';

export default function StarRating({ rating, count }) {
    const stars = [];
    const r = Math.round((rating || 0) * 2) / 2;

    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(r)) {
            stars.push(<Star key={i} size={14} fill="var(--star)" stroke="var(--star)" />);
        } else if (i === Math.ceil(r) && r % 1 !== 0) {
            stars.push(
                <span key={i} style={{ position: 'relative', display: 'inline-flex' }}>
                    <Star size={14} stroke="var(--border)" fill="none" />
                    <span style={{ position: 'absolute', overflow: 'hidden', width: '50%' }}>
                        <Star size={14} fill="var(--star)" stroke="var(--star)" />
                    </span>
                </span>
            );
        } else {
            stars.push(<Star key={i} size={14} stroke="var(--border)" fill="none" />);
        }
    }

    return (
        <span className="stars">
            {stars}
            {rating && <span className="rating-text">{rating.toFixed(1)}</span>}
            {count != null && <span className="review-count">({count})</span>}
        </span>
    );
}
