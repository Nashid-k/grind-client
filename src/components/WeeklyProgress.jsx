import React, { useMemo, memo } from 'react';
import './WeeklyProgress.css';

/**
 * WeeklyProgress - Shows 7-day application activity chart
 * Memoized for performance
 */
function WeeklyProgress({ jobs }) {
    const weekData = useMemo(() => {
        const days = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayName = dayNames[date.getDay()];
            const count = jobs.filter(job => job.date === dateStr).length;

            days.push({
                date: dateStr,
                dayName,
                count,
                isToday: i === 0
            });
        }

        const total = days.reduce((sum, d) => sum + d.count, 0);
        const max = Math.max(...days.map(d => d.count), 1);

        const prevWeekTotal = jobs.filter(job => {
            const jobDate = new Date(job.date);
            const today = new Date();
            const weekAgo = new Date();
            weekAgo.setDate(today.getDate() - 7);
            const twoWeeksAgo = new Date();
            twoWeeksAgo.setDate(today.getDate() - 14);
            return jobDate >= twoWeeksAgo && jobDate < weekAgo;
        }).length;

        const percentChange = prevWeekTotal > 0
            ? Math.round(((total - prevWeekTotal) / prevWeekTotal) * 100)
            : total > 0 ? 100 : 0;

        return { days, total, max, percentChange };
    }, [jobs]);

    return (
        <div className="weekly-progress">
            <div className="weekly-header">
                <div className="weekly-title">
                    <i className="fa-solid fa-chart-simple" />
                    <span>This Week</span>
                </div>
                <div className="weekly-stats">
                    <span className="weekly-total">{weekData.total} apps</span>
                    {weekData.percentChange !== 0 && (
                        <span className={`weekly-change ${weekData.percentChange > 0 ? 'positive' : 'negative'}`}>
                            <i className={`fa-solid fa-arrow-${weekData.percentChange > 0 ? 'up' : 'down'}`} />
                            {Math.abs(weekData.percentChange)}%
                        </span>
                    )}
                </div>
            </div>

            <div className="weekly-chart">
                {weekData.days.map((day) => (
                    <div key={day.date} className="weekly-bar-wrapper">
                        <div
                            className={`weekly-bar ${day.isToday ? 'today' : ''} ${day.count > 0 ? 'has-data' : ''}`}
                            style={{ '--bar-height': `${(day.count / weekData.max) * 100}%` }}
                        >
                            {day.count > 0 && (
                                <span className="weekly-bar-count">{day.count}</span>
                            )}
                        </div>
                        <span className={`weekly-day-label ${day.isToday ? 'today' : ''}`}>
                            {day.dayName}
                        </span>
                    </div>
                ))}
            </div>

            {weekData.total === 0 && (
                <p className="weekly-empty">No applications this week. Start grinding!</p>
            )}
        </div>
    );
}

export default memo(WeeklyProgress);
