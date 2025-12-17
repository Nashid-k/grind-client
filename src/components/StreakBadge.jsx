import React, { useState, useEffect, useMemo, memo } from 'react';
import { useAuth } from '../context/AuthContext';
import './StreakBadge.css';

/**
 * StreakBadge - Displays current streak in topbar
 * Memoized for performance
 */
function StreakBadge() {
    const { user } = useAuth();
    const [streakData, setStreakData] = useState({ count: 0, isActive: false });

    useEffect(() => {
        if (!user?._id) return;

        const STREAK_KEY = `streak_${user._id}`;
        const savedData = JSON.parse(localStorage.getItem(STREAK_KEY)) || { count: 0, lastDate: null };

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (savedData.lastDate === today || savedData.lastDate === yesterdayStr) {
            setStreakData({
                count: savedData.count,
                isActive: savedData.lastDate === today
            });
        } else {
            setStreakData({ count: 0, isActive: false });
        }
    }, [user?.username]);

    if (streakData.count === 0) return null;

    return (
        <div className={`streak-badge ${streakData.isActive ? 'active' : 'pending'}`}>
            <i className="fa-solid fa-fire" />
            <span className="streak-count">{streakData.count}</span>
            {!streakData.isActive && (
                <span className="streak-label">day streak</span>
            )}
        </div>
    );
}

export default memo(StreakBadge);
