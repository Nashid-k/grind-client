import React, { useState, useEffect } from 'react';
import './RejectionRecovery.css';

const ENCOURAGEMENTS = [
    {
        title: "This Is Progress",
        message: "Every rejection is data. It tells you where to focus next.",
        tip: "Update your resume or try a different approach for similar roles.",
        emoji: "📊"
    },
    {
        title: "You're Braver Than Most",
        message: "Most people don't even apply. You took the shot.",
        tip: "Keep shooting. Statistics are on your side.",
        emoji: "🎯"
    },
    {
        title: "Redirection, Not Rejection",
        message: "This door closed because a better one is opening.",
        tip: "Something that fits you better is out there.",
        emoji: "🚪"
    },
    {
        title: "Battle Scars = XP",
        message: "Every rejection makes you stronger and more prepared.",
        tip: "You're learning what companies look for.",
        emoji: "⚔️"
    },
    {
        title: "The Numbers Game",
        message: "Average job seekers face 10-20 rejections before landing. You're right on track.",
        tip: "Keep playing. The math is in your favor.",
        emoji: "🎲"
    },
    {
        title: "They Missed Out",
        message: "Their loss, genuinely. You'll find somewhere that appreciates you.",
        tip: "The right company is looking for exactly you.",
        emoji: "💎"
    },
];

function RejectionRecovery({ onClose, onClaimXP }) {
    const [encouragement, setEncouragement] = useState(null);
    const [claimed, setClaimed] = useState(false);
    const XP_BONUS = 25;

    useEffect(() => {
        const random = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
        setEncouragement(random);
    }, []);

    const handleClaim = () => {
        setClaimed(true);
        if (onClaimXP) {
            onClaimXP(XP_BONUS);
        }
        setTimeout(() => {
            onClose();
        }, 1000);
    };

    if (!encouragement) return null;

    return (
        <div className="rejection-overlay" onClick={onClose}>
            <div className="rejection-card" onClick={(e) => e.stopPropagation()}>
                <div className="rejection-emoji">{encouragement.emoji}</div>

                <div className="rejection-badge">RESILIENCE BOOST</div>

                <h2 className="rejection-title">{encouragement.title}</h2>

                <p className="rejection-message">{encouragement.message}</p>

                <div className="rejection-tip">
                    <i className="fa-solid fa-lightbulb" />
                    <span>{encouragement.tip}</span>
                </div>

                <div className="rejection-reward">
                    <span className="reward-label">Resilience XP Bonus</span>
                    <span className="reward-value">
                        <i className="fa-solid fa-shield-heart" />
                        +{XP_BONUS} XP
                    </span>
                </div>

                <div className="rejection-stats">
                    <div className="stat-item">
                        <i className="fa-solid fa-check-circle" />
                        <span>Rejection logged</span>
                    </div>
                    <div className="stat-item">
                        <i className="fa-solid fa-chart-line" />
                        <span>Data captured</span>
                    </div>
                    <div className="stat-item">
                        <i className="fa-solid fa-arrow-trend-up" />
                        <span>Growth opportunity</span>
                    </div>
                </div>

                <button
                    className={`rejection-claim-btn ${claimed ? 'claimed' : ''}`}
                    onClick={handleClaim}
                    disabled={claimed}
                >
                    {claimed ? (
                        <>
                            <i className="fa-solid fa-heart" /> Stay Strong!
                        </>
                    ) : (
                        <>
                            <i className="fa-solid fa-fist-raised" /> Keep Grinding
                        </>
                    )}
                </button>

                <p className="rejection-footer">
                    "I have not failed. I've just found one more way that won't work."
                </p>
            </div>
        </div>
    );
}

export default RejectionRecovery;
