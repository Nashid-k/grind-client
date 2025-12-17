import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import JobCard from '../components/JobCard';
import Header from '../components/Header';
import JobModal from '../components/JobModal';
import DeleteModal from '../components/DeleteModal';
import WidgetModal from '../components/WidgetModal';
import DailyGoal from '../components/DailyGoal';
import SpeedLogger from '../components/SpeedLogger';
import BadgesPanel from '../components/BadgesPanel';
import BadgeModal from '../components/BadgeModal';
import DailyQuests from '../components/DailyQuests';
import InterviewPrepHub from '../components/InterviewPrepHub';
import MilestoneCelebration, { checkMilestone } from '../components/MilestoneCelebration';
import ActivityHeatmap from '../components/ActivityHeatmap';
import WeeklyReport from '../components/WeeklyReport';
import RejectionRecovery from '../components/RejectionRecovery';
import ComebackBonus, { checkComeback } from '../components/ComebackBonus';
import ChallengeModal from '../components/ChallengeModal';
import FollowUpReminders from '../components/FollowUpReminders';
import DatePresets from '../components/DatePresets';
import ApplicationAnalytics from '../components/ApplicationAnalytics';
import SearchFilter from '../components/SearchFilter';
import WellnessMonitor from '../components/WellnessMonitor';
import ReviewModal from '../components/ReviewModal';
import './Dashboard.css';

