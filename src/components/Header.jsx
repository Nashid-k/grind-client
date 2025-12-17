import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header({ onAdd }) {
    const { user, logout } = useAuth();

    // Time-based greeting
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    }, []);

    // Formatted current date
    const currentDate = useMemo(() => {
        const date = new Date();
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    }, []);

    // Get user initials for avatar
    const userInitials = useMemo(() => {
        if (!user?.name && !user?.username) return '?';
        const name = user.name || user.username;
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }, [user]);

    return (
        <header className="glass-header">
            <div className="logo-area">
                <i className="fa-solid fa-rocket logo-icon"></i>
                <h1>The <span className="highlight">Grind</span></h1>
                <div className="header-date">
                    <i className="fa-regular fa-calendar"></i>
                    <span>{currentDate}</span>
                </div>
            </div>

            <div className="actions-area">
                <div className="user-profile-section">
                    <div className="user-greeting">
                        <span className="greeting-text">{greeting},</span>
                        <span className="user-name">{user?.name || user?.username || 'User'}</span>
                    </div>
                    <div className="user-avatar">
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.name} />
                        ) : (
                            <span className="avatar-initials">{userInitials}</span>
                        )}
                    </div>
                </div>
                <Link to="/leaderboard" className="btn-secondary" title="Leaderboard">
                    <i className="fa-solid fa-trophy" style={{ color: '#fbbf24' }}></i>
                </Link>
                <button onClick={onAdd} className="btn-primary">
                    <i className="fa-solid fa-plus"></i> Add Job
                </button>
                <button onClick={logout} className="btn-logout" title="Logout">
                    <i className="fa-solid fa-right-from-bracket"></i>
                </button>
            </div>
        </header>
    );
}

export default Header;
