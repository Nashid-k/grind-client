import React, { memo, useMemo, useCallback, useState } from 'react';
import './JobCard.css';

/**
 * JobCard - Compact, information-dense job application card
 * Memoized for performance
 */
function JobCard({ job, onEdit, onDelete }) {
    const [showNotes, setShowNotes] = useState(false);

    // Memoize relative date
    const timeAgo = useMemo(() => {
        const now = new Date();
        const date = new Date(job.date);
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return '1d ago';
        if (diffDays < 7) return `${diffDays}d ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
        return `${Math.floor(diffDays / 30)}mo ago`;
    }, [job.date]);

    // Status config mapping
    const statusConfig = useMemo(() => ({
        applied: { label: 'Applied', icon: 'fa-paper-plane' },
        shortlisted: { label: 'Shortlisted', icon: 'fa-star' },
        interview_scheduled: { label: 'Interview Scheduled', icon: 'fa-calendar-check' },
        interview_completed: { label: 'Interview Completed', icon: 'fa-check-double' },
        offer_received: { label: 'Offer Received', icon: 'fa-trophy' },
        rejected: { label: 'Rejected', icon: 'fa-times-circle' },
        on_hold: { label: 'On Hold', icon: 'fa-pause-circle' }
    }), []);

    const status = statusConfig[job.status] || statusConfig.applied;

    const handleEdit = useCallback((e) => {
        e.stopPropagation();
        onEdit();
    }, [onEdit]);

    const handleDelete = useCallback((e) => {
        e.stopPropagation();
        onDelete();
    }, [onDelete]);

    const toggleNotes = useCallback(() => {
        if (job.notes) setShowNotes(prev => !prev);
    }, [job.notes]);

    return (
        <div className={`job-card status-${job.status} ${showNotes ? 'expanded' : ''}`} onClick={toggleNotes}>
            <div className="card-content">
                {/* Left: Title & Company */}
                <div className="card-info">
                    <h4 className="role-title">{job.role}</h4>
                    <div className="company-row">
                        <i className="fa-solid fa-building"></i>
                        <span className="company-name">{job.company}</span>
                        <span className="bullet">•</span>
                        <span className="job-portal">{job.portal || 'Direct'}</span>
                    </div>
                </div>

                {/* Right: Meta & Actions */}
                <div className="card-sidebar">
                    <div className={`status-badge ${job.status}`}>
                        <i className={`fa-solid ${status.icon}`}></i>
                        <span>{status.label}</span>
                    </div>
                    <span className="time-ago">{timeAgo}</span>
                </div>
            </div>

            {/* Actions Bar (visible on hover) */}
            <div className="card-actions-bar">
                {job.link && (
                    <a href={job.link} target="_blank" rel="noreferrer" className="action-icon link" onClick={e => e.stopPropagation()} title="Open Link">
                        <i className="fa-solid fa-external-link-alt"></i>
                    </a>
                )}
                <button className="action-icon edit" onClick={handleEdit} title="Edit">
                    <i className="fa-solid fa-pen"></i>
                </button>
                <button className="action-icon delete" onClick={handleDelete} title="Delete">
                    <i className="fa-solid fa-trash"></i>
                </button>
                {job.notes && (
                    <button className={`action-icon notes ${showNotes ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleNotes(); }} title="Notes">
                        <i className="fa-solid fa-note-sticky"></i>
                    </button>
                )}
            </div>

            {/* Expanded Notes Section */}
            {showNotes && job.notes && (
                <div className="card-notes-panel">
                    <div className="notes-header">
                        <i className="fa-solid fa-comment-dots"></i>
                        <span>Notes</span>
                    </div>
                    <p>{job.notes}</p>
                </div>
            )}
        </div>
    );
}

export default memo(JobCard, (prev, next) => {
    return (
        prev.job._id === next.job._id &&
        prev.job.status === next.job.status &&
        prev.job.company === next.job.company &&
        prev.job.role === next.job.role &&
        prev.job.date === next.job.date &&
        prev.job.notes === next.job.notes
    );
});
