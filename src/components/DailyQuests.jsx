import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import { SIDE_QUESTS } from '../data/quests';

function DailyQuests() {
    const { user } = useAuth();
    const { addXP, questXP } = useJobs(); // Used addXP
    const [todaysQuests, setTodaysQuests] = useState([]);
    const [completedQuests, setCompletedQuests] = useState([]);

    const QUESTS_KEY = `daily_quests_v2_${user._id}`;
    const QUEST_ROTATION_DAYS = 30;

    useEffect(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const savedData = JSON.parse(localStorage.getItem(QUESTS_KEY));

        if (savedData && savedData.date === todayStr) {
            setTodaysQuests(savedData.quests);
            setCompletedQuests(savedData.completed);
        } else {
            // New Day: Deterministic Rotation based on date
            // Calculate Day Index based on Epoch or Day of Year to ensure global consistency for the user
            const todayDate = new Date();
            const startOfYear = new Date(todayDate.getFullYear(), 0, 0);
            const diff = todayDate - startOfYear;
            const oneDay = 1000 * 60 * 60 * 24;
            const dayOfYear = Math.floor(diff / oneDay);

            // Seedable rotation is tricky without a seed function, but we can just map dayOfYear to 3 indices.
            // Cycle through 30 days.
            const cycleDay = dayOfYear % QUEST_ROTATION_DAYS;

            // To ensure 3 unique quests per day that are "random-ish" but deterministic:
            // We can pick quests at indices: cycleDay, cycleDay + 30, cycleDay + 60 (if enough quests)
            // Or simpler: Splice the array based on the day.

            // Let's use a simple shifting window or just modulo math on the ID list
            // We have ~33 quests.
            // q1 = (cycleDay * 3) % totalQuests
            // q2 = (cycleDay * 3 + 1) % totalQuests
            // q3 = (cycleDay * 3 + 2) % totalQuests

            const totalQuests = SIDE_QUESTS.length;
            const idx1 = (cycleDay * 3) % totalQuests;
            const idx2 = (cycleDay * 3 + 1) % totalQuests;
            const idx3 = (cycleDay * 3 + 2) % totalQuests;

            const selected = [
                SIDE_QUESTS[idx1],
                SIDE_QUESTS[idx2],
                SIDE_QUESTS[idx3]
            ];

            const newData = {
                date: todayStr,
                quests: selected,
                completed: []
            };

            localStorage.setItem(QUESTS_KEY, JSON.stringify(newData));
            setTodaysQuests(selected);
            setCompletedQuests([]);
        }
    }, [user._id]);

    const toggleQuest = (questId, xp) => {
        if (completedQuests.includes(questId)) return; // Prevents un-checking for now to avoid XP farming abuse (simple logic)

        const newCompleted = [...completedQuests, questId];
        setCompletedQuests(newCompleted);

        // Add XP
        addXP(xp);

        // Update LocalStorage
        const today = new Date().toISOString().split('T')[0];
        const newData = {
            date: today,
            quests: todaysQuests,
            completed: newCompleted
        };
        localStorage.setItem(QUESTS_KEY, JSON.stringify(newData));
    };

    const isAllComplete = todaysQuests.length > 0 && completedQuests.length === todaysQuests.length;

    return (
        <div className="glass-panel animate-slide-left delay-400" style={{ padding: '1.5rem', marginBottom: '2rem', border: isAllComplete ? '2px solid #10b981' : '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <i className="fa-solid fa-scroll" style={{ color: '#fcd34d' }}></i>
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Daily Quests</h3>
                </div>
                {isAllComplete && (
                    <span className="animate-pop-in" style={{ fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 'bold' }}>
                        All Done!
                    </span>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {todaysQuests.map((quest) => {
                    const isDone = completedQuests.includes(quest.id);
                    return (
                        <div
                            key={quest.id}
                            onClick={() => !isDone && toggleQuest(quest.id, quest.xp)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '0.8rem',
                                background: isDone ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.03)',
                                borderRadius: '0.5rem',
                                cursor: isDone ? 'default' : 'pointer',
                                transition: 'all 0.2s',
                                border: isDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                                opacity: isDone ? 0.7 : 1
                            }}
                            className="quest-item"
                        >
                            <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '4px',
                                border: isDone ? 'none' : '2px solid var(--text-secondary)',
                                background: isDone ? '#10b981' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                {isDone && <i className="fa-solid fa-check" style={{ color: 'white', fontSize: '0.8rem' }}></i>}
                            </div>
                            <div style={{ flex: 1, textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'var(--text-secondary)' : 'white' }}>
                                {quest.text}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#fcd34d', fontWeight: 'bold' }}>
                                +{quest.xp} XP
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* XP Footer */}
            <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid var(--glass-border)', textAlign: 'right', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Total Quest XP: <span style={{ color: '#fcd34d', fontWeight: 'bold' }}>{questXP}</span>
            </div>
        </div>
    );
}

export default DailyQuests;
