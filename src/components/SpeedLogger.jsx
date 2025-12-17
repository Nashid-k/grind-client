import React, { useState } from 'react';
import { useJobs } from '../context/JobContext';
import './SpeedLogger.css';

function SpeedLogger() {
    const { addJob } = useJobs();
    const [formData, setFormData] = useState({ company: '', role: '', link: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.company || !formData.role) return;

        addJob({
            ...formData,
            status: 'applied',
            date: new Date().toISOString().split('T')[0],
            portal: 'Direct', // Default to Direct for speed
            interviewDate: '',
            notes: '',
            jd: ''
        });

        // Clear only company/link, keep role potentially? No, clear all.
        setFormData({ company: '', role: '', link: '' });
    };

    return (
        <div className="speed-logger glass-panel">
            <div className="sl-header">
                <div className="sl-title">
                    <i className="fa-solid fa-bolt" />
                    <h3>Speed Logger</h3>
                </div>
                <span className="sl-desc">Rapidly log your applications</span>
            </div>

            <form onSubmit={handleSubmit} className="sl-form">
                <input
                    type="text"
                    placeholder="Company Name"
                    value={formData.company}
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                    className="sl-input"
                    required
                />
                <input
                    type="text"
                    placeholder="Job Role"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="sl-input"
                    required
                />
                <input
                    type="url"
                    placeholder="Link (Optional)"
                    value={formData.link}
                    onChange={e => setFormData({ ...formData, link: e.target.value })}
                    className="sl-input flex-grow"
                />
                <button type="submit" className="sl-btn">
                    <i className="fa-solid fa-paper-plane" /> Log
                </button>
            </form>
        </div>
    );
}

export default SpeedLogger;
