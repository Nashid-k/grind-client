import React, { useEffect, useState } from 'react';
import { getTierColor } from '../data/badges';
import './BadgeModal.css';

function BadgeModal({ badge, onClose }) {
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        // Auto-close after 6 seconds
        const timer = setTimeout(() => {
            onClose();
        }, 6000);

        // Hide confetti after 3 seconds
        const confettiTimer = setTimeout(() => {
            setShowConfetti(false);
        }, 3000);

        return () => {
            clearTimeout(timer);
            clearTimeout(confettiTimer);
        };
    }, [onClose]);

    if (!badge) return null;

    return (
        <div className="badge-modal-overlay">
            {/* Confetti Effect */}
            {showConfetti && (
                <div className="confetti-container">
                    {[...Array(60)].map((_, i) => (
                        <div
                            key={i}
                            className="confetti-piece"
                            style={{
                                '--delay': `${Math.random() * 0.5}s`,
                                '--x': `${Math.random() * 100}vw`,
                                '--rotation': `${Math.random() * 360}deg`,
                                '--color': ['#fbbf24', '#3b82f6', '#10b981', '#ef4444', '#a855f7'][Math.floor(Math.random() * 5)]
                            }}
                        />
                    ))}
                </div>
            )}

            <div className="badge-modal-content">
                {/* Glow Background */}
                <div
                    className="badge-modal-glow"
                    style={{ '--badge-color': badge.color }}
                />

                {/* Trophy Badge */}
                <div className="badge-modal-badge-wrapper">
                    <div
                        className={`badge-modal-badge tier-${badge.tier}`}
                        style={{
                            '--badge-color': badge.color,
                            '--tier-gradient': getTierColor(badge.tier)
                        }}
                    >
                        <i className={badge.icon} />
                        <div className="badge-tier-ring"></div>
                    </div>
                    <div className="badge-modal-sparkles">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="sparkle" style={{ '--index': i }} />
                        ))}
                    </div>
                </div>

                {/* Tier Badge */}
                <div className={`modal-tier-badge tier-${badge.tier}`}>
                    {badge.tier.toUpperCase()} TROPHY
                </div>

                {/* Title */}
                <h2 className="badge-modal-title-label">ACHIEVEMENT UNLOCKED</h2>
                <h3 className="badge-modal-badge-name" style={{ color: badge.color }}>
                    {badge.title}
                </h3>

                {/* Description */}
                <p className="badge-modal-description">
                    {badge.description}
                </p>

                {/* XP Reward */}
                <div className="badge-modal-xp">
                    <i className="fa-solid fa-star" />
                    +{badge.xp} XP Earned
                </div>

                {/* Button */}
                <button className="badge-modal-btn" onClick={onClose}>
                    <span>Awesome!</span>
                    <i className="fa-solid fa-arrow-right" />
                </button>
            </div>
        </div>
    );
}

export default BadgeModal;
