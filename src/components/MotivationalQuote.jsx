import React, { useState, useEffect, useMemo } from 'react';
import './MotivationalQuote.css';

// Quote categories
const QUOTES = {
    morning: [
        { text: "Rise and grind. Today's applications could change your life.", author: "The Grind" },
        { text: "Every morning is a fresh start. Make it count.", author: "The Grind" },
        { text: "The early bird gets the interview.", author: "The Grind" },
        { text: "Start strong. End stronger.", author: "The Grind" },
    ],
    afternoon: [
        { text: "Halfway through the day. Keep the momentum going.", author: "The Grind" },
        { text: "Afternoon hustle hits different.", author: "The Grind" },
        { text: "The best time to apply was yesterday. The second best is now.", author: "The Grind" },
        { text: "Don't stop now. You're in the zone.", author: "The Grind" },
    ],
    evening: [
        { text: "End the day with one more application. Future you will thank you.", author: "The Grind" },
        { text: "Night owls find opportunities others miss.", author: "The Grind" },
        { text: "While they sleep, you grind.", author: "The Grind" },
        { text: "One more before bed. It's a habit.", author: "The Grind" },
    ],
    streak: [
        { text: "Your streak is on fire! Don't let it die.", author: "The Grind" },
        { text: "Consistency compounds. Keep the streak alive.", author: "The Grind" },
        { text: "Day {streak}. You're unstoppable.", author: "The Grind" },
        { text: "Streaks separate dreamers from achievers.", author: "The Grind" },
    ],
    noStreak: [
        { text: "Start your streak today. Day 1 begins now.", author: "The Grind" },
        { text: "Every streak starts with a single day.", author: "The Grind" },
        { text: "No streak yet? Perfect day to start one.", author: "The Grind" },
    ],
    highActivity: [
        { text: "You're absolutely crushing it! 🔥", author: "The Grind" },
        { text: "Machine mode activated. Impressive work!", author: "The Grind" },
        { text: "This is what commitment looks like.", author: "The Grind" },
    ],
    lowActivity: [
        { text: "Every application is a lottery ticket. Buy more tickets.", author: "The Grind" },
        { text: "Small steps daily beat big steps occasionally.", author: "The Grind" },
        { text: "One application is infinitely more than zero.", author: "The Grind" },
    ],
    rejection: [
        { text: "Rejection is redirection. Something better is waiting.", author: "The Grind" },
        { text: "Every 'no' brings you closer to 'yes'.", author: "The Grind" },
        { text: "They didn't reject you. They selected someone else. Keep moving.", author: "The Grind" },
        { text: "Rejection is a feature, not a bug. It's filtering.", author: "The Grind" },
        { text: "The best revenge is success. Keep grinding.", author: "The Grind" },
    ],
    famous: [
        { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison" },
        { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
        { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
    ],
};

function MotivationalQuote({ streakCount = 0, todayCount = 0, recentRejection = false }) {
    const [quote, setQuote] = useState(null);
    const [isVisible, setIsVisible] = useState(true);

    const getTimeCategory = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'morning';
        if (hour < 17) return 'afternoon';
        return 'evening';
    };

    const selectQuote = useMemo(() => {
        let pool = [];

        // Priority: Recent rejection gets rejection quotes
        if (recentRejection) {
            pool = [...QUOTES.rejection];
        }
        // High activity today (5+ applications)
        else if (todayCount >= 5) {
            pool = [...QUOTES.highActivity];
        }
        // Has a streak
        else if (streakCount >= 3) {
            pool = QUOTES.streak.map(q => ({
                ...q,
                text: q.text.replace('{streak}', streakCount)
            }));
        }
        // No streak
        else if (streakCount === 0) {
            pool = [...QUOTES.noStreak, ...QUOTES[getTimeCategory()]];
        }
        // Default: time-based + famous quotes
        else {
            pool = [...QUOTES[getTimeCategory()], ...QUOTES.famous];
        }

        // Pick random quote from pool
        return pool[Math.floor(Math.random() * pool.length)];
    }, [streakCount, todayCount, recentRejection]);

    useEffect(() => {
        setQuote(selectQuote);
    }, [selectQuote]);

    const refreshQuote = () => {
        setIsVisible(false);
        setTimeout(() => {
            const allQuotes = Object.values(QUOTES).flat();
            setQuote(allQuotes[Math.floor(Math.random() * allQuotes.length)]);
            setIsVisible(true);
        }, 300);
    };

    if (!quote) return null;

    return (
        <div className={`motivational-quote ${isVisible ? 'visible' : ''}`}>
            <div className="quote-content">
                <i className="fa-solid fa-quote-left quote-icon" />
                <p className="quote-text">{quote.text}</p>
                <span className="quote-author">— {quote.author}</span>
            </div>
            <button className="quote-refresh" onClick={refreshQuote} title="New quote">
                <i className="fa-solid fa-rotate" />
            </button>
        </div>
    );
}

export default MotivationalQuote;
