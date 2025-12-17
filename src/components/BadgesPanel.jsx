import React, { useState, useMemo, memo } from 'react';
import { useJobs } from '../context/JobContext';
import { BADGES, getTierColor } from '../data/badges';
import './TrophyCard.css';

// Memoized trophy card to prevent unnecessary rerenders
const TrophyCard = memo(function TrophyCard({ badge, isUnlocked, index }) {
    return (
        <div
            className={`trophy-card ${isUnlocked ? 'unlocked' : 'locked'} tier-${badge.tier}`}
            style={{
                '--badge-color': badge.color,
                '--tier-gradient': getTierColor(badge.tier),
                animationDelay: `${index * 60}ms`
            }}
            title={isUnlocked ? badge.description : 'Complete challenges to unlock'}
        >
            <div className="trophy-card-icon">
                {isUnlocked ? (
                    <>
                        <i className={badge.icon} />
                        <div className="trophy-shine"></div>
                    </>
                ) : (
                    <i className="fa-solid fa-lock" />
                )}
            </div>
            <span className="trophy-card-title">{badge.title}</span>
            {isUnlocked && (
                <div className="trophy-card-footer">
                    <span className="trophy-tier-badge">{badge.tier}</span>
                    <span className="trophy-card-xp">+{badge.xp} XP</span>
                </div>
            )}
        </div>
    );
});

function BadgesPanel() {
    const { unlockedBadges } = useJobs();
    const [isExpanded, setIsExpanded] = useState(false);

    // Memoize the Set for performance
    const unlockedSet = useMemo(() => new Set(unlockedBadges), [unlockedBadges]);
    const progress = useMemo(() => (unlockedSet.size / BADGES.length) * 100, [unlockedSet.size]);

    // Calculate total XP earned
    const totalXP = useMemo(() => {
        return BADGES.filter(badge => unlockedSet.has(badge.id))
            .reduce((sum, badge) => sum + badge.xp, 0);
    }, [unlockedSet]);

    return (
        <div className="trophy-panel">
            {/* Header */}
            <div
                className="trophy-panel-header"
                onClick={() => setIsExpanded(prev => !prev)}
            >
                <div className="trophy-header-left">
                    <div className="trophy-icon-wrapper">
                        <i className="fa-solid fa-trophy" />
                    </div>
                    <div className="trophy-header-info">
                        <h3 className="trophy-title">Trophy Case</h3>
                        <div className="trophy-progress-bar">
                            <div
                                className="trophy-progress-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        {totalXP > 0 && (
                            <span className="trophy-total-xp">{totalXP} XP earned</span>
                        )}
                    </div>
                    <span className="trophy-count">
                        {unlockedSet.size}/{BADGES.length}
                    </span>
                </div>
                <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'} trophy-chevron`} />
            </div>

            {/* Expanded Grid */}
            {isExpanded && (
                <div className="trophy-grid">
                    {BADGES.map((badge, index) => (
                        <TrophyCard
                            key={badge.id}
                            badge={badge}
                            isUnlocked={unlockedSet.has(badge.id)}
                            index={index}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default memo(BadgesPanel);
