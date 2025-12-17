import React, { useEffect, useState } from 'react';
import './MilestoneCelebration.css';

// Milestone definitions
const MILESTONES = [
    { count: 10, title: 'First Steps', message: 'You\'ve submitted 10 applications! The journey begins.', emoji: '🚀', xpBonus: 50 },
    { count: 25, title: 'Getting Momentum', message: '25 applications! You\'re building serious momentum.', emoji: '⚡', xpBonus: 100 },
    { count: 50, title: 'Half Century', message: '50 applications! You\'re in the top 10% of job seekers.', emoji: '🔥', xpBonus: 200 },
    { count: 100, title: 'Century Club', message: '100 applications! Unstoppable grind mentality.', emoji: '💯', xpBonus: 500 },
    { count: 250, title: 'Elite Grinder', message: '250 applications! You\'re a legend in the making.', emoji: '👑', xpBonus: 1000 },
    { count: 500, title: 'Grind Master', message: '500 applications! Nothing can stop you now.', emoji: '🏆', xpBonus: 2500 },
];

// Confetti particle component
const Confetti = ({ color, left, delay }) => (
    <div
        className="confetti-particle"
        style={{
            backgroundColor: color,
            left: `${left}%`,
            animationDelay: `${delay}s`
        }}
    />
);

function MilestoneCelebration({ milestone, onClose, onClaimXP }) {
    const [confettiPieces, setConfettiPieces] = useState([]);
    const [claimed, setClaimed] = useState(false);

    useEffect(() => {
        // Generate confetti
        const colors = ['#fbbf24', '#3b82f6', '#22c55e', '#ef4444', '#8b5cf6', '#f97316'];
        const pieces = [];
        for (let i = 0; i < 100; i++) {
            pieces.push({
                id: i,
                color: colors[Math.floor(Math.random() * colors.length)],
                left: Math.random() * 100,
                delay: Math.random() * 0.5
            });
        }
        setConfettiPieces(pieces);
    }, []);

    const handleClaim = () => {
        setClaimed(true);
        if (onClaimXP) {
            onClaimXP(milestone.xpBonus);
        }
        setTimeout(() => {
            onClose();
        }, 500);
    };

    if (!milestone) return null;

    return (
        <div className="milestone-overlay">
            <div className="confetti-container">
                {confettiPieces.map(piece => (
                    <Confetti key={piece.id} {...piece} />
                ))}
            </div>

            <div className="milestone-card">
                <div className="milestone-emoji">{milestone.emoji}</div>
                <div className="milestone-badge">MILESTONE UNLOCKED</div>
                <h2 className="milestone-title">{milestone.title}</h2>
                <p className="milestone-count">{milestone.count} Applications</p>
                <p className="milestone-message">{milestone.message}</p>

                <div className="milestone-reward">
                    <i className="fa-solid fa-star" />
                    <span>+{milestone.xpBonus} XP</span>
                </div>

                <button
                    className={`milestone-claim-btn ${claimed ? 'claimed' : ''}`}
                    onClick={handleClaim}
                    disabled={claimed}
                >
                    {claimed ? (
                        <>
                            <i className="fa-solid fa-check" /> Claimed!
                        </>
                    ) : (
                        <>
                            <i className="fa-solid fa-gift" /> Claim Reward
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

// Helper function to check if a milestone was reached
export const checkMilestone = (previousCount, newCount) => {
    for (const milestone of MILESTONES) {
        if (previousCount < milestone.count && newCount >= milestone.count) {
            return milestone;
        }
    }
    return null;
};

export { MILESTONES };
export default MilestoneCelebration;
