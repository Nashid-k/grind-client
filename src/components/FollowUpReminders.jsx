import React, { useState, useEffect, useMemo, memo } from 'react';
import './FollowUpReminders.css';

// Calculate days/hours until or since a date
const getTimeStatus = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours, isFuture: diff > 0 };
};

// Get follow-up status
const getFollowUpStatus = (job) => {
    // 1. Check for Scheduled Interviews (Timer only)
    if (job.status === 'interview_scheduled' && job.interviewDate) {
        const time = getTimeStatus(job.interviewDate);
        if (time.isFuture) {
            const urgent = time.days === 0;
            return {
                status: 'scheduled',
                priority: urgent ? 5 : 4,
                message: urgent ? `Interview in ${time.hours} hrs!` : `Interview in ${time.days} days`,
                action: 'Prepare now',
                isTimer: true,
                targetDate: job.interviewDate
            };
        }
    }

    // 2. Post-Interview Follow-up
    if (job.status === 'interview_completed') {
        const days = Math.floor((new Date() - new Date(job.date)) / (1000 * 60 * 60 * 24));
        if (days >= 3) {
            return {
                status: 'happened',
                priority: 3,
                message: '3 days since interview',
                action: 'Send Thank You Note',
                template: 'thankYou'
            };
        }
    }

    // 2. Standard Follow-ups for 'applied' status
    if (job.status === 'applied') {
        const days = Math.floor((new Date() - new Date(job.date)) / (1000 * 60 * 60 * 24));

        if (days >= 14) {
            return {
                status: 'urgent',
                priority: 2,
                message: `${days} days ago - Final follow-up`,
                action: 'Send final check-in',
                template: 'final'
            };
        }
        if (days >= 7) {
            return {
                status: 'overdue',
                priority: 1,
                message: `${days} days ago - No response`,
                action: 'Send polite check-in',
                template: 'second'
            };
        }
    }

    // 3. Keep Warm for 'on_hold' status
    if (job.status === 'on_hold') {
        const days = Math.floor((new Date() - new Date(job.date)) / (1000 * 60 * 60 * 24));
        if (days >= 14) {
            return {
                status: 'overdue',
                priority: 2,
                message: `${days} days on hold`,
                action: 'Check for updates',
                template: 'second'
            };
        }
    }

    return { status: 'none', priority: 0 };
};

// Email templates
const emailTemplates = {
    initial: {
        subject: "Following Up - [Role] Application",
        body: `Hi [Hiring Manager],\n\nI hope this email finds you well. I wanted to follow up on my application for the [Role] position at [Company] submitted on [Date].\n\nI'm very excited about the opportunity to contribute to your team and would welcome the chance to discuss how my experience aligns with your needs.\n\nPlease let me know if you need any additional information from my end.\n\nThank you for your time and consideration.\n\nBest regards,\n[Your Name]`
    },
    second: {
        subject: "Re: [Role] Application Follow-Up",
        body: `Hi [Hiring Manager],\n\nI wanted to circle back regarding my application for the [Role] position. I remain very interested in this opportunity and believe my skills in [Key Skills] would be valuable to your team.\n\nI understand you may be busy, but I'd appreciate any update on the status of my application when you have a moment.\n\nThank you again for considering my application.\n\nBest regards,\n[Your Name]`
    },
    final: {
        subject: "Final Follow-Up - [Role] Position",
        body: `Hi [Hiring Manager],\n\nI hope you're doing well. I'm reaching out one last time regarding the [Role] position at [Company].\n\nI remain enthusiastic about the opportunity, but I understand if you've moved forward with other candidates. If there's any feedback you could share, I would greatly appreciate it.\n\nThank you for your time and consideration throughout this process.\n\nBest regards,\n[Your Name]`
    },
    thankYou: {
        subject: "Thank You - [Role] Interview",
        body: `Hi [Hiring Manager],\n\nThank you so much for taking the time to speak with me today regarding the [Role] position at [Company].\n\nI really enjoyed learning more about the team and [Mention Specific Topic]. I am even more enthusiastic about the possibility of joining your team and helping with [Company Goal].\n\nPlease let me know if there are any other questions I can answer.\n\nBest regards,\n[Your Name]`
    }
};

