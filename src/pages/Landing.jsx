import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

// Static data - memoized to prevent re-creation
const PAIN_POINTS = [
    {
        icon: 'fa-inbox',
        title: 'Lost in the Void',
        desc: 'Hundreds of applications sent. No idea which company ghosted you or where you stand.',
        color: '#ef4444'
    },
    {
        icon: 'fa-battery-empty',
        title: 'Motivation Dead',
        desc: 'Every rejection chips away at your drive. The grind feels endless and unrewarding.',
        color: '#f59e0b'
    },
    {
        icon: 'fa-question',
        title: 'No Strategy',
        desc: 'Applying randomly, hoping something sticks. No data, no insights, no improvement.',
        color: '#a855f7'
    }
];

const FEATURES = [
    {
        icon: 'fa-bolt',
        title: 'Track Everything',
        desc: 'Log jobs in 5 seconds with our Speed Logger. Visual pipeline shows exactly where you stand: Applied → Shortlisted → Interviewed → Offer.',
        color: '#3b82f6',
        items: ['Never lose track of applications', 'Quick entry, no friction', 'Visual status at a glance'],
        bgIcon: 'fa-list-check'
    },
    {
        icon: 'fa-fire',
        title: 'Stay Motivated',
        desc: 'Daily Streaks, XP for every action, Badges for milestones, and Leaderboards to compete. Turn rejection into progress.',
        color: '#f59e0b',
        items: ['Earn XP for every application', 'Build daily streaks', 'Climb the leaderboards'],
        bgIcon: 'fa-trophy'
    },
    {
        icon: 'fa-bullseye',
        title: 'Maximize Focus',
        desc: 'Activate Grind Mode with built-in Pomodoro timer. Block distractions and ensure deep work sessions for quality applications.',
        color: '#a855f7',
        items: ['Pomodoro timer integration', 'Customizable work sessions', 'Track productivity metrics'],
        bgIcon: 'fa-clock'
    }
];

const STATS = [
    { value: '10,000+', label: 'Applications Tracked', icon: 'fa-briefcase' },
    { value: '500+', label: 'Active Grinders', icon: 'fa-users' },
    { value: '95%', label: 'Better Organization', icon: 'fa-chart-line' }
];

const BENEFITS = [
    { icon: 'fa-heart', text: 'Free forever — No hidden costs, no premium tiers' },
    { icon: 'fa-shield-halved', text: 'Privacy-focused — Your data stays yours' },
    { icon: 'fa-users', text: 'Built by job seekers, for job seekers' },
    { icon: 'fa-ban', text: 'No ads, no distractions, just results' },
    { icon: 'fa-rocket', text: 'Continuous updates based on community feedback' }
];

