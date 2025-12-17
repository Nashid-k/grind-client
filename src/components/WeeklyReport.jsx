import React, { useMemo } from 'react';
import './WeeklyReport.css';

function WeeklyReport({ jobs, onClose }) {
    const report = useMemo(() => {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const twoWeeksAgo = new Date(today);
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        // This week's jobs
        const thisWeekJobs = jobs.filter(job => {
            const date = new Date(job.date || job.createdAt);
            return date >= weekAgo && date <= today;
        });

        // Last week's jobs
        const lastWeekJobs = jobs.filter(job => {
            const date = new Date(job.date || job.createdAt);
            return date >= twoWeeksAgo && date < weekAgo;
        });

        // Status breakdown
        const statusCounts = {
            applied: thisWeekJobs.length, // Show total applied for the week
            shortlisted: thisWeekJobs.filter(j => j.status === 'shortlisted').length,
            interviewed: thisWeekJobs.filter(j => j.status === 'interviewed').length,
            offer: thisWeekJobs.filter(j => j.status === 'offer').length,
            rejected: thisWeekJobs.filter(j => j.status === 'rejected').length,
        };

        // Best day
        const dayMap = {};
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        thisWeekJobs.forEach(job => {
            const date = new Date(job.date || job.createdAt);
            const day = dayNames[date.getDay()];
            dayMap[day] = (dayMap[day] || 0) + 1;
        });
        const bestDay = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0];

        // Change from last week
        const change = thisWeekJobs.length - lastWeekJobs.length;
        const changePercent = lastWeekJobs.length > 0
            ? Math.round((change / lastWeekJobs.length) * 100)
            : thisWeekJobs.length > 0 ? 100 : 0;

        // Momentum message
        let momentum = '';
        if (change > 5) momentum = "You're on fire! Keep this momentum going! 🔥";
        else if (change > 0) momentum = "Solid improvement from last week. Keep pushing! 💪";
        else if (change === 0) momentum = "Consistent effort. Time to level up? ⚡";
        else momentum = "Let's pick up the pace this week! You've got this! 🚀";

        return {
            total: thisWeekJobs.length,
            lastWeek: lastWeekJobs.length,
            change,
            changePercent,
            statusCounts,
            bestDay: bestDay ? { day: bestDay[0], count: bestDay[1] } : null,
            momentum,
            responseRate: thisWeekJobs.length > 0
                ? Math.round(((statusCounts.shortlisted + statusCounts.interviewed + statusCounts.offer) / thisWeekJobs.length) * 100)
                : 0
        };
    }, [jobs]);

    return (
        <div className="weekly-overlay" onClick={onClose}>
            <div className="weekly-card" onClick={(e) => e.stopPropagation()}>
                <button className="weekly-close" onClick={onClose}>
                    <i className="fa-solid fa-xmark" />
                </button>

                <div className="weekly-header">
                    <div className="weekly-icon">
                        <i className="fa-solid fa-chart-line" />
                    </div>
                    <h2>Weekly Report</h2>
                    <p className="weekly-date">
                        {new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {' - '}
                        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                </div>

                <div className="weekly-main-stat">
                    <span className="weekly-number">{report.total}</span>
                    <span className="weekly-label">Applications This Week</span>
                    <div className={`weekly-change ${report.change >= 0 ? 'positive' : 'negative'}`}>
                        <i className={`fa-solid fa-arrow-${report.change >= 0 ? 'up' : 'down'}`} />
                        {Math.abs(report.changePercent)}% from last week
                    </div>
                </div>

                <div className="weekly-grid">
                    <div className="weekly-stat-card">
                        <i className="fa-solid fa-paper-plane" style={{ color: '#3b82f6' }} />
                        <span className="stat-value">{report.statusCounts.applied}</span>
                        <span className="stat-label">Applied</span>
                    </div>
                    <div className="weekly-stat-card">
                        <i className="fa-solid fa-star" style={{ color: '#fbbf24' }} />
                        <span className="stat-value">{report.statusCounts.shortlisted}</span>
                        <span className="stat-label">Shortlisted</span>
                    </div>
                    <div className="weekly-stat-card">
                        <i className="fa-solid fa-comments" style={{ color: '#8b5cf6' }} />
                        <span className="stat-value">{report.statusCounts.interviewed}</span>
                        <span className="stat-label">Interviewed</span>
                    </div>
                    <div className="weekly-stat-card">
                        <i className="fa-solid fa-trophy" style={{ color: '#22c55e' }} />
                        <span className="stat-value">{report.statusCounts.offer}</span>
                        <span className="stat-label">Offers</span>
                    </div>
                </div>

                <div className="weekly-insights">
                    {report.bestDay && (
                        <div className="insight-card">
                            <i className="fa-solid fa-calendar-star" />
                            <div>
                                <strong>Best Day:</strong> {report.bestDay.day}
                                <span className="insight-detail">{report.bestDay.count} applications</span>
                            </div>
                        </div>
                    )}
                    <div className="insight-card">
                        <i className="fa-solid fa-percentage" />
                        <div>
                            <strong>Response Rate:</strong> {report.responseRate}%
                            <span className="insight-detail">Based on this week's data</span>
                        </div>
                    </div>
                </div>

                <div className="weekly-momentum">
                    <p>{report.momentum}</p>
                </div>

                <button className="weekly-cta" onClick={onClose}>
                    <i className="fa-solid fa-rocket" /> Let's Grind
                </button>
            </div>
        </div>
    );
}

export default WeeklyReport;
