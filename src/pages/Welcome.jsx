import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Welcome.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Welcome() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [target, setTarget] = useState(20);
    const [quote, setQuote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeStep, setActiveStep] = useState(1); // 1: Intro, 2: Setup

    // Logic: Redirect if already seen welcome
    useEffect(() => {
        if (user?.hasSeenWelcome) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);

    // Dynamic Quotes Logic based on target intensity
    useEffect(() => {
        let newQuote = "";
        if (target < 10) {
            newQuote = "Every journey begins with a single step.";
        } else if (target < 25) {
            newQuote = "Consistency is the DNA of mastery.";
        } else if (target < 40) {
            newQuote = "Intensity beats extensity. You're on fire.";
        } else {
            newQuote = "Legendary mode. Prepare for greatness.";
        }
        setQuote(newQuote);
    }, [target]);

    const handleStart = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setIsSubmitting(true);

        try {
            // optimistically update local state to feel instant
            updateUser({ hasSeenWelcome: true, settings: { dailyTarget: target } });

            // Sync with DailyGoal component's expectation
            localStorage.setItem(`dailyTarget_${user._id}`, target.toString());

            // Save to database in background
            fetch(`${API_URL}/api/auth/mark-welcome-seen`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user._id,
                    dailyTarget: target
                })
            }).catch(err => console.error("Background sync failed:", err));

            // Navigate immediately
            setTimeout(() => navigate('/dashboard', { replace: true }), 800); // Small delay for exit animation

        } catch (error) {
            console.error('Error in welcome flow:', error);
            navigate('/dashboard');
        }
    };

    return (
        <div className={`welcome-container ${isSubmitting ? 'exiting' : ''}`}>
            <div className="welcome-background">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
                <div className="grid-overlay"></div>
            </div>

            <div className="welcome-content">
                {activeStep === 1 && (
                    <div className="step-intro animate-fade-in-up">
                        <div className="logo-badge">
                            <i className="fa-solid fa-rocket"></i>
                        </div>
                        <h1 className="hero-title">
                            Initialize Your <span className="text-gradient">Grind</span>
                        </h1>
                        <p className="hero-subtitle">
                            Transform your job search into a data-driven campaign. <br />
                            Track, analyze, and conquer.
                        </p>

                        <div className="features-row">
                            <div className="feature-item">
                                <div className="icon-box"><i className="fa-solid fa-chart-pie"></i></div>
                                <span>Analytics</span>
                            </div>
                            <div className="feature-item">
                                <div className="icon-box"><i className="fa-solid fa-fire-flame-curved"></i></div>
                                <span>Streaks</span>
                            </div>
                            <div className="feature-item">
                                <div className="icon-box"><i className="fa-solid fa-trophy"></i></div>
                                <span>Leaderboard</span>
                            </div>
                        </div>

                        <button className="primary-btn pulse-glow" onClick={() => setActiveStep(2)}>
                            Get Started <i className="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                )}

                {activeStep === 2 && (
                    <div className="step-setup animate-fade-in-right">
                        <div className="setup-card">
                            <div className="card-header">
                                <h2>Daily Commitment</h2>
                                <p>How many applications will you send daily?</p>
                            </div>

                            <div className="target-selector">
                                <button
                                    className="adjust-btn minus"
                                    onClick={() => setTarget(Math.max(1, target - 1))}
                                >
                                    <i className="fa-solid fa-minus"></i>
                                </button>

                                <div className="target-display">
                                    <div className="target-number">{target}</div>
                                    <div className="target-label">Apps/Day</div>
                                </div>

                                <button
                                    className="adjust-btn plus"
                                    onClick={() => setTarget(target + 1)}
                                >
                                    <i className="fa-solid fa-plus"></i>
                                </button>
                            </div>

                            <div className="target-slider-container">
                                <input
                                    type="range"
                                    min="1"
                                    max="50"
                                    value={target}
                                    onChange={(e) => setTarget(parseInt(e.target.value))}
                                    className="target-slider"
                                />
                            </div>

                            <div className="quote-box">
                                <i className="fa-solid fa-quote-left"></i>
                                <p>{quote}</p>
                            </div>

                            <button
                                className={`primary-btn finish-btn ${isSubmitting ? 'loading' : ''}`}
                                onClick={handleStart}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <i className="fa-solid fa-circle-notch fa-spin"></i> Setting up...
                                    </>
                                ) : (
                                    <>
                                        Enter Dashboard <i className="fa-solid fa-check"></i>
                                    </>
                                )}
                            </button>

                            <button className="back-link" onClick={() => setActiveStep(1)}>
                                Back
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Welcome;
