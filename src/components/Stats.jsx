import React from 'react';

function Stats({ jobs }) {
    const stats = {
        total: jobs.length,
        applied: jobs.length, // Show total applied regardless of current status
        shortlisted: jobs.filter(j => j.status === 'shortlisted').length,
        interviewed: jobs.filter(j => j.status === 'interviewed').length,
        offer: jobs.filter(j => j.status === 'offer').length,
    };

    return (
        <div className="stats-grid animate-fade-up">
            <div className="stat-glass-card">
                <span className="stat-label"><i className="fa-solid fa-briefcase mr-2 text-blue-400"></i> Total</span>
                <span className="stat-value">{stats.total}</span>
            </div>
            <div className="stat-glass-card" style={{ borderTopColor: 'var(--status-applied)' }}>
                <span className="stat-label">Applied</span>
                <span className="stat-value">{stats.applied}</span>
            </div>
            <div className="stat-glass-card" style={{ borderTopColor: 'var(--status-shortlisted)' }}>
                <span className="stat-label">Shortlisted</span>
                <span className="stat-value">{stats.shortlisted}</span>
            </div>
            <div className="stat-glass-card" style={{ borderTopColor: 'var(--status-interviewed)' }}>
                <span className="stat-label">Interviewed</span>
                <span className="stat-value">{stats.interviewed}</span>
            </div>
            <div className="stat-glass-card" style={{ borderTopColor: 'var(--status-offer)' }}>
                <span className="stat-label">Offers</span>
                <span className="stat-value">{stats.offer}</span>
            </div>
        </div>
    );
}

export default Stats;
