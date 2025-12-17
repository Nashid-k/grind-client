import React, { useState, useEffect, useMemo, memo } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * DailyProgressRing - A circular progress indicator showing daily application progress
 * Memoized for performance
 */
function DailyProgressRing({ jobs }) {
    const { user } = useAuth();
    const [dailyTarget, setDailyTarget] = useState(5);

    useEffect(() => {
        if (user?._id) {
            const savedTarget = localStorage.getItem(`dailyTarget_${user._id}`);
            if (savedTarget) {
                setDailyTarget(parseInt(savedTarget));
            }
        }
    }, [user?.username]);

    // Memoize calculations
    const { todayCount, progress, isComplete } = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const count = jobs.filter(job => job.date === today).length;
        return {
            todayCount: count,
            progress: Math.min((count / dailyTarget) * 100, 100),
            isComplete: count >= dailyTarget
        };
    }, [jobs, dailyTarget]);

    // SVG circle calculations
    const size = 56;
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="daily-progress-ring" title={`${todayCount}/${dailyTarget} applications today`}>
            <svg width={size} height={size} className="progress-ring-svg">
                <circle
                    className="progress-ring-bg"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className="progress-ring-progress"
                    stroke={isComplete ? '#10b981' : 'var(--accent-primary)'}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: offset,
                        transform: 'rotate(-90deg)',
                        transformOrigin: '50% 50%',
                        transition: 'stroke-dashoffset 0.5s ease-out, stroke 0.3s ease'
                    }}
                />
            </svg>
            <div className="progress-ring-content">
                <span className="progress-ring-count" style={{ color: isComplete ? '#10b981' : 'var(--text-primary)' }}>
                    {todayCount}
                </span>
                <span className="progress-ring-target">/{dailyTarget}</span>
            </div>
            {isComplete && (
                <div className="progress-ring-complete">
                    <i className="fa-solid fa-check" />
                </div>
            )}
        </div>
    );
}

export default memo(DailyProgressRing);