function Landing() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState({ totalReviews: 0, averageRating: 0 });

    // Redirect authenticated users to dashboard (unless previewing)
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const isPreview = urlParams.get('preview') === 'true';

        if (user && !isPreview) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    // Fetch reviews
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                console.log('Fetching reviews...');
                const [reviewsRes, statsRes] = await Promise.all([
                    fetch('http://localhost:5000/api/reviews'),
                    fetch('http://localhost:5000/api/reviews/stats')
                ]);

                if (reviewsRes.ok) {
                    const reviewsData = await reviewsRes.json();
                    console.log('Reviews fetched:', reviewsData);
                    setReviews(reviewsData);
                }

                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    console.log('Review stats fetched:', statsData);
                    setReviewStats(statsData);
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        };

        fetchReviews();
    }, []);

    // Intersection Observer for scroll reveal animations
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all scroll-reveal elements
        document.querySelectorAll('.scroll-reveal').forEach(el => {
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className="landing-page">
            {/* HERO SECTION */}
            <section className="landing-section hero-section">
                <div className="hero-gradient-bg" />

                <div className="hero-content scroll-reveal">
                    {/* Static Rocket Icon */}
                    <div className="hero-rocket-container">
                        <i className="fa-solid fa-rocket hero-rocket" />
                    </div>

                    <h1 className="hero-title">
                        Turn Job Hunting Into a{' '}
                        <span className="gradient-text">Winning Strategy</span>
                    </h1>

                    <p className="hero-subtitle">
                        Transform the chaos of job applications into an organized, gamified system that keeps you motivated through every rejection.
                    </p>

                    <Link to="/login" className="btn-primary hero-cta">
                        Enter the System
                        <i className="fa-solid fa-arrow-right" />
                    </Link>
                </div>

                {/* Scroll indicator - positioned at bottom of hero section */}
                <div className="scroll-indicator">
                    <p>Start Your Journey</p>
                    <i className="fa-solid fa-chevron-down" />
                </div>
            </section>

            {/* PROBLEM SECTION */}
            <section className="landing-section">
                <div className="section-container">
                    <h2 className="section-title scroll-reveal">
                        Why Job Hunting Feels <span className="text-red">Broken</span>
                    </h2>

                    <div className="cards-grid">
                        {PAIN_POINTS.map((pain, idx) => (
                            <div
                                key={idx}
                                className="glass-panel pain-card scroll-reveal"
                                style={{ '--delay': `${idx * 100}ms`, '--accent': pain.color }}
                            >
                                <i
                                    className={`fa-solid ${pain.icon} pain-icon`}
                                    style={{ color: pain.color }}
                                />
                                <h3>{pain.title}</h3>
                                <p>{pain.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SOLUTION SECTION */}
            <section className="landing-section">
                <div className="section-container narrow scroll-reveal">
                    <h2 className="section-title">
                        What is <span className="text-primary">The Grind</span>?
                    </h2>

                    <div className="section-divider" />

                    <p className="section-text large">
                        A <strong className="text-primary">gamified job application tracker</strong> that transforms the chaos of job hunting into an organized, motivational system.
                    </p>

                    <p className="section-text">
                        Stop treating your career search like a chore. Start treating it like a strategy game where every application is progress, every rejection is XP, and every win is celebrated.
                    </p>

                    <div className="glass-panel highlight-panel">
                        <h3>Built by job seekers, for job seekers</h3>
                        <p>
                            We've been through the pain. The ghosting. The rejection emails. The endless spreadsheets. That's why we built something better.
                        </p>
                    </div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section className="landing-section features-section">
                <div className="section-container wide">
                    <h2 className="section-title scroll-reveal">
                        How It <span className="text-primary">Works</span>
                    </h2>

                    {FEATURES.map((feature, idx) => (
                        <div
                            key={idx}
                            className={`feature-row scroll-reveal ${idx % 2 === 1 ? 'reverse' : ''}`}
                            style={{ '--delay': `${idx * 150}ms` }}
                        >
                            <div
                                className="glass-panel feature-card"
                                style={{ '--border-color': `${feature.color}33` }}
                            >
                                <i
                                    className={`fa-solid ${feature.icon} feature-icon`}
                                    style={{ color: feature.color }}
                                />
                                <h3>{feature.title}</h3>
                                <p>{feature.desc}</p>
                                <ul className="feature-list">
                                    {feature.items.map((item, i) => (
                                        <li key={i}>
                                            <i
                                                className="fa-solid fa-check"
                                                style={{ color: feature.color }}
                                            />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="feature-bg-icon">
                                <i
                                    className={`fa-solid ${feature.bgIcon}`}
                                    style={{ color: feature.color }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* STATS SECTION */}
            <section className="landing-section stats-section">
                <div className="section-container">
                    <h2 className="section-title scroll-reveal">
                        Join the <span className="text-primary">Movement</span>
                    </h2>

                    <div className="stats-grid">
                        {STATS.map((stat, idx) => (
                            <div
                                key={idx}
                                className="stat-item scroll-reveal"
                                style={{ '--delay': `${idx * 100}ms` }}
                            >
                                <i className={`fa-solid ${stat.icon}`} />
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* QUOTES SECTION */}
            <section className="landing-section">
                <div className="section-container narrow scroll-reveal">
                    <div className="quote-icon">
                        <i className="fa-solid fa-quote-left" />
                    </div>

                    <blockquote className="quote-text">
                        "Success is stumbling from failure to failure with no loss of enthusiasm."
                    </blockquote>

                    <p className="quote-author">— Winston Churchill</p>

                    <div className="quote-highlight">
                        <p><strong className="text-primary">Every rejection is redirection.</strong></p>
                        <p className="text-muted">
                            The job search isn't about perfection—it's about persistence. Track it. Own it. Conquer it.
                        </p>
                    </div>
                </div>
            </section>

            {/* WHY CHOOSE SECTION */}
            <section className="landing-section">
                <div className="section-container narrow">
                    <h2 className="section-title scroll-reveal">
                        Why Choose <span className="text-primary">The Grind</span>?
                    </h2>

                    <div className="glass-panel benefits-panel scroll-reveal">
                        {BENEFITS.map((benefit, idx) => (
                            <div
                                key={idx}
                                className="benefit-item"
                                style={{ '--delay': `${idx * 50}ms` }}
                            >
                                <div className="benefit-icon-wrapper">
                                    <i className={`fa-solid ${benefit.icon}`} />
                                </div>
                                <p>{benefit.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* REVIEWS SECTION */}
            {reviews.length > 0 && (
                <section className="landing-section reviews-section">
                    <div className="section-container wide">
                        <h2 className="section-title scroll-reveal">
                            What <span className="text-primary">Grinders</span> Are Saying
                        </h2>

                        {reviewStats.totalReviews > 0 && (
                            <div className="reviews-stats scroll-reveal">
                                <div className="aggregate-rating">
                                    <div className="rating-number">{reviewStats.averageRating}</div>
                                    <div className="rating-stars">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <i
                                                key={star}
                                                className={`fa-solid fa-star ${star <= Math.round(reviewStats.averageRating) ? 'filled' : ''}`}
                                            />
                                        ))}
                                    </div>
                                    <div className="rating-count">{reviewStats.totalReviews} reviews</div>
                                </div>
                            </div>
                        )}

                        <div className="reviews-grid">
                            {reviews.map((review, idx) => (
                                <div
                                    key={review._id}
                                    className="glass-panel review-card scroll-reveal"
                                    style={{ '--delay': `${idx * 100}ms` }}
                                >
                                    <div className="review-header">
                                        <div className="review-user">
                                            {review.userPhoto ? (
                                                <img src={review.userPhoto} alt={review.userName} className="review-avatar" />
                                            ) : (
                                                <div className="review-avatar-placeholder">
                                                    {review.userName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="review-user-info">
                                                <div className="review-user-name">{review.userName}</div>
                                                <div className="review-stars">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <i
                                                            key={star}
                                                            className={`fa-solid fa-star ${star <= review.rating ? 'filled' : ''}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="review-date">
                                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                    <p className="review-comment">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* FINAL CTA */}
            <section className="landing-section cta-section">
                <div className="cta-bg-glow" />

                <div className="section-container narrow scroll-reveal">
                    <h2 className="cta-title">
                        Ready to Level Up Your Job Hunt?
                    </h2>

                    <p className="cta-subtitle">
                        Join thousands of job seekers who transformed their search from chaos to conquest.
                    </p>

                    <Link to="/login" className="btn-primary cta-btn">
                        Start Grinding — It's Free
                        <i className="fa-solid fa-rocket" />
                    </Link>

                    <p className="cta-note">
                        No credit card required. Sign in with Google and start in 30 seconds.
                    </p>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="landing-footer">
                <div className="footer-brand">
                    <i className="fa-solid fa-rocket footer-logo" />
                    <span>The Grind</span>
                </div>
                <p className="footer-tagline">"Track it. Own it. Conquer it."</p>
                <div className="footer-divider" />
                <p className="footer-credit">
                    Crafted with <i className="fa-solid fa-heart" style={{ color: '#ef4444' }} /> by{' '}
                    <strong className="footer-author-name">Nashid K</strong>
                </p>
                <div className="footer-social">
                    <a href="https://github.com/Nashid-k" target="_blank" rel="noopener noreferrer" title="GitHub">
                        <i className="fa-brands fa-github" />
                    </a>
                    <a href="https://www.linkedin.com/in/nashid-mern/" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                        <i className="fa-brands fa-linkedin" />
                    </a>
                    <a href="mailto:nashidk1999@gmail.com" title="Email">
                        <i className="fa-solid fa-envelope" />
                    </a>
                    <a href="tel:+919061142958" title="Phone">
                        <i className="fa-solid fa-phone" />
                    </a>
                </div>
                <p className="footer-copyright">© 2025 All rights reserved</p>
            </footer>
        </div>
    );
}

export default Landing;