// Timer Component
const CountdownTimer = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const update = () => {
            const diff = new Date(targetDate) - new Date();
            if (diff <= 0) return setTimeLeft('Now!');

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(`${hours}h ${mins}m ${secs}s`);
        };
        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    return <span className="timer-badge">{timeLeft}</span>;
};

// Memoized reminder card
const ReminderCard = memo(({ job, followUp, onFollowUp, onDismiss }) => (
    <div className={`reminder-card reminder-${followUp.status}`}>
        <div className="reminder-priority">
            {followUp.status === 'scheduled' && <i className="fa-solid fa-calendar-alt" />}
            {followUp.status === 'happened' && <i className="fa-solid fa-check-double" />}
            {followUp.status === 'urgent' && <i className="fa-solid fa-fire" />}
            {followUp.status === 'overdue' && <i className="fa-solid fa-clock" />}
        </div>
        <div className="reminder-content">
            <div className="reminder-company">
                <strong>{job.company}</strong>
                <span className="reminder-role">{job.role}</span>
            </div>

            <div className="reminder-message">
                {followUp.message}
                {followUp.isTimer && <CountdownTimer targetDate={followUp.targetDate} />}
            </div>

            {followUp.action && (
                <div className="reminder-action-hint">
                    <i className="fa-solid fa-lightbulb" /> {followUp.action}
                </div>
            )}
        </div>
        <div className="reminder-actions">
            <button
                className={`reminder-btn ${followUp.status === 'scheduled' ? 'reminder-btn-prep' : 'reminder-btn-primary'}`}
                onClick={() => onFollowUp(job, followUp)}
            >
                {followUp.status === 'scheduled' ? (
                    <><i className="fa-solid fa-book-open" /> Prep</>
                ) : (
                    <><i className="fa-solid fa-paper-plane" /> {followUp.status === 'happened' ? 'Thank You' : 'Email'}</>
                )}
            </button>
            <button
                className="reminder-btn reminder-btn-ghost"
                onClick={() => onDismiss(job._id)}
                title="Dismiss"
            >
                <i className="fa-solid fa-xmark" />
            </button>
        </div>
    </div>
));

// Email template modal
const EmailTemplateModal = ({ isOpen, onClose, job, templateType }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen || !job) return null;

    const template = emailTemplates[templateType] || emailTemplates.initial;

    const formattedSubject = template.subject
        .replace('[Role]', job.role)
        .replace('[Company]', job.company);

    const formattedBody = template.body
        .replace(/\[Role\]/g, job.role)
        .replace(/\[Company\]/g, job.company)
        .replace('[Date]', new Date(job.date).toLocaleDateString())
        .replace('[Hiring Manager]', 'Hiring Team')
        .replace('[Key Skills]', 'relevant experience')
        .replace('[Your Name]', 'Your Name');

    const handleCopy = () => {
        navigator.clipboard.writeText(`Subject: ${formattedSubject}\n\n${formattedBody}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleEmail = () => {
        const mailto = `mailto:?subject=${encodeURIComponent(formattedSubject)}&body=${encodeURIComponent(formattedBody)}`;
        window.open(mailto);
    };

    return (
        <div className="email-modal-overlay" onClick={onClose}>
            <div className="email-modal" onClick={e => e.stopPropagation()}>
                <div className="email-modal-header">
                    <h3>
                        <i className="fa-solid fa-envelope" />
                        Follow-Up Email Template
                    </h3>
                    <button className="email-modal-close" onClick={onClose}>
                        <i className="fa-solid fa-xmark" />
                    </button>
                </div>
                <div className="email-modal-body">
                    <div className="email-field">
                        <label>Subject</label>
                        <input type="text" value={formattedSubject} readOnly />
                    </div>
                    <div className="email-field">
                        <label>Body</label>
                        <textarea value={formattedBody} readOnly rows={12} />
                    </div>
                </div>
                <div className="email-modal-footer">
                    <button className="email-btn email-btn-secondary" onClick={handleCopy}>
                        <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`} />
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button className="email-btn email-btn-primary" onClick={handleEmail}>
                        <i className="fa-solid fa-paper-plane" />
                        Open in Email
                    </button>
                </div>
            </div>
        </div>
    );
};

