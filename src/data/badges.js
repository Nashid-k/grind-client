export const BADGES = [
    // Starter Badges
    {
        id: 'FIRST_BLOOD',
        title: 'First Steps',
        description: 'Applied to your first job. Every journey begins with one step!',
        icon: 'fa-solid fa-flag-checkered',
        color: '#3b82f6', // Blue
        tier: 'bronze',
        xp: 25
    },
    {
        id: 'EARLY_BIRD',
        title: 'Early Bird',
        description: 'Applied before 9 AM. The early bird gets the worm!',
        icon: 'fa-solid fa-sun',
        color: '#fbbf24', // Yellow
        tier: 'bronze',
        xp: 25
    },
    {
        id: 'NIGHT_OWL',
        title: 'Night Owl',
        description: 'Applied after 10 PM. Dedication knows no hours!',
        icon: 'fa-solid fa-moon',
        color: '#8b5cf6', // Purple
        tier: 'bronze',
        xp: 25
    },
    
    // Consistency Badges
    {
        id: 'STREAK_WARRIOR',
        title: 'Streak Warrior',
        description: 'Maintained a 7-day streak. Consistency is key!',
        icon: 'fa-solid fa-fire-flame-curved',
        color: '#f97316', // Orange
        tier: 'silver',
        xp: 50
    },
    {
        id: 'WEEKEND_GRINDER',
        title: 'Weekend Warrior',
        description: 'Applied on a weekend. Extra dedication!',
        icon: 'fa-solid fa-mug-hot',
        color: '#ec4899', // Pink
        tier: 'bronze',
        xp: 25
    },
    
    // Volume Badges
    {
        id: 'CENTURION',
        title: 'Centurion',
        description: 'Reached 100 total applications. Unstoppable!',
        icon: 'fa-solid fa-hundred-points',
        color: '#22c55e', // Green
        tier: 'gold',
        xp: 100
    },
    {
        id: 'SPEED_DEMON',
        title: 'Speed Demon',
        description: 'Applied to 10 jobs in a single day. Lightning fast!',
        icon: 'fa-solid fa-bolt',
        color: '#eab308', // Yellow
        tier: 'silver',
        xp: 50
    },
    
    // Progress Badges
    {
        id: 'THE_CLOSER',
        title: 'The Closer',
        description: 'Landed your first interview. Making progress!',
        icon: 'fa-solid fa-handshake',
        color: '#22c55e', // Green
        tier: 'silver',
        xp: 50
    },
    {
        id: 'OFFER_MASTER',
        title: 'Offer Master',
        description: 'Received your first job offer. Success!',
        icon: 'fa-solid fa-trophy',
        color: '#fbbf24', // Gold
        tier: 'gold',
        xp: 100
    },
    
    // Resilience Badges
    {
        id: 'PHOENIX',
        title: 'Phoenix',
        description: 'Applied to 5 jobs after a rejection. Rising from the ashes!',
        icon: 'fa-solid fa-dove',
        color: '#f59e0b', // Amber
        tier: 'silver',
        xp: 50
    },
    {
        id: 'UNSTOPPABLE',
        title: 'Unstoppable',
        description: 'Applied to 50 jobs without giving up. True grit!',
        icon: 'fa-solid fa-shield-heart',
        color: '#ef4444', // Red
        tier: 'gold',
        xp: 75
    },
    
    // Special Badges
    {
        id: 'PERFECTIONIST',
        title: 'Perfectionist',
        description: 'Added notes and job description to 20 applications.',
        icon: 'fa-solid fa-star',
        color: '#a855f7', // Purple
        tier: 'silver',
        xp: 50
    }
];

// Helper function to get tier color
export const getTierColor = (tier) => {
    const colors = {
        bronze: 'linear-gradient(135deg, #cd7f32, #b8733c)',
        silver: 'linear-gradient(135deg, #c0c0c0, #a8a8a8)',
        gold: 'linear-gradient(135deg, #ffd700, #ffed4e)'
    };
    return colors[tier] || colors.bronze;
};
