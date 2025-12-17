import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JobProvider } from './context/JobContext';
import Loading from './components/Loading';

// Lazy Load Pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Welcome = lazy(() => import('./pages/Welcome'));
const Landing = lazy(() => import('./pages/Landing'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const GrindModeTimer = lazy(() => import('./components/GrindModeTimer'));

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <Loading />;
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
                <JobProvider>
                    <div className="app-fade-in">
                        <Suspense fallback={<Loading />}>
                            <Routes>
                                <Route path="/" element={<Landing />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/dashboard" element={
                                    <PrivateRoute>
                                        <Dashboard />
                                    </PrivateRoute>
                                } />
                                <Route path="/leaderboard" element={
                                    <PrivateRoute>
                                        <Leaderboard />
                                    </PrivateRoute>
                                } />
                                <Route path="/welcome" element={
                                    <PrivateRoute>
                                        <Welcome />
                                    </PrivateRoute>
                                } />
                            </Routes>
                            {/* Global Grind Mode Timer - Only show if logged in logic? 
                                Actually, checking user auth inside the component or just rendering it. 
                                It handles its own state. Ideally only show on protected routes.
                                For now, let's just render it, it will float there.
                            */}
                            <GrindModeTimer />
                        </Suspense>
                    </div>
                </JobProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