function FollowUpReminders({ jobs = [] }) {
    const [dismissedIds, setDismissedIds] = useState(() => {
        const saved = localStorage.getItem('dismissedReminders');
        return saved ? JSON.parse(saved) : [];
    });
    const [selectedJob, setSelectedJob] = useState(null);
    const [templateType, setTemplateType] = useState('initial');
    const [showModal, setShowModal] = useState(false);

    // Save dismissed IDs
    useEffect(() => {
        localStorage.setItem('dismissedReminders', JSON.stringify(dismissedIds));
    }, [dismissedIds]);

    // Get jobs needing follow-up
    const reminders = useMemo(() => {
        return jobs
            .filter(job => (
                job.status === 'applied' ||
                job.status === 'on_hold' ||
                job.status === 'interview_scheduled' ||
                job.status === 'interview_completed'
            ) && !dismissedIds.includes(job._id))
            .map(job => ({
                job,
                followUp: getFollowUpStatus(job)
            }))
            .filter(item => item.followUp.priority > 0)
            .sort((a, b) => b.followUp.priority - a.followUp.priority);
    }, [jobs, dismissedIds]);

    const handleFollowUp = (job, followUp) => {
        setSelectedJob(job);
        if (followUp && followUp.template) {
            setTemplateType(followUp.template);
        } else {
            setTemplateType('initial'); // Default
        }
        setShowModal(true);
    };

    const handleDismiss = (jobId) => {
        setDismissedIds(prev => [...prev, jobId]);
    };

    const handleClearDismissed = () => {
        setDismissedIds([]);
    };

    if (reminders.length === 0) {
        return (
            <div className="followup-container">
                <div className="followup-header">
                    <h3>
                        <i className="fa-solid fa-bell" />
                        Follow-Up Reminders
                    </h3>
                </div>
                <div className="followup-empty">
                    <i className="fa-solid fa-check-circle" />
                    <p>You're all caught up! No follow-ups needed.</p>
                    {dismissedIds.length > 0 && (
                        <button
                            className="followup-reset-btn"
                            onClick={handleClearDismissed}
                        >
                            Show dismissed ({dismissedIds.length})
                        </button>
                    )}
                </div>
            </div>
        );
    }

    const urgentCount = reminders.filter(r => r.followUp.status === 'urgent').length;
    const overdueCount = reminders.filter(r => r.followUp.status === 'overdue').length;

    return (
        <div className="followup-container">
            <div className="followup-header">
                <h3>
                    <i className="fa-solid fa-bell" />
                    Follow-Up Reminders
                    <span className="followup-count">{reminders.length}</span>
                </h3>
                <div className="followup-badges">
                    {urgentCount > 0 && (
                        <span className="followup-badge urgent">
                            {urgentCount} urgent
                        </span>
                    )}
                    {overdueCount > 0 && (
                        <span className="followup-badge overdue">
                            {overdueCount} overdue
                        </span>
                    )}
                </div>
            </div>

            <div className="followup-list">
                {reminders.map(({ job, followUp }) => (
                    <ReminderCard
                        key={job._id}
                        job={job}
                        followUp={followUp}
                        onFollowUp={handleFollowUp}
                        onDismiss={handleDismiss}
                    />
                ))}
            </div>

            <EmailTemplateModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                job={selectedJob}
                templateType={templateType}
            />
        </div>
    );
}

export default memo(FollowUpReminders);
