import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './FriendsModal.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function FriendsModal({ isOpen, onClose }) {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('add');
    const [friendCode, setFriendCode] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [friends, setFriends] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [outgoingRequests, setOutgoingRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Fetch user's friend code
    useEffect(() => {
        if (isOpen && user?._id) {
            fetchFriendCode();
            fetchFriends();
            fetchRequests();
        }
    }, [isOpen, user]);

    const fetchFriendCode = async () => {
        try {
            const res = await fetch(`${API_URL}/api/friends/code/${user._id}`);
            const data = await res.json();
            if (data.success) {
                setFriendCode(data.friendCode);
            }
        } catch (error) {
            console.error('Error fetching friend code:', error);
        }
    };

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

    const fetchRequests = async () => {
        try {
            const res = await fetch(`${API_URL}/api/friends/requests/${user._id}`);
            const data = await res.json();
            if (data.success) {
                setIncomingRequests(data.incoming || []);
                setOutgoingRequests(data.outgoing || []);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
        }
    };

    const handleSendRequest = async (e) => {
        e.preventDefault();
        if (!searchInput.trim()) return;

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch(`${API_URL}/api/friends/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user._id,
                    identifier: searchInput.trim()
                })
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ type: 'success', text: data.message });
                setSearchInput('');
                fetchFriends();
                fetchRequests();
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to send request' });
        }
        setLoading(false);
    };

    const handleAcceptRequest = async (requesterId) => {
        try {
            const res = await fetch(`${API_URL}/api/friends/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id, requesterId })
            });
            const data = await res.json();

            if (data.success) {
                fetchFriends();
                fetchRequests();
                setMessage({ type: 'success', text: 'Friend added!' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to accept request' });
        }
    };

    const handleRejectRequest = async (requesterId) => {
        try {
            const res = await fetch(`${API_URL}/api/friends/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id, requesterId })
            });
            const data = await res.json();

            if (data.success) {
                fetchRequests();
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to reject request' });
        }
    };

    const handleRemoveFriend = async (friendId) => {
        if (!window.confirm('Are you sure you want to remove this friend?')) return;

        try {
            const res = await fetch(`${API_URL}/api/friends/${user._id}/${friendId}`, {
                method: 'DELETE'
            });
            const data = await res.json();

            if (data.success) {
                fetchFriends();
                setMessage({ type: 'success', text: 'Friend removed' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to remove friend' });
        }
    };

    const copyFriendCode = () => {
        navigator.clipboard.writeText(friendCode);
        setMessage({ type: 'success', text: 'Friend code copied!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="friends-modal-overlay" onClick={onClose}>
            <div className="friends-modal" onClick={(e) => e.stopPropagation()}>
                <button className="friends-modal-close" onClick={onClose}>
                    <i className="fa-solid fa-xmark" />
                </button>

                <div className="friends-modal-header">
                    <h2><i className="fa-solid fa-user-group" /> Friends</h2>
                    <div className="friend-code-display">
                        <span className="friend-code-label">Your Code:</span>
                        <span className="friend-code-value">{friendCode}</span>
                        <button className="friend-code-copy" onClick={copyFriendCode} title="Copy">
                            <i className="fa-solid fa-copy" />
                        </button>
                    </div>
                </div>

                {message.text && (
                    <div className={`friends-message ${message.type}`}>
                        <i className={`fa-solid ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`} />
                        {message.text}
                    </div>
                )}

                <div className="friends-tabs">
                    <button
                        className={`friends-tab ${activeTab === 'add' ? 'active' : ''}`}
                        onClick={() => setActiveTab('add')}
                    >
                        <i className="fa-solid fa-user-plus" /> Add Friend
                    </button>
                    <button
                        className={`friends-tab ${activeTab === 'requests' ? 'active' : ''}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        <i className="fa-solid fa-inbox" /> Requests
                        {incomingRequests.length > 0 && (
                            <span className="request-badge">{incomingRequests.length}</span>
                        )}
                    </button>
                    <button
                        className={`friends-tab ${activeTab === 'friends' ? 'active' : ''}`}
                        onClick={() => setActiveTab('friends')}
                    >
                        <i className="fa-solid fa-users" /> My Friends
                        <span className="friend-count">({friends.length})</span>
                    </button>
                </div>

                <div className="friends-content">
                    {activeTab === 'add' && (
                        <div className="add-friend-section">
                            <p className="add-friend-info">
                                Add friends using their friend code or email address.
                            </p>
                            <form onSubmit={handleSendRequest} className="add-friend-form">
                                <input
                                    type="text"
                                    placeholder="Enter friend code or email..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="add-friend-input"
                                />
                                <button type="submit" className="add-friend-btn" disabled={loading}>
                                    {loading ? (
                                        <i className="fa-solid fa-spinner fa-spin" />
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-paper-plane" /> Send
                                        </>
                                    )}
                                </button>
                            </form>
                            <div className="share-code-section">
                                <p>Share your code with friends:</p>
                                <div className="share-code-box">
                                    <span className="share-code">{friendCode}</span>
                                    <button onClick={copyFriendCode} className="share-copy-btn">
                                        <i className="fa-solid fa-copy" /> Copy
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'requests' && (
                        <div className="requests-section">
                            <h3>Incoming Requests</h3>
                            {incomingRequests.length === 0 ? (
                                <p className="empty-state">No pending requests</p>
                            ) : (
                                <div className="requests-list">
                                    {incomingRequests.map((req) => (
                                        <div key={req._id} className="request-card">
                                            <div className="request-avatar">
                                                {req.avatar ? (
                                                    <img src={req.avatar} alt="" />
                                                ) : (
                                                    <span>{req.name?.charAt(0) || '?'}</span>
                                                )}
                                            </div>
                                            <div className="request-info">
                                                <span className="request-name">{req.name}</span>
                                                <span className="request-code">{req.friendCode}</span>
                                            </div>
                                            <div className="request-actions">
                                                <button
                                                    className="accept-btn"
                                                    onClick={() => handleAcceptRequest(req._id)}
                                                >
                                                    <i className="fa-solid fa-check" />
                                                </button>
                                                <button
                                                    className="reject-btn"
                                                    onClick={() => handleRejectRequest(req._id)}
                                                >
                                                    <i className="fa-solid fa-xmark" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <h3 style={{ marginTop: '1.5rem' }}>Sent Requests</h3>
                            {outgoingRequests.length === 0 ? (
                                <p className="empty-state">No pending sent requests</p>
                            ) : (
                                <div className="requests-list">
                                    {outgoingRequests.map((req) => (
                                        <div key={req._id} className="request-card pending">
                                            <div className="request-avatar">
                                                {req.avatar ? (
                                                    <img src={req.avatar} alt="" />
                                                ) : (
                                                    <span>{req.name?.charAt(0) || '?'}</span>
                                                )}
                                            </div>
                                            <div className="request-info">
                                                <span className="request-name">{req.name}</span>
                                                <span className="request-status">Pending...</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'friends' && (
                        <div className="friends-list-section">
                            {friends.length === 0 ? (
                                <div className="empty-friends">
                                    <i className="fa-solid fa-user-group" />
                                    <p>No friends yet</p>
                                    <span>Add friends to compete on the leaderboard!</span>
                                </div>
                            ) : (
                                <div className="friends-list">
                                    {friends.map((friend) => (
                                        <div key={friend._id} className="friend-card">
                                            <div className="friend-avatar">
                                                {friend.avatar ? (
                                                    <img src={friend.avatar} alt="" />
                                                ) : (
                                                    <span>{friend.name?.charAt(0) || '?'}</span>
                                                )}
                                            </div>
                                            <div className="friend-info">
                                                <span className="friend-name">{friend.name}</span>
                                                <span className="friend-stats">
                                                    <i className="fa-solid fa-star" /> {friend.xp || 0} XP
                                                    {friend.streak?.count > 0 && (
                                                        <>
                                                            <span className="stat-separator">•</span>
                                                            <i className="fa-solid fa-fire" /> {friend.streak.count}d
                                                        </>
                                                    )}
                                                </span>
                                            </div>
                                            <button
                                                className="remove-friend-btn"
                                                onClick={() => handleRemoveFriend(friend._id)}
                                                title="Remove friend"
                                            >
                                                <i className="fa-solid fa-user-minus" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FriendsModal;
