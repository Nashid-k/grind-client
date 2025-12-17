import React, { useMemo, useState } from 'react';
import { useJobs } from '../context/JobContext'; // Assuming context might be useful later, but props work fine
import './ActivityHeatmap.css';

function ActivityHeatmap({ jobs = [], dailyTarget = 5 }) {
    const [monthOffset, setMonthOffset] = useState(0);

    // Month Logic
    const displayDate = useMemo(() => {
        const d = new Date();
        d.setMonth(d.getMonth() + monthOffset);
        return d;
    }, [monthOffset]);

    const monthName = displayDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Job Frequency Map
    const dateCountMap = useMemo(() => {
        const map = {};
        jobs.forEach(job => {
            // Prefer user-set date, fallback to createdAt
            let dateStr = job.date;
            if (!dateStr && job.createdAt) {
                dateStr = new Date(job.createdAt).toISOString().split('T')[0];
            }
            if (dateStr) {
                map[dateStr] = (map[dateStr] || 0) + 1;
            }
        });
        return map;
    }, [jobs]);

    // Calendar Generation
    const calendarData = useMemo(() => {
        const year = displayDate.getFullYear();
        const month = displayDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const startDayOfWeek = firstDay.getDay();
        const lastDay = new Date(year, month + 1, 0);
        const totalDays = lastDay.getDate();

        const days = [];
        // Empty slots
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push({ empty: true });
        }

        // Days
        for (let day = 1; day <= totalDays; day++) {
            const date = new Date(Date.UTC(year, month, day));
            const dateStr = date.toISOString().split('T')[0];
            const count = dateCountMap[dateStr] || 0;

            const todayStr = new Date().toISOString().split('T')[0];
            const isFuture = dateStr > todayStr;
            const isToday = dateStr === todayStr;

            days.push({
                day,
                date: dateStr,
                count: isFuture ? -1 : count,
                isFuture,
                isToday
            });
        }
        return days;
    }, [displayDate, dateCountMap]);

    // Calculate Streak (Optimized)
    const currentStreak = useMemo(() => {
        const dates = Object.keys(dateCountMap).sort((a, b) => new Date(b) - new Date(a));
        if (dates.length === 0) return 0;

        const todayStr = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Must start today or yesterday
        if (dates[0] !== todayStr && dates[0] !== yesterdayStr) return 0;

        let streak = 0;
        let currentDate = new Date(dates[0]);

        for (let i = 0; i < dates.length; i++) {
            const jobDate = new Date(dates[i]);
            if (i === 0) {
                streak = 1;
            } else {
                const prevDate = new Date(dates[i - 1]);
                const gap = (prevDate - jobDate) / (1000 * 60 * 60 * 24);
                if (gap <= 1) streak++;
                else break;
            }
        }
        return streak;
    }, [dateCountMap]);

    // Intensity Level
    const getIntensityClass = (count) => {
        if (count === -1) return 'future'; // Future days
        if (count === 0) return 'level-0';

        const percentage = (count / dailyTarget) * 100;
        if (percentage >= 100) return 'level-4';
        if (percentage >= 75) return 'level-3';
        if (percentage >= 50) return 'level-2';
        return 'level-1';
    };

    // Stats
    const stats = useMemo(() => {
        let totalApps = 0;
        let daysActive = 0;
        calendarData.forEach(day => {
            if (!day.empty && day.count > 0) {
                totalApps += day.count;
                daysActive++;
            }
        });
        return { totalApps, daysActive };
    }, [calendarData]);

    return (
        <div className="activity-heatmap glass-panel">
            <div className="heatmap-header">
                <div className="hm-title">
                    <i className="fa-solid fa-calendar-days"></i>
                    <h3>Activity Log</h3>
                </div>
                {currentStreak > 0 && (
                    <div className="streak-tag">
                        <i className="fa-solid fa-fire"></i> {currentStreak} Day Streak
                    </div>
                )}
            </div>

            <div className="heatmap-nav">
                <button onClick={() => setMonthOffset(monthOffset - 1)} disabled={monthOffset < -11}>
                    <i className="fa-solid fa-chevron-left"></i>
                </button>
                <span className="current-month">{monthName}</span>
                <button onClick={() => setMonthOffset(monthOffset + 1)} disabled={monthOffset >= 0}>
                    <i className="fa-solid fa-chevron-right"></i>
                </button>
            </div>

            <div className="heatmap-grid">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={i} className="day-label">{d}</div>
                ))}
                {calendarData.map((day, idx) => (
                    day.empty ? <div key={`empty-${idx}`} className="day-cell empty"></div> :
                        <div
                            key={day.date}
                            className={`day-cell ${getIntensityClass(day.count)} ${day.isToday ? 'today' : ''}`}
                            title={`${day.date}: ${day.count > -1 ? day.count : 0} applications`}
                        >
                            {day.day}
                        </div>
                ))}
            </div>

            <div className="heatmap-footer">
                <div className="stat">
                    <strong>{stats.totalApps}</strong> Apps
                </div>
                <div className="legend">
                    <span>Less</span>
                    <div className="legend-box level-1"></div>
                    <div className="legend-box level-2"></div>
                    <div className="legend-box level-3"></div>
                    <div className="legend-box level-4"></div>
                    <span>More</span>
                </div>
            </div>
        </div>
    );
}

export default ActivityHeatmap;
