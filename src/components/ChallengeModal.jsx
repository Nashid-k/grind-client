import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './ChallengeModal.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function ChallengeModal({ isOpen, onClose }) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('create');
    const [friends, setFriends] = useState([]);
    const [challenges, setChallenges] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [duration, setDuration] = useState(7);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (isOpen && user?._id) {
            fetchFriends();
            fetchChallenges();
        }
    }, [isOpen, user]);

    const fetchFriends = async () => {
        try {
            const res = await fetch(`${API_URL}/api/friends/${user._id}`);
            const data = await res.json();
            if (data.success) {
                setFriends(data.friends || []);
            }
        } catch (error) {
            console.error('Error fetching friends:', error);
        }
    };

    const fetchChallenges = async () => {
        try {
            const res = await fetch(`${API_URL}/api/challenges/user/${user._id}`);
            const data = await res.json();
            if (data.success) {
                setChallenges(data.challenges || []);
            }
        } catch (error) {
            console.error('Error fetching challenges:', error);
        }
    };

    const handleCreateChallenge = async () => {
        if (!selectedFriend) {
            setMessage({ type: 'error', text: 'Select a friend to challenge' });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/challenges/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    challengerId: user._id,
                    challengedId: selectedFriend._id,
                    duration
                })
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Challenge sent!' });
                setSelectedFriend(null);
                fetchChallenges();
                setActiveTab('active');
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to create challenge' });
        }
        setLoading(false);
    };

    const handleAccept = async (challengeId) => {
        try {
            const res = await fetch(`${API_URL}/api/challenges/accept/${challengeId}`, {
                method: 'POST'
            });
            const data = await res.json();
            if (data.success) {
                fetchChallenges();
            }
        } catch (error) {
            console.error('Error accepting challenge:', error);
        }
    };

    const handleReject = async (challengeId) => {
        try {
            const res = await fetch(`${API_URL}/api/challenges/reject/${challengeId}`, {
                method: 'POST'
            });
            const data = await res.json();
            if (data.success) {
                fetchChallenges();
            }
        } catch (error) {
            console.error('Error rejecting challenge:', error);
        }
    };

    const getTimeRemaining = (endDate) => {
        const end = new Date(endDate);
        const now = new Date();
        const diff = end - now;

        if (diff <= 0) return 'Ended';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days}d ${hours}h left`;
        return `${hours}h left`;
    };

    if (!isOpen) return null;

    const pendingChallenges = challenges.filter(c =>
        c.status === 'pending' && c.challenged.id === user._id
    );
    const activeChallenges = challenges.filter(c => c.status === 'active');
    const completedChallenges = challenges.filter(c => c.status === 'completed');

    return (
        <div className="challenge-overlay" onClick={onClose}>
            <div className="challenge-modal" onClick={(e) => e.stopPropagation()}>
                <button className="challenge-close" onClick={onClose}>
                    <i className="fa-solid fa-xmark" />
                </button>

                <div className="challenge-header">
                    <div className="challenge-icon">
                        <i className="fa-solid fa-swords" />
                    </div>
                    <h2>Challenge a Friend</h2>
                    <p>Head-to-head application battles!</p>
                </div>

                {message.text && (
                    <div className={`challenge-message ${message.type}`}>
                        <i className={`fa-solid ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`} />
                        {message.text}
                    </div>
                )}

                <div className="challenge-tabs">
                    <button
                        className={`challenge-tab ${activeTab === 'create' ? 'active' : ''}`}
                        onClick={() => setActiveTab('create')}
                    >
                        <i className="fa-solid fa-plus" /> New
                    </button>
                    <button
                        className={`challenge-tab ${activeTab === 'active' ? 'active' : ''}`}
                        onClick={() => setActiveTab('active')}
                    >
                        <i className="fa-solid fa-fire" /> Active
                        {activeChallenges.length > 0 && (
                            <span className="tab-badge">{activeChallenges.length}</span>
                        )}
                    </button>
                    <button
                        className={`challenge-tab ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        <i className="fa-solid fa-inbox" /> Pending
                        {pendingChallenges.length > 0 && (
                            <span className="tab-badge">{pendingChallenges.length}</span>
                        )}
                    </button>
                </div>

                <div className="challenge-content">
                    {activeTab === 'create' && (
                        <div className="create-challenge">
                            <h3>Select Opponent</h3>
                            {friends.length === 0 ? (
                                <p className="no-friends">Add friends first to challenge them!</p>
                            ) : (
                                <div className="friend-select">
                                    {friends.map(friend => (
                                        <div
                                            key={friend._id}
                                            className={`friend-option ${selectedFriend?._id === friend._id ? 'selected' : ''}`}
                                            onClick={() => setSelectedFriend(friend)}
                                        >
                                            <div className="friend-avatar">
                                                {friend.avatar ? (
                                                    <img src={friend.avatar} alt="" />
                                                ) : (
                                                    <span>{friend.name?.charAt(0)}</span>
                                                )}
                                            </div>
                                            <span className="friend-name">{friend.name}</span>
                                            {selectedFriend?._id === friend._id && (
                                                <i className="fa-solid fa-check selected-check" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <h3>Challenge Duration</h3>
                            <div className="duration-select">
                                {[3, 7, 14].map(d => (
                                    <button
                                        key={d}
                                        className={`duration-btn ${duration === d ? 'active' : ''}`}
                                        onClick={() => setDuration(d)}
                                    >
                                        {d} days
                                    </button>
                                ))}
                            </div>

                            <button
                                className="create-btn"
                                onClick={handleCreateChallenge}
                                disabled={loading || !selectedFriend}
                            >
                                {loading ? (
                                    <i className="fa-solid fa-spinner fa-spin" />
                                ) : (
                                    <>
                                        <i className="fa-solid fa-bolt" /> Send Challenge
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {activeTab === 'active' && (
                        <div className="active-challenges">
                            {activeChallenges.length === 0 ? (
                                <p className="no-challenges">No active challenges. Start one!</p>
                            ) : (
                                activeChallenges.map(challenge => {
                                    const isChallenger = challenge.challenger.id === user._id;
                                    const you = isChallenger ? challenge.challenger : challenge.challenged;
                                    const opponent = isChallenger ? challenge.challenged : challenge.challenger;
                                    const winning = you.score > opponent.score;

                                    return (
                                        <div key={challenge.id} className="challenge-card active">
                                            <div className="challenge-timer">
                                                <i className="fa-solid fa-clock" />
                                                {getTimeRemaining(challenge.endDate)}
                                            </div>
                                            <div className="challenge-battle">
                                                <div className={`battle-player ${winning ? 'winning' : ''}`}>
                                                    <div className="player-avatar">
                                                        {you.avatar ? <img src={you.avatar} alt="" /> : you.name?.charAt(0)}
                                                    </div>
                                                    <span className="player-name">You</span>
                                                    <span className="player-score">{you.score}</span>
                                                </div>
                                                <div className="battle-vs">VS</div>
                                                <div className={`battle-player ${!winning && you.score !== opponent.score ? 'winning' : ''}`}>
                                                    <div className="player-avatar">
                                                        {opponent.avatar ? <img src={opponent.avatar} alt="" /> : opponent.name?.charAt(0)}
                                                    </div>
                                                    <span className="player-name">{opponent.name?.split(' ')[0]}</span>
                                                    <span className="player-score">{opponent.score}</span>
                                                </div>
                                            </div>
                                            <div className="challenge-progress">
                                                <div
                                                    className="progress-you"
                                                    style={{ width: `${you.score + opponent.score > 0 ? (you.score / (you.score + opponent.score)) * 100 : 50}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {activeTab === 'pending' && (
                        <div className="pending-challenges">
                            {pendingChallenges.length === 0 ? (
                                <p className="no-challenges">No pending challenges</p>
                            ) : (
                                pendingChallenges.map(challenge => (
                                    <div key={challenge.id} className="challenge-card pending">
                                        <div className="pending-info">
                                            <div className="challenger-avatar">
                                                {challenge.challenger.avatar ? (
                                                    <img src={challenge.challenger.avatar} alt="" />
                                                ) : (
                                                    challenge.challenger.name?.charAt(0)
                                                )}
                                            </div>
                                            <div className="pending-text">
                                                <strong>{challenge.challenger.name}</strong> challenged you!
                                                <span className="pending-duration">{challenge.duration} day battle</span>
                                            </div>
                                        </div>
                                        <div className="pending-actions">
                                            <button className="accept-btn" onClick={() => handleAccept(challenge.id)}>
                                                <i className="fa-solid fa-check" /> Accept
                                            </button>
                                            <button className="reject-btn" onClick={() => handleReject(challenge.id)}>
                                                <i className="fa-solid fa-xmark" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ChallengeModal;
