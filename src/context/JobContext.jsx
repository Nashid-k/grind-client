import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { BADGES } from '../data/badges';

const JobContext = createContext();

export const useJobs = () => useContext(JobContext);

const API_URL = '/api/jobs';

export const JobProvider = ({ children }) => {
    const { user, updateUser } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [unlockedBadges, setUnlockedBadges] = useState([]);
    const [newBadge, setNewBadge] = useState(null);
    const [questXP, setQuestXP] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [dailyTarget, setDailyTarget] = useState(10); // Default 10

    // Fetch Data on Load
    useEffect(() => {
        if (user && user._id) {
            setIsLoading(true);
            // Load Settings
            const savedTarget = localStorage.getItem(`dailyTarget_${user._id}`);
            if (savedTarget) setDailyTarget(parseInt(savedTarget));
            else if (user.settings?.dailyTarget) setDailyTarget(user.settings.dailyTarget);

            fetch(`${API_URL}/${user._id}`)
                .then(res => res.json())
                .then(data => {
                    setJobs(data);
                    // Check achievements on initial load
                    checkAchievementsOnLoad(data, user.badges || []);
                })
                .catch(err => console.error("Error fetching jobs", err))
                .finally(() => setIsLoading(false));

            setQuestXP(user.xp || 0);
            setUnlockedBadges(user.badges || []);
        } else {
            setJobs([]);
            setQuestXP(0);
            setUnlockedBadges([]);
            setDailyTarget(10);
        }
    }, [user?._id]); // Only depend on user ID

    // Helper to sync stats with backend
    const updateUserStats = useCallback(async (updates) => {
        if (!user || !user._id) return;
        try {
            await fetch(`${API_URL}/stats/${user._id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            // Also sync with AuthContext
            if (updateUser) {
                updateUser(updates);
            }
        } catch (e) {
            console.error("Failed to sync stats", e);
        }
    }, [user?._id, updateUser]);

    // Add XP
    const addXP = useCallback((amount) => {
        setQuestXP(prev => {
            const newXP = prev + amount;
            updateUserStats({ xp: newXP });
            return newXP;
        });
    }, [updateUserStats]);

    // Subtract XP
    const subtractXP = useCallback((amount) => {
        setQuestXP(prev => {
            const newXP = Math.max(0, prev - amount);
            updateUserStats({ xp: newXP });
            return newXP;
        });
    }, [updateUserStats]);

    // Helper to calculate badges
    const calculateNewBadges = useCallback((currentJobs, existingBadges) => {
        const achieved = new Set(existingBadges);
        let newlyUnlocked = null;

        // Badge Logic Definitions
        const checks = [
            {
                id: 'FIRST_BLOOD',
                condition: () => currentJobs.length > 0
            },
            {
                id: 'WEEKEND_GRINDER',
                condition: () => currentJobs.some(job => {
                    const day = new Date(job.date).getDay();
                    return day === 0 || day === 6;
                })
            },
            {
                id: 'GHOSTBUSTER',
                condition: () => currentJobs.some(job => job.status === 'rejected')
            },
            {
                id: 'THE_CLOSER',
                condition: () => currentJobs.some(job => ['interview_completed', 'interview_scheduled'].includes(job.status))
            },
            {
                id: 'STREAK_WARRIOR',
                condition: () => {
                    if (!user?._id) return false;
                    const streakData = JSON.parse(localStorage.getItem(`streak_${user._id}`)) || { count: 0 };
                    return streakData.count >= 3;
                }
            }
        ];

        // Run checks
        checks.forEach(check => {
            if (!achieved.has(check.id) && check.condition()) {
                achieved.add(check.id);
                // Only set popup for the first new one found
                if (!newlyUnlocked) newlyUnlocked = BADGES.find(b => b.id === check.id);
            }
        });

        const newBadgeList = Array.from(achieved);
        const hasChanges = newBadgeList.length > existingBadges.length;

        return { newBadgeList, newlyUnlocked, hasChanges };
    }, [user?._id]);

    // Check achievements on initial load (silent)
    const checkAchievementsOnLoad = useCallback((currentJobs, existingBadges) => {
        const { newBadgeList, hasChanges } = calculateNewBadges(currentJobs, existingBadges);

        if (hasChanges) {
            setUnlockedBadges(newBadgeList);
            updateUserStats({ badges: newBadgeList });
        }
    }, [calculateNewBadges, updateUserStats]);

    // Check achievements (with popup)
    const checkAchievements = useCallback((currentJobs) => {
        setUnlockedBadges(prevBadges => {
            const { newBadgeList, newlyUnlocked, hasChanges } = calculateNewBadges(currentJobs, prevBadges);

            if (hasChanges) {
                updateUserStats({ badges: newBadgeList });

                if (newlyUnlocked) {
                    setNewBadge(newlyUnlocked);
                    addXP(25);
                }
                return newBadgeList;
            }
            return prevBadges;
        });
    }, [calculateNewBadges, updateUserStats, addXP]);

    const addJob = useCallback(async (job) => {
        if (!user || !user._id) return;

        try {
            const res = await fetch(`${API_URL}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...job, userId: user._id })
            });
            const savedJob = await res.json();

            setJobs(prev => {
                const updated = [...prev, savedJob];
                // Check achievements after state update
                setTimeout(() => checkAchievements(updated), 0);
                return updated;
            });

            addXP(10);
        } catch (e) {
            console.error(e);
        }
    }, [user?._id, checkAchievements, addXP]);

    const deleteJob = useCallback(async (id) => {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            setJobs(prev => prev.filter(job => job._id !== id));
            subtractXP(10);
        } catch (e) { console.error(e); }
    }, [subtractXP]);

    const updateJob = useCallback(async (id, data) => {
        if (!user || !user._id) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error('Failed to update job');
            const updatedJob = await res.json();

            setJobs(prev => {
                const updatedList = prev.map(job => job._id === id ? updatedJob : job);
                setTimeout(() => checkAchievements(updatedList), 0);
                return updatedList;
            });
        } catch (e) {
            console.error("Error updating job:", e);
        }
    }, [user?._id, checkAchievements]);

    const clearNewBadge = useCallback(() => setNewBadge(null), []);

    // Update Daily Target Wrapper
    const updateDailyTarget = useCallback((newTarget) => {
        setDailyTarget(newTarget);
        if (user?._id) {
            localStorage.setItem(`dailyTarget_${user._id}`, newTarget.toString());
            updateUserStats({ settings: { dailyTarget: newTarget } });
        }
    }, [user?._id, updateUserStats]);

    // Memoized context value to prevent unnecessary rerenders
    const value = useMemo(() => ({
        jobs,
        addJob,
        deleteJob,
        updateJob,
        unlockedBadges,
        newBadge,
        clearNewBadge,
        questXP,
        addXP,
        subtractXP,
        isLoading,
        dailyTarget,
        updateDailyTarget
    }), [jobs, addJob, deleteJob, updateJob, unlockedBadges, newBadge, clearNewBadge, questXP, addXP, subtractXP, isLoading, dailyTarget, updateDailyTarget]);

    return (
        <JobContext.Provider value={value}>
            {children}
        </JobContext.Provider>
    );
};
