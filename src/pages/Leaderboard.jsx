import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import FriendsModal from '../components/FriendsModal';
import ChallengeModal from '../components/ChallengeModal';
import './Leaderboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Memoized player row for performance
const PlayerRow = memo(({ player, rank, isUser, animationDelay }) => (
    <div
        className={`player-row ${isUser ? 'is-you' : ''}`}
        style={{ animationDelay: `${animationDelay}ms` }}
    >
        <div className="player-rank">
            {rank <= 3 ? (
                <span className={`rank-medal rank-${rank}`}>
                    {rank === 1 && '🥇'}
                    {rank === 2 && '🥈'}
                    {rank === 3 && '🥉'}
                </span>
            ) : (
                <span className="rank-number">{rank}</span>
            )}
        </div>
        <div className="player-info">
            <div className="player-avatar">
                {player.avatar ? (
                    <img src={player.avatar} alt="" loading="lazy" />
                ) : (
                    <span>{player.name?.charAt(0).toUpperCase()}</span>
                )}
                {isUser && <div className="avatar-ring" />}
            </div>
            <div className="player-details">
                <span className="player-name">
                    {player.name}
                    {isUser && <span className="you-badge">YOU</span>}
                </span>
                <span className="player-stats">
                    <i className="fa-solid fa-fire" /> {player.streak || 0} streak
                </span>
            </div>
        </div>
        <div className="player-score">
            <span className="score-value">{player.score.toLocaleString()}</span>
            <span className="score-label">pts</span>
        </div>
    </div>
));

// Memoized podium card
const PodiumCard = memo(({ player, position, isUser }) => {
    const positionClass = position === 1 ? 'gold' : position === 2 ? 'silver' : 'bronze';
    const emoji = position === 1 ? '👑' : position === 2 ? '🥈' : '🥉';

    return (
        <div className={`podium-card ${positionClass} ${isUser ? 'is-you' : ''}`}>
            <div className="podium-crown">{emoji}</div>
            <div className="podium-position">#{position}</div>
            <div className="podium-avatar">
                {player.avatar ? (
                    <img src={player.avatar} alt="" loading="lazy" />
                ) : (
                    <span>{player.name?.charAt(0).toUpperCase()}</span>
                )}
            </div>
            <div className="podium-name">{player.name?.split(' ')[0]}</div>
            <div className="podium-score">{player.score.toLocaleString()}</div>
            {isUser && <div className="podium-you">You</div>}
            <div className="podium-glow" />
        </div>
    );
});

