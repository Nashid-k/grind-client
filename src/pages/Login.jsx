import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import './Login.css';

function Login() {
    const [error, setError] = useState('');
    const { googleLogin, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            // Show welcome page for first-time users (hasSeenWelcome is false or undefined)
            if (!user.hasSeenWelcome) {
                navigate('/welcome', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        }
    }, [user, navigate]);

    return (
        <div className="login-container">
            {/* Animated Background Accent */}
            <div className="login-bg-accent"></div>

            {/* Main Login Card */}
            <div className="login-card">
                {/* Hero Icon - Animated Rocket */}
                <div className="login-icon-wrapper">
                    <i className="fa-solid fa-rocket"></i>
                </div>

                {/* Branding & Title */}
                <h1 className="login-title">
                    The <span className="highlight">Grind</span>
                </h1>

                {/* Subtitle */}
                <p className="login-subtitle">
                    Track Applications. Conquer Goals.
                </p>

                {/* Divider */}
                <div className="login-divider"></div>

                {/* Error Display */}
                {error && (
                    <div className="login-error">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                )}

                {/* Google Sign In Section */}
                <div style={{ width: '100%', marginBottom: '1.5rem' }}>
                    <p className="login-label">
                        Sign in to continue
                    </p>

                    {/* Google Login Button Wrapper */}
                    <div className="google-btn-wrapper">
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                const res = await googleLogin(credentialResponse);
                                if (!res.success) {
                                    setError(res.message);
                                }
                            }}
                            onError={() => setError('Authentication failed. Please try again.')}
                            theme="filled_black"
                            shape="pill"
                            text="continue_with"
                            size="large"
                            width="280"
                        />
                    </div>
                </div>

                {/* Info Badge */}
                <div className="security-badge">
                    <i className="fa-solid fa-shield-halved"></i>
                    <span>Secure authentication powered by Google</span>
                </div>

                {/* Footer */}
                <div className="login-footer">
                    <p>
                        Secure Access v2.0 • Grind System
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