function Dashboard() {
    const { user, logout } = useAuth();
    const { jobs, deleteJob, newBadge, clearNewBadge, questXP, addXP, dailyTarget } = useJobs();

    // UI States
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    // Date Filtering States
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [activePreset, setActivePreset] = useState('all');
    const [activeWidget, setActiveWidget] = useState(null);

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [jobToDelete, setJobToDelete] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [showChallengeModal, setShowChallengeModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);

    // Feature States
    const [milestone, setMilestone] = useState(null);
    const [showRejectionRecovery, setShowRejectionRecovery] = useState(false);
    const [comebackDays, setComebackDays] = useState(0);
    const [prevJobCount, setPrevJobCount] = useState(jobs.length);

    // Milestone check
    useEffect(() => {
        if (jobs.length > prevJobCount) {
            const newMilestone = checkMilestone(prevJobCount, jobs.length);
            if (newMilestone) setMilestone(newMilestone);
        }
        setPrevJobCount(jobs.length);
    }, [jobs.length, prevJobCount]);

    // Comeback check
    useEffect(() => {
        const lastVisit = localStorage.getItem('lastDashboardVisit');
        const daysAway = checkComeback(lastVisit);
        if (daysAway > 0) setComebackDays(daysAway);
        localStorage.setItem('lastDashboardVisit', new Date().toISOString());
    }, []);

    // Stats - Optimized with single pass reduce
    const stats = useMemo(() => {
        return jobs.reduce((acc, job) => {
            acc.total++;
            acc.applied++; // Total pipeline
            if (job.status === 'applied') acc.appliedActive++;
            if (job.status === 'shortlisted') acc.shortlisted++;
            if (job.status === 'interview_scheduled' || job.status === 'interview_completed') acc.interviewed++;
            if (job.status === 'offer_received') acc.offer++;
            if (job.status === 'rejected') acc.rejected++;
            return acc;
        }, { total: 0, applied: 0, appliedActive: 0, shortlisted: 0, interviewed: 0, offer: 0, rejected: 0 });
    }, [jobs]);

    // Today count
    const todayCount = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return jobs.filter(j => j.date === today).length;
    }, [jobs]);

    const todayProgress = Math.min((todayCount / dailyTarget) * 100, 100);

    const responseRate = useMemo(() => {
        if (stats.total === 0) return 0;
        return Math.round(((stats.shortlisted + stats.interviewed + stats.offer) / stats.total) * 100);
    }, [stats]);

    // Motivational quotes based on progress
    const motivationalQuote = useMemo(() => {
        const progressPercent = (todayCount / dailyTarget) * 100;
        const hour = new Date().getHours();

        if (todayCount >= dailyTarget) {
            const quotes = [
                "🎉 Incredible! You've crushed today's goal!",
                "🔥 Outstanding hustle! Your dedication shows!",
                "⭐ You're unstoppable! Keep this momentum going!",
                "🚀 Daily target smashed! You're on fire!"
            ];
            return quotes[Math.floor(Math.random() * quotes.length)];
        }

        if (progressPercent >= 75) {
            return "💪 Almost there! Just a few more to hit your target!";
        }

        if (progressPercent >= 50) {
            return "✨ Great progress! You're halfway to success!";
        }

        if (progressPercent >= 25) {
            return "📈 Good start! Keep the momentum building!";
        }

        if (todayCount > 0) {
            return "🌟 Every application brings you closer to your dream job!";
        }

        // No applications yet
        if (hour < 12) {
            return "☀️ Good morning! Start strong and reach your goal today!";
        } else if (hour < 17) {
            return "⚡ The afternoon is perfect for sending applications!";
        } else {
            return "🌙 Evening momentum! You've still got time to make progress!";
        }
    }, [todayCount, dailyTarget]);

    // Date Preset Functions
    const applyDatePreset = useCallback((preset) => {
        if (preset === 'custom') {
            setActivePreset('custom');
            return; // Don't calculate dates for custom
        }

        const today = new Date();
        let start, end;

        switch (preset) {
            case 'last7':
                start = new Date(today);
                start.setDate(today.getDate() - 7);
                end = today;
                break;
            case 'last30':
                start = new Date(today);
                start.setDate(today.getDate() - 30);
                end = today;
                break;
            case 'thisMonth':
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case 'thisYear':
                start = new Date(today.getFullYear(), 0, 1);
                end = new Date(today.getFullYear(), 11, 31);
                break;
            case 'all':
            default:
                start = '';
                end = '';
        }

        setDateRange({
            start: start ? start.toISOString().split('T')[0] : '',
            end: end ? end.toISOString().split('T')[0] : ''
        });
        setActivePreset(preset);
    }, []);

    // Handle manual date change for custom preset
    const handleDateChange = useCallback((field, value) => {
        setDateRange(prev => ({ ...prev, [field]: value }));
    }, []);

    // Weekly Trend Calculation
    const weeklyTrend = useMemo(() => {
        const today = new Date();
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay());

        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(thisWeekStart.getDate() - 7);
        const lastWeekEnd = new Date(thisWeekStart);
        lastWeekEnd.setDate(thisWeekStart.getDate() - 1);

        const thisWeekApps = jobs.filter(j => {
            const appDate = new Date(j.date);
            return appDate >= thisWeekStart && appDate <= today;
        }).length;

        const lastWeekApps = jobs.filter(j => {
            const appDate = new Date(j.date);
            return appDate >= lastWeekStart && appDate <= lastWeekEnd;
        }).length;

        const change = lastWeekApps === 0 ? 100 : ((thisWeekApps - lastWeekApps) / lastWeekApps) * 100;

        return {
            thisWeek: thisWeekApps,
            lastWeek: lastWeekApps,
            change: Math.round(change),
            trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
        };
    }, [jobs]);

    const filteredJobs = useMemo(() => {
        const term = searchTerm.toLowerCase();
        const start = dateRange.start ? new Date(dateRange.start) : null;
        const end = dateRange.end ? new Date(dateRange.end) : null;

        return jobs.filter(job => {
            // Text Search
            const matchesSearch = job.company.toLowerCase().includes(term) ||
                job.role.toLowerCase().includes(term);

            // Status Filter
            let matchesStatus = filterStatus === 'all' || job.status === filterStatus;

            // Date Range Filter
            let matchesDate = true;
            if (start || end) {
                const jobDate = new Date(job.date);
                if (start && jobDate < start) matchesDate = false;
                if (end && jobDate > end) matchesDate = false;
            }

            return matchesSearch && matchesStatus && matchesDate;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [jobs, searchTerm, filterStatus, dateRange]);



    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Reset page on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, dateRange]);

    const indexOfLastJob = currentPage * itemsPerPage;
    const indexOfFirstJob = indexOfLastJob - itemsPerPage;
    const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
    const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Handlers
    const handleEdit = useCallback((job) => {
        setEditingJob(job);
        setIsModalOpen(true);
    }, []);

    const handleDeleteClick = useCallback((job) => {
        setJobToDelete(job);
        setIsDeleteModalOpen(true);
    }, []);

    const confirmDelete = useCallback(() => {
        if (jobToDelete) {
            deleteJob(jobToDelete._id);
            setJobToDelete(null);
            setIsDeleteModalOpen(false);
        }
    }, [jobToDelete, deleteJob]);

    const handleAdd = useCallback(() => {
        setEditingJob(null);
        setIsModalOpen(true);
    }, []);

    const handleClaimXP = useCallback((amount) => {
        if (addXP) addXP(amount);
    }, [addXP]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    // Streak calculation (Optimized)
    const { streakCount, isStreakActive } = useMemo(() => {
        const streakData = JSON.parse(localStorage.getItem(`streak_${user?._id}`)) || { count: 0, lastDate: null };
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // Simple check for display
        const isActive = streakData.lastDate === today;
        return { streakCount: streakData.count, isStreakActive: isActive };
    }, [user?._id, jobs]); // Re-calc on jobs change as that might update streak

    return (
        <div className="dashboard">
            {/* Header */}
            {/* Header */}
            <Header onAdd={handleAdd} />

            {/* Daily Goal Progress - Redesigned */}
            <div className="db-daily-bar-new">
                <div className="daily-bar-content">
                    <div className="daily-bar-header">
                        <div className="daily-bar-icon-wrapper">
                            <i className="fa-solid fa-rocket"></i>
                        </div>
                        <div className="daily-bar-info">
                            <span className="daily-bar-label">Today's Mission</span>
                            <div className="daily-bar-stats">
                                <span className="daily-current">{todayCount}</span>
                                <span className="daily-separator">/</span>
                                <span className="daily-target">{dailyTarget}</span>
                                <span className="daily-unit">applications</span>
                            </div>
                        </div>
                    </div>
                    <button className="daily-bar-edit-btn" onClick={() => setActiveWidget('daily-goal')} title="Adjust Goal">
                        <i className="fa-solid fa-pen"></i>
                    </button>
                </div>

                {/* Motivational Quote */}
                <div className="daily-bar-motivation">
                    <span className="motivation-quote">{motivationalQuote}</span>
                </div>

                <div className="daily-bar-progress-container">
                    <div
                        className={`daily-bar-progress-fill ${todayCount >= dailyTarget ? 'complete' : ''}`}
                        style={{ width: `${todayProgress}%` }}
                    >
                        {todayCount >= dailyTarget && (
                            <span className="progress-checkmark">
                                <i className="fa-solid fa-check"></i>
                            </span>
                        )}
                    </div>
                </div>

                {todayCount >= dailyTarget && (
                    <div className="daily-bar-achievement">
                        <i className="fa-solid fa-trophy"></i>
                        <span>Daily Goal Crushed!</span>
                    </div>
                )}
            </div>

            {/* Content */}
            < div className="db-content" >
                {/* Main Content Area */}
                < main className="db-main" >
                    {!activeWidget && (
                        <>
                            {/* Interview Alert Banner */}
                            {(() => {
                                // Find soonest upcoming interview
                                const interviews = jobs.filter(j =>
                                    j.status === 'interview_scheduled' &&
                                    j.interviewDate &&
                                    new Date(j.interviewDate) > new Date()
                                ).sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate));

                                if (interviews.length === 0) return null;

                                const nextInterview = interviews[0];
                                const date = new Date(nextInterview.interviewDate);
                                const diff = date - new Date();
                                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

                                return (
                                    <div className="interview-alert-banner animate-slide-down">
                                        <div className="alert-content">
                                            <div className="alert-icon-wrapper">
                                                <i className="fa-solid fa-calendar-check fa-beat-fade"></i>
                                            </div>
                                            <div className="alert-info">
                                                <h4>Upcoming Interview: {nextInterview.company}</h4>
                                                <div className="alert-timer">
                                                    <span>{days > 0 ? `${days}d ` : ''}{hours}h until start</span>
                                                    <span className="alert-role"> • {nextInterview.role}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Link to={`/prep/${nextInterview._id}`} className="alert-action">
                                            Prep Now <i className="fa-solid fa-arrow-right"></i>
                                        </Link>
                                    </div>
                                );
                            })()}

                            {/* Stats */}
                            <div className="db-stats">
                                <div className="stat-box stat-blue">
                                    <i className="fa-solid fa-paper-plane" />
                                    <div className="stat-info">
                                        <span className="stat-num">{stats.appliedActive}</span>
                                        <span className="stat-txt">Applied</span>
                                        {weeklyTrend.thisWeek > 0 && (
                                            <span className={`stat-trend ${weeklyTrend.trend}`}>
                                                {weeklyTrend.trend === 'up' && <i className="fa-solid fa-arrow-up" />}
                                                {weeklyTrend.trend === 'down' && <i className="fa-solid fa-arrow-down" />}
                                                {Math.abs(weeklyTrend.change)}% this week
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="stat-box stat-gold">
                                    <i className="fa-solid fa-star" />
                                    <div className="stat-info">
                                        <span className="stat-num">{stats.shortlisted}</span>
                                        <span className="stat-txt">Shortlisted</span>
                                    </div>
                                </div>
                                <div className="stat-box stat-purple">
                                    <i className="fa-solid fa-calendar-check" />
                                    <div className="stat-info">
                                        <span className="stat-num">{stats.interviewed}</span>
                                        <span className="stat-txt">Interviews</span>
                                    </div>
                                </div>
                                <div className="stat-box stat-green">
                                    <i className="fa-solid fa-trophy" />
                                    <div className="stat-info">
                                        <span className="stat-num">{stats.offer}</span>
                                        <span className="stat-txt">Offers</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )
                    }

                    {/* Pipeline */}
                    <div className="db-pipeline">
                        <h3><i className="fa-solid fa-chart-simple" /> Application Pipeline</h3>
                        <div className="pipeline-stages">
                            <div className="stage">
                                <div className="stage-top">
                                    <span className="stage-num">{stats.total}</span>
                                    <span className="stage-lbl">Total</span>
                                </div>
                                <div className="stage-bar"><div className="bar-fill fill-gray" style={{ width: '100%' }} /></div>
                            </div>
                            <div className="stage">
                                <div className="stage-top">
                                    <span className="stage-num">{stats.shortlisted}</span>
                                    <span className="stage-lbl">Shortlist</span>
                                </div>
                                <div className="stage-bar"><div className="bar-fill fill-blue" style={{ width: `${(stats.shortlisted / stats.total) * 100 || 0}%` }} /></div>
                            </div>
                            <div className="stage">
                                <div className="stage-top">
                                    <span className="stage-num">{stats.interviewed}</span>
                                    <span className="stage-lbl">Interview</span>
                                </div>
                                <div className="stage-bar"><div className="bar-fill fill-purple" style={{ width: `${(stats.interviewed / stats.total) * 100 || 0}%` }} /></div>
                            </div>
                            <div className="stage">
                                <div className="stage-top">
                                    <span className="stage-num">{stats.offer}</span>
                                    <span className="stage-lbl">Offer</span>
                                </div>
                                <div className="stage-bar"><div className="bar-fill fill-green" style={{ width: `${(stats.offer / stats.total) * 100 || 0}%` }} /></div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="db-actions">
                        <button className="act-btn act-primary" onClick={handleAdd}>
                            <i className="fa-solid fa-plus" /> Add Application
                        </button>
                        <button className="act-btn" onClick={() => setActiveWidget(activeWidget === 'focus' ? null : 'focus')}>
                            <i className="fa-solid fa-bullseye" /> Set Goal
                        </button>
                        <button className="act-btn" onClick={() => setActiveWidget(activeWidget === 'logger' ? null : 'logger')}>
                            <i className="fa-solid fa-bolt" /> Speed Log
                        </button>
                        <button className="act-btn act-orange" onClick={() => setShowChallengeModal(true)}>
                            <i className="fa-solid fa-users" /> Challenge Friend
                        </button>
                        <Link to="/leaderboard" className="act-btn">
                            <i className="fa-solid fa-ranking-star" /> Leaderboard
                        </Link>
                        <button className="act-btn act-gold" onClick={() => setShowReviewModal(true)}>
                            <i className="fa-solid fa-star" /> Leave a Review
                        </button>
                        <a
                            href={`mailto:nashidk1999@gmail.com?subject=The Grind - Feedback&body=Type: [Bug Report / Feature Request]%0D%0A%0D%0ATitle: %0D%0A%0D%0ADescription:%0D%0A%0D%0A----%0D%0AFrom: ${user?.email || ''}%0D%0AName: ${user?.name || ''}`}
                            className="act-btn"
                            title="Report a bug or request a feature"
                        >
                            <i className="fa-solid fa-bug" /> Give Feedback
                        </a>
                        <Link to="/?preview=true" className="act-btn" title="View landing page with reviews">
                            <i className="fa-solid fa-eye" /> Preview Landing
                        </Link>
                    </div>

                    {/* Applications */}
                    <div className="db-apps">
                        <div className="apps-head">
                            <h3>
                                <i className="fa-solid fa-file-contract" />
                                Recent Applications
                                <span className="count-badge">{filteredJobs.length}</span>
                            </h3>



                            <div className="apps-controls">
                                {/* Date Presets */}
                                <DatePresets
                                    activePreset={activePreset}
                                    onPresetClick={applyDatePreset}
                                    dateRange={dateRange}
                                    onDateChange={handleDateChange}
                                />

                                <SearchFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} filteredCount={filteredJobs.length} totalCount={jobs.length} />
                                <select
                                    className="filter-dropdown"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="applied">Applied ({stats.appliedActive})</option>
                                    <option value="shortlisted">Shortlisted ({stats.shortlisted})</option>
                                    <option value="interview_scheduled">Interview Scheduled</option>
                                    <option value="interview_completed">Interview Completed</option>
                                    <option value="offer_received">Offer Received ({stats.offer})</option>
                                    <option value="on_hold">On Hold</option>
                                    <option value="rejected">Rejected ({stats.rejected})</option>
                                </select>
                            </div>
                        </div>
                        <div className="apps-list">


                            {currentJobs.length > 0 ? (
                                <>
                                    {currentJobs.map(job => (
                                        <JobCard
                                            key={job._id || job.id}
                                            job={job}
                                            onEdit={() => handleEdit(job)}
                                            onDelete={() => handleDeleteClick(job)}
                                        />
                                    ))}

                                    {/* Pagination Controls */}
                                    {filteredJobs.length > itemsPerPage && (
                                        <div className="pagination-controls">
                                            <button
                                                onClick={() => paginate(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="page-btn"
                                            >
                                                <i className="fa-solid fa-chevron-left"></i>
                                            </button>

                                            <span className="page-info">
                                                Page {currentPage} of {totalPages}
                                            </span>

                                            <button
                                                onClick={() => paginate(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="page-btn"
                                            >
                                                <i className="fa-solid fa-chevron-right"></i>
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="apps-empty">
                                    <i className="fa-regular fa-folder-open" />
                                    <h4>No applications yet</h4>
                                    <p>Start tracking your job search journey</p>
                                    <button onClick={handleAdd}>
                                        <i className="fa-solid fa-plus" /> Add First Application
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </main >

                {/* Sidebar */}
                < aside className="db-sidebar" >
                    <WellnessMonitor jobs={jobs} />
                    <FollowUpReminders jobs={jobs} />
                    <DailyQuests />
                    <ActivityHeatmap jobs={jobs} dailyTarget={dailyTarget} />
                    <BadgesPanel />
                </aside >
            </div >

            {/* Bottom Section - Analytics & Prep */}
            {
                (stats.shortlisted > 0 || stats.total >= 3) && (
                    <div className="db-bottom">
                        {stats.shortlisted > 0 && <InterviewPrepHub jobs={jobs} />}
                        {stats.total >= 3 && <ApplicationAnalytics jobs={jobs} />}
                    </div>
                )
            }

            {/* Modals */}
            {
                isModalOpen && (
                    <JobModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        editingJob={editingJob}
                    />
                )
            }

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
            />

            {newBadge && <BadgeModal badge={newBadge} onClose={clearNewBadge} />}

            <WidgetModal
                isOpen={activeWidget === 'focus'}
                onClose={() => setActiveWidget(null)}
                title="Daily Goal"
                icon="fa-solid fa-bullseye"
            >
                <DailyGoal jobs={jobs} />
            </WidgetModal>

            <WidgetModal
                isOpen={activeWidget === 'logger'}
                onClose={() => setActiveWidget(null)}
                title="Speed Logger"
                icon="fa-solid fa-bolt"
            >
                <SpeedLogger />
            </WidgetModal>

            {
                milestone && (
                    <MilestoneCelebration
                        milestone={milestone}
                        onClose={() => setMilestone(null)}
                        onClaimXP={handleClaimXP}
                    />
                )
            }

            {
                showRejectionRecovery && (
                    <RejectionRecovery
                        onClose={() => setShowRejectionRecovery(false)}
                        onClaimXP={handleClaimXP}
                    />
                )
            }

            {
                comebackDays > 0 && (
                    <ComebackBonus
                        daysAway={comebackDays}
                        onClose={() => setComebackDays(0)}
                        onClaimXP={handleClaimXP}
                    />
                )
            }

            <ChallengeModal
                isOpen={showChallengeModal}
                onClose={() => setShowChallengeModal(false)}
            />

            <ReviewModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                onSuccess={() => {
                    alert('✨ Thank you for your review! It will appear on our landing page.');
                }}
            />
        </div >
    );
}

export default memo(Dashboard);