function Leaderboard() {
    const { user } = useAuth();
    const { jobs } = useJobs();
    const [activeTab, setActiveTab] = useState('global');
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFriendsModal, setShowFriendsModal] = useState(false);
    const [showChallengeModal, setShowChallengeModal] = useState(false);

    // Notification counts
    const [friendRequestCount, setFriendRequestCount] = useState(0);
    const [pendingChallengeCount, setPendingChallengeCount] = useState(0);

    // Fetch leaderboard data
    const fetchLeaderboard = useCallback(async () => {
        if (!user?._id) return;

        setLoading(true);
        try {
            const endpoint = activeTab === 'friends'
                ? `${API_URL}/api/leaderboard/friends/${user._id}`
                : `${API_URL}/api/leaderboard/global`;

            const res = await fetch(endpoint);
            const data = await res.json();

            if (data.success) {
                let processedRankings = data.leaderboard.map(player => ({
                    id: player._id,
                    name: player.name || 'Anonymous',
                    avatar: player.avatar,
                    score: player.score || 0,
                    streak: player.streak || 0,
                    isUser: player._id === user._id || player.isCurrentUser,
                }));

                // User requested to NOT show themselves in the friends list, only friends
                if (activeTab === 'friends') {
                    processedRankings = processedRankings.filter(p => !p.isUser);
                }

                setRankings(processedRankings);
            }
        } catch (error) {
            console.error('Leaderboard fetch error:', error);
            setRankings([]);
        }
        setLoading(false);
    }, [activeTab, user?._id]);

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    // Fetch notification counts (friend requests and pending challenges)
    const fetchNotificationCounts = useCallback(async () => {
        if (!user?._id) return;

        try {
            // Fetch friend requests
            const friendsRes = await fetch(`${API_URL}/api/friends/requests/${user._id}`);
            const friendsData = await friendsRes.json();
            if (friendsData.success) {
                setFriendRequestCount(friendsData.incoming?.length || 0);
            }

            // Fetch pending challenges
            const challengesRes = await fetch(`${API_URL}/api/challenges/user/${user._id}`);
            const challengesData = await challengesRes.json();
            if (challengesData.success) {
                // Count incoming pending challenges (where user is challenged)
                const pendingCount = challengesData.challenges?.filter(
                    c => c.status === 'pending' && c.challenged?.id === user._id
                ).length || 0;
                setPendingChallengeCount(pendingCount);
            }
        } catch (error) {
            console.error('Error fetching notification counts:', error);
        }
    }, [user?._id]);

    useEffect(() => {
        fetchNotificationCounts();
    }, [fetchNotificationCounts]);

    // Calculate user rank
    const userRank = useMemo(() => {
        const index = rankings.findIndex(p => p.isUser);
        return index >= 0 ? index + 1 : rankings.length + 1;
    }, [rankings]);

    // Split for podium and list
    const top3 = useMemo(() => rankings.slice(0, 3), [rankings]);
    const restOfList = useMemo(() => rankings.slice(3), [rankings]);

    const handleTabChange = useCallback((tab) => {
        setActiveTab(tab);
    }, []);

    return (
        <div className="leaderboard">
            {/* Animated Background */}
            <div className="lb-bg">
                <div className="lb-bg-orb lb-bg-orb-1" />
                <div className="lb-bg-orb lb-bg-orb-2" />
                <div className="lb-bg-orb lb-bg-orb-3" />
            </div>

            <div className="lb-content">
                {/* Navigation */}
                <Link to="/dashboard" className="lb-back">
                    <i className="fa-solid fa-arrow-left" />
                    <span>Dashboard</span>
                </Link>

                {/* Hero */}
                <header className="lb-hero">
                    <div className="lb-hero-icon">
                        <i className="fa-solid fa-trophy" />
                    </div>
                    <h1 className="lb-hero-title">Leaderboard</h1>
                    <p className="lb-hero-subtitle">
                        Your Rank: <strong>#{userRank}</strong>
                    </p>
                </header>

                {/* Tab Switcher */}
                <div className="lb-tabs">
                    <button
                        className={`lb-tab ${activeTab === 'global' ? 'active' : ''}`}
                        onClick={() => handleTabChange('global')}
                    >
                        <i className="fa-solid fa-globe" />
                        Global
                    </button>
                    <button
                        className={`lb-tab ${activeTab === 'friends' ? 'active' : ''}`}
                        onClick={() => handleTabChange('friends')}
                    >
                        <i className="fa-solid fa-user-group" />
                        Friends
                        {friendRequestCount > 0 && (
                            <span className="lb-notification-badge">{friendRequestCount}</span>
                        )}
                    </button>
                    <button
                        className="lb-tab lb-tab-challenge"
                        onClick={() => setShowChallengeModal(true)}
                    >
                        <i className="fa-solid fa-bolt" />
                        Challenge
                        {pendingChallengeCount > 0 && (
                            <span className="lb-notification-badge pulse">{pendingChallengeCount}</span>
                        )}
                    </button>
                    <button
                        className="lb-tab lb-tab-add"
                        onClick={() => setShowFriendsModal(true)}
                    >
                        <i className="fa-solid fa-user-plus" />
                        Add
                    </button>
                </div>

                {/* Main Content */}
                {loading ? (
                    <div className="lb-loader">
                        <div className="loader-spinner" />
                        <span>Loading rankings...</span>
                    </div>
                ) : rankings.length === 0 ? (
                    <div className="lb-empty">
                        <div className="empty-icon">
                            <i className="fa-solid fa-users-slash" />
                        </div>
                        <h3>No Rankings Yet</h3>
                        <p>{activeTab === 'friends'
                            ? 'Add friends to see them here!'
                            : 'Be the first to climb the ranks!'}
                        </p>
                        {activeTab === 'friends' && (
                            <button
                                className="empty-btn"
                                onClick={() => setShowFriendsModal(true)}
                            >
                                <i className="fa-solid fa-user-plus" />
                                Add Friends
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Podium */}
                        {top3.length >= 3 && (
                            <div className="lb-podium">
                                <PodiumCard
                                    player={top3[1]}
                                    position={2}
                                    isUser={top3[1].isUser}
                                />
                                <PodiumCard
                                    player={top3[0]}
                                    position={1}
                                    isUser={top3[0].isUser}
                                />
                                <PodiumCard
                                    player={top3[2]}
                                    position={3}
                                    isUser={top3[2].isUser}
                                />
                            </div>
                        )}

                        {/* Rankings List */}
                        {restOfList.length > 0 && (
                            <div className="lb-list">
                                <div className="lb-list-header">
                                    <span>Rank</span>
                                    <span>Player</span>
                                    <span>Score</span>
                                </div>
                                <div className="lb-list-body">
                                    {restOfList.map((player, index) => (
                                        <PlayerRow
                                            key={player.id}
                                            player={player}
                                            rank={index + 4}
                                            isUser={player.isUser}
                                            animationDelay={index * 50}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Less than 3 players - show as list */}
                        {top3.length < 3 && top3.length > 0 && (
                            <div className="lb-list">
                                <div className="lb-list-body">
                                    {rankings.map((player, index) => (
                                        <PlayerRow
                                            key={player.id}
                                            player={player}
                                            rank={index + 1}
                                            isUser={player.isUser}
                                            animationDelay={index * 50}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Friends Modal */}
            {showFriendsModal && (
                <FriendsModal
                    isOpen={showFriendsModal}
                    onClose={() => {
                        setShowFriendsModal(false);
                        fetchNotificationCounts(); // Refresh counts after closing
                    }}
                />
            )}

            {/* Challenge Modal */}
            {showChallengeModal && (
                <ChallengeModal
                    isOpen={showChallengeModal}
                    onClose={() => {
                        setShowChallengeModal(false);
                        fetchNotificationCounts(); // Refresh counts after closing
                    }}
                />
            )}
        </div>
    );
}

export default memo(Leaderboard);
