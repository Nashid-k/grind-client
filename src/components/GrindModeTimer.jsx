import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import './GrindMode.css';

/**
 * Enhanced GrindModeTimer with proper Pomodoro technique
 * - Work/Break cycles (25 min work, 5 min short break, 15 min long break)
 * - Session tracking with localStorage persistence
 * - Focus streak integration
 * - Visual progress indication
 */
function GrindModeTimer() {
    const { user } = useAuth();
    const { jobs, addXP } = useJobs();

    // Timer State
    const [isActive, setIsActive] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [timeLeft, setTimeLeft] = useState(25 * 60);

    // Pomodoro State
    const [mode, setMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const [totalFocusTime, setTotalFocusTime] = useState(0); // in minutes
    const [dailyGoal, setDailyGoal] = useState(4); // pomodoros

    // Session Tracking
    const [goal, setGoal] = useState('');
    const [startJobCount, setStartJobCount] = useState(0);
    const [appsThisSession, setAppsThisSession] = useState(0);

    const intervalRef = useRef(null);
    const STORAGE_KEY = `grind_mode_${user?.username}`;

    // Durations in seconds
    const DURATIONS = useMemo(() => ({
        work: 25 * 60,
        shortBreak: 5 * 60,
        longBreak: 15 * 60
    }), []);

    // Load saved data on mount
    useEffect(() => {
        if (!user?.username) return;

        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        const today = new Date().toISOString().split('T')[0];

        if (saved.date === today) {
            setSessionsCompleted(saved.sessions || 0);
            setTotalFocusTime(saved.focusTime || 0);
        } else {
            // Reset for new day
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                date: today,
                sessions: 0,
                focusTime: 0
            }));
        }
    }, [user?.username, STORAGE_KEY]);

    // Timer logic
    useEffect(() => {
        if (isActive && !isPaused && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            handleSessionComplete();
        }

        return () => clearInterval(intervalRef.current);
    }, [isActive, isPaused, timeLeft]);

    // Track apps during session
    useEffect(() => {
        if (isActive && mode === 'work') {
            setAppsThisSession(jobs.length - startJobCount);
        }
    }, [jobs.length, isActive, mode, startJobCount]);

    const handleSessionComplete = useCallback(() => {
        clearInterval(intervalRef.current);
        setIsActive(false);
        setIsPaused(false);

        // Play notification sound
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => { });

        if (mode === 'work') {
            // Complete a work session
            const newSessions = sessionsCompleted + 1;
            const newFocusTime = totalFocusTime + 25;

            setSessionsCompleted(newSessions);
            setTotalFocusTime(newFocusTime);

            // Award XP for completing pomodoro
            if (addXP) addXP(15);

            // Save to localStorage
            const today = new Date().toISOString().split('T')[0];
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                date: today,
                sessions: newSessions,
                focusTime: newFocusTime
            }));

            // Determine next break type
            if (newSessions % 4 === 0) {
                setMode('longBreak');
                setTimeLeft(DURATIONS.longBreak);
            } else {
                setMode('shortBreak');
                setTimeLeft(DURATIONS.shortBreak);
            }
        } else {
            // Break complete, back to work
            setMode('work');
            setTimeLeft(DURATIONS.work);
        }
    }, [mode, sessionsCompleted, totalFocusTime, addXP, STORAGE_KEY, DURATIONS]);

    const formatTime = useCallback((seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    const startSession = useCallback(() => {
        setStartJobCount(jobs.length);
        setAppsThisSession(0);
        setIsActive(true);
        setIsPaused(false);
    }, [jobs.length]);

    const togglePause = useCallback(() => {
        setIsPaused(prev => !prev);
    }, []);

    const skipBreak = useCallback(() => {
        setMode('work');
        setTimeLeft(DURATIONS.work);
        setIsActive(false);
    }, [DURATIONS.work]);

    const resetTimer = useCallback(() => {
        clearInterval(intervalRef.current);
        setIsActive(false);
        setIsPaused(false);
        setMode('work');
        setTimeLeft(DURATIONS.work);
        setAppsThisSession(0);
    }, [DURATIONS.work]);

    // Progress percentage
    const progress = useMemo(() => {
        const total = DURATIONS[mode];
        return ((total - timeLeft) / total) * 100;
    }, [timeLeft, mode, DURATIONS]);

    const goalProgress = useMemo(() => {
        return Math.min((sessionsCompleted / dailyGoal) * 100, 100);
    }, [sessionsCompleted, dailyGoal]);

    if (!user) return null;

    // Minimized FAB
    if (!isExpanded) {
        return (
            <div
                className={`grind-fab ${isActive ? 'active' : ''}`}
                onClick={() => setIsExpanded(true)}
            >
                <i className="fa-solid fa-bolt" />
                {isActive && (
                    <div className="grind-fab-timer">{formatTime(timeLeft)}</div>
                )}
                {sessionsCompleted > 0 && !isActive && (
                    <div className="grind-fab-count">{sessionsCompleted}</div>
                )}
            </div>
        );
    }

    const getModeLabel = () => {
        switch (mode) {
            case 'shortBreak': return 'Short Break';
            case 'longBreak': return 'Long Break';
            default: return 'Focus Time';
        }
    };

    const getModeColor = () => {
        switch (mode) {
            case 'shortBreak': return '#22c55e';
            case 'longBreak': return '#3b82f6';
            default: return '#f59e0b';
        }
    };

    return (
        <>
            {/* Focus Mode Backdrop */}
            {isActive && mode === 'work' && (
                <div className="grind-backdrop" />
            )}

            {/* Main Widget */}
            <div className={`grind-widget ${mode !== 'work' ? 'break-mode' : ''}`}
                style={{ '--mode-color': getModeColor() }}
            >
                {/* Header */}
                <div className="grind-header">
                    <div className="grind-title">
                        <i className="fa-solid fa-bolt" />
                        <span>Grind Mode</span>
                    </div>
                    <button className="grind-minimize" onClick={() => setIsExpanded(false)}>
                        <i className="fa-solid fa-chevron-down" />
                    </button>
                </div>

                {/* Mode Label */}
                <div className="grind-mode-label" style={{ color: getModeColor() }}>
                    {getModeLabel()}
                    {isActive && mode === 'work' && (
                        <span className="grind-xp-multiplier">
                            <i className="fa-solid fa-bolt" /> 2x XP
                        </span>
                    )}
                </div>

                {/* Circular Timer */}
                <div className="grind-timer-wrapper">
                    <svg className="grind-timer-ring" viewBox="0 0 100 100">
                        <circle className="grind-timer-bg" cx="50" cy="50" r="45" />
                        <circle
                            className="grind-timer-progress"
                            cx="50" cy="50" r="45"
                            style={{
                                strokeDashoffset: 283 - (283 * progress / 100),
                                stroke: getModeColor()
                            }}
                        />
                    </svg>
                    <div className="grind-timer-display">
                        <span className="grind-time">{formatTime(timeLeft)}</span>
                        {isActive && mode === 'work' && appsThisSession > 0 && (
                            <span className="grind-apps-count">
                                +{appsThisSession} apps
                            </span>
                        )}
                    </div>
                </div>

                {/* Goal Input (only before starting) */}
                {!isActive && mode === 'work' && (
                    <input
                        type="text"
                        className="grind-goal-input"
                        placeholder="What's your focus goal?"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                    />
                )}

                {/* Active Goal Display */}
                {isActive && goal && (
                    <div className="grind-active-goal">
                        "{goal}"
                    </div>
                )}

                {/* Controls */}
                <div className="grind-controls">
                    {!isActive ? (
                        <>
                            {mode === 'work' ? (
                                <button className="grind-btn primary" onClick={startSession}>
                                    <i className="fa-solid fa-play" /> Start Focus
                                </button>
                            ) : (
                                <>
                                    <button className="grind-btn primary" onClick={startSession}>
                                        <i className="fa-solid fa-play" /> Start Break
                                    </button>
                                    <button className="grind-btn secondary" onClick={skipBreak}>
                                        Skip
                                    </button>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <button className="grind-btn secondary" onClick={togglePause}>
                                <i className={`fa-solid fa-${isPaused ? 'play' : 'pause'}`} />
                                {isPaused ? 'Resume' : 'Pause'}
                            </button>
                            <button className="grind-btn icon" onClick={resetTimer}>
                                <i className="fa-solid fa-rotate-left" />
                            </button>
                        </>
                    )}
                </div>

                {/* Daily Progress */}
                <div className="grind-daily-progress">
                    <div className="grind-progress-header">
                        <span>Daily Progress</span>
                        <span className="grind-progress-count">
                            {sessionsCompleted}/{dailyGoal} pomodoros
                        </span>
                    </div>
                    <div className="grind-progress-bar">
                        <div
                            className="grind-progress-fill"
                            style={{ width: `${goalProgress}%` }}
                        />
                    </div>
                    {totalFocusTime > 0 && (
                        <div className="grind-focus-time">
                            <i className="fa-solid fa-clock" />
                            {totalFocusTime}m focused today
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default memo(GrindModeTimer);
