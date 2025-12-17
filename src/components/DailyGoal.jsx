import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import './DailyGoal.css';

function DailyGoal({ jobs }) {
    const { user } = useAuth();
    const { dailyTarget, updateDailyTarget } = useJobs();
    const [streak, setStreak] = useState(0);
    const [quote, setQuote] = useState('');
    const [animateTarget, setAnimateTarget] = useState(false);

    // Calculate jobs applied today & rejections
    const today = new Date().toISOString().split('T')[0];
    const allJobsToday = jobs.filter(job => job.date === today).length;
    const progress = Math.min((allJobsToday / dailyTarget) * 100, 100);

    // Persistence Keys
    const STREAK_KEY = `streak_${user._id}`;

    useEffect(() => {
        // Load & Calculate Streak
        const savedStreakData = JSON.parse(localStorage.getItem(STREAK_KEY)) || { count: 0, lastDate: null };
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (savedStreakData.lastDate === today) {
            setStreak(savedStreakData.count);
        } else if (savedStreakData.lastDate === yesterdayStr) {
            setStreak(savedStreakData.count);
        } else {
            setStreak(savedStreakData.count > 0 && savedStreakData.lastDate !== yesterdayStr ? 0 : savedStreakData.count);
        }
    }, [user._id, today, STREAK_KEY]);

    // Update Motivation & Streak on Change
    useEffect(() => {
        if (allJobsToday >= dailyTarget) {
            updateStreak();
        }
        updateMotivation();
    }, [allJobsToday, dailyTarget]);

    const updateStreak = () => {
        const savedStreakData = JSON.parse(localStorage.getItem(STREAK_KEY)) || { count: 0, lastDate: null };
        if (savedStreakData.lastDate === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let newCount = 1;
        if (savedStreakData.lastDate === yesterdayStr) {
            newCount = savedStreakData.count + 1;
        }

        const newData = { count: newCount, lastDate: today };
        localStorage.setItem(STREAK_KEY, JSON.stringify(newData));
        setStreak(newCount);
    };

    const updateMotivation = () => {
        // Dynamic Quote Logic from Welcome Page
        let newQuote = "";

        // Priority to completion
        if (allJobsToday >= dailyTarget) {
            const successQuotes = [
                "Target Smashed! 💥 You are unstoppable.",
                "Take a bow. You won today.",
                "Consistency like this is rare. You're top 1%.",
                "Rest easy, champion. You earned it."
            ];
            newQuote = successQuotes[Math.floor(Math.random() * successQuotes.length)];
        } else {
            // Intensity based quotes
            if (dailyTarget < 10) {
                newQuote = "Small steps are better than no steps.";
            } else if (dailyTarget < 25) {
                newQuote = "Consistency is the key to breakthrough.";
            } else if (dailyTarget < 40) {
                newQuote = "Pushing limits. That's where growth happens.";
            } else {
                newQuote = "Beast mode activated. Let's conquer.";
            }
        }
        setQuote(newQuote);
    };

    const changeTarget = (delta) => {
        const newVal = Math.max(5, dailyTarget + delta);
        updateDailyTarget(newVal);

        // Trigger pulse
        setAnimateTarget(true);
        setTimeout(() => setAnimateTarget(false), 300);
    };

    return (
        <div className="glass-panel daily-goal-card animate-pop-in" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))', position: 'relative', overflow: 'hidden' }}>

            {/* Header: Title + Streak */}
            <div className="dg-header">
                <div className="dg-title">
                    <i className="fa-solid fa-rocket animate-bounce" style={{ color: 'var(--accent-primary)' }}></i>
                    <h3>Daily Focus</h3>
                </div>
                {streak > 0 && (
                    <div className="streak-badge animate-pop-in">
                        <i className="fa-solid fa-fire"></i> {streak} Day Streak
                    </div>
                )}
            </div>

            {/* Target Widget (Redesigned) */}
            <div className="target-widget-new">
                <div className="target-info">
                    <span className="target-label">Reviewing Goal</span>
                    <div className="target-val-group">
                        <span className="current-val">{allJobsToday}</span>
                        <span className="sep">/</span>
                        <span className="target-val">{dailyTarget}</span>
                    </div>
                </div>

                <div className="target-controls">
                    <button className="target-edit-btn" onClick={() => changeTarget(-5)} title="Decrease Goal">
                        <i className="fa-solid fa-minus"></i>
                    </button>
                    <span className="edit-label">Adj.</span>
                    <button className="target-edit-btn" onClick={() => changeTarget(5)} title="Increase Goal">
                        <i className="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>

            {/* Motivation Quote */}
            <blockquote className="quote-compact animate-fade-up" style={{ margin: '0 0 1.5rem 0', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderLeft: '3px solid var(--accent-primary)' }}>
                "{quote}"
            </blockquote>



            {/* Progress Bar */}
            <div className="progress-bar-container" style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
                <div
                    className="progress-bar-fill"
                    style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: allJobsToday >= dailyTarget
                            ? 'linear-gradient(90deg, #10b981, #34d399)'
                            : 'linear-gradient(90deg, var(--accent-primary), var(--status-interviewed))',
                        transition: 'width 1s ease-out',
                        boxShadow: '0 0 15px var(--accent-glow)'
                    }}
                ></div>
            </div>

            {/* Completion Message */}
            {allJobsToday >= dailyTarget && (
                <div className="celebration-msg animate-pop-in" style={{ marginTop: '0.8rem', fontSize: '0.9rem', color: 'var(--status-offer)', textAlign: 'center', fontWeight: '700' }}>
                    🔥 Streak Active! See you tomorrow!
                </div>
            )}
        </div>
    );
}

export default DailyGoal;
