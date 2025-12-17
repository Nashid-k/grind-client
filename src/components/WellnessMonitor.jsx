import React, { useMemo } from 'react';
import './WellnessMonitor.css';

function WellnessMonitor({ jobs }) {
    const metrics = useMemo(() => {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        let last7DaysCount = 0;
        let recentRejections = 0;
        let totalRecent = 0;

        jobs.forEach(job => {
            const jobDate = new Date(job.date);
            if (jobDate >= oneWeekAgo) {
                last7DaysCount++;
                totalRecent++;
                if (job.status === 'rejected') recentRejections++;
            }
        });

        // Burnout Risk Logic
        let status = 'balanced'; // balanced, high, burnout
        let message = "You're keeping a healthy pace.";
        let color = 'green';

        if (last7DaysCount > 35) {
            status = 'burnout';
            message = "Whoa! High intensity detected. Risk of burnout.";
            color = 'red';
        } else if (last7DaysCount > 20) {
            status = 'high';
            message = "You're pushing hard. Remember to rest.";
            color = 'orange';
        }

        // Rejection Fatigue (70% threshold is more realistic)
        if (totalRecent > 0 && (recentRejections / totalRecent) > 0.7) {
            status = status === 'burnout' ? 'critical' : 'fatigue';
            message = "Rejections are tough. Don't lose hope, maybe review your resume?";
            color = 'red';
        }

        return { last7DaysCount, status, message, color };
    }, [jobs]);

    return (
        <div className={`wellness-card wellness-${metrics.status}`}>
            <div className="wellness-header">
                <h3><i className="fa-solid fa-heart-pulse" /> Wellness Monitor</h3>
                <span className={`wellness-badge ${metrics.color}`}>{metrics.status.toUpperCase()}</span>
            </div>

            <div className="wellness-stats">
                <div className="w-stat">
                    <span className="w-num">{metrics.last7DaysCount}</span>
                    <span className="w-label">Apps / 7 Days</span>
                </div>
                <div className="w-meter">
                    <div className="w-fill" style={{ width: `${Math.min(metrics.last7DaysCount * 5, 100)}%`, background: `var(--${metrics.color}, #10b981)` }}></div>
                </div>
            </div>

            <p className="wellness-msg">
                <i className="fa-solid fa-user-doctor" /> {metrics.message}
            </p>
        </div>
    );
}

export default WellnessMonitor;
