import React, { useState, useEffect } from 'react';
import './ComebackBonus.css';

const COMEBACK_MESSAGES = [
    {
        title: "The Prodigal Grinder Returns!",
        message: "You took a break, but you're back. That's what matters.",
        bonus: 50,
        emoji: "🔥"
    },
    {
        title: "Welcome Back, Champion!",
        message: "Life happens. But champions always return to the grind.",
        bonus: 50,
        emoji: "👑"
    },
    {
        title: "The Comeback Kid!",
        message: "Some of the greatest stories are comeback stories. This is yours.",
        bonus: 50,
        emoji: "🚀"
    },
    {
        title: "Back in the Arena!",
        message: "You stepped away, but you didn't quit. Time to dominate.",
        bonus: 50,
        emoji: "⚡"
    },
];

function ComebackBonus({ daysAway = 1, onClose, onClaimXP }) {
    const [message, setMessage] = useState(null);
    const [claimed, setClaimed] = useState(false);

    useEffect(() => {
        const random = COMEBACK_MESSAGES[Math.floor(Math.random() * COMEBACK_MESSAGES.length)];
        // Scale bonus based on days away (max 3 days = max bonus)
        const scaledBonus = Math.min(daysAway, 3) * random.bonus;
        setMessage({ ...random, bonus: scaledBonus });
    }, [daysAway]);

    const handleClaim = () => {
        setClaimed(true);
        if (onClaimXP && message) {
            onClaimXP(message.bonus);
        }
        setTimeout(() => {
            onClose();
        }, 1000);
    };

    if (!message) return null;

    return (
        <div className="comeback-overlay" onClick={onClose}>
            <div className="comeback-card" onClick={(e) => e.stopPropagation()}>
                <div className="comeback-glow" />

                <div className="comeback-emoji">{message.emoji}</div>

                <div className="comeback-badge">COMEBACK BONUS</div>

                <h2 className="comeback-title">{message.title}</h2>

                <p className="comeback-message">{message.message}</p>

                <div className="comeback-days">
                    <span className="days-number">{daysAway}</span>
                    <span className="days-label">days since last visit</span>
                </div>

                <div className="comeback-reward">
                    <div className="reward-icon">
                        <i className="fa-solid fa-gift" />
                    </div>
                    <div className="reward-info">
                        <span className="reward-label">Welcome Back XP</span>
                        <span className="reward-value">+{message.bonus} XP</span>
                    </div>
                </div>

                <button
                    className={`comeback-claim-btn ${claimed ? 'claimed' : ''}`}
                    onClick={handleClaim}
                    disabled={claimed}
                >
                    {claimed ? (
                        <>
                            <i className="fa-solid fa-check" /> Claimed!
                        </>
                    ) : (
                        <>
                            <i className="fa-solid fa-gift" /> Claim Bonus
                        </>
                    )}
                </button>

                <p className="comeback-footer">
                    Let's start a new streak today!
                </p>
            </div>
        </div>
    );
}

// Helper to check if user is returning after days away
export const checkComeback = (lastActiveDate) => {
    if (!lastActiveDate) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActive = new Date(lastActiveDate);
    lastActive.setHours(0, 0, 0, 0);

    const diffTime = today - lastActive;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Return days away if >= 2 days (1 day = normal, 2+ = comeback)
    return diffDays >= 2 ? diffDays : 0;
};

export default ComebackBonus;
