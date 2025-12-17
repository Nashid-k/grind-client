import React, { useState, useEffect } from 'react';
import { useJobs } from '../context/JobContext';
import './JobModal.css';

function JobModal({ isOpen, onClose, editingJob }) {
    const { addJob, updateJob } = useJobs();
    const [formData, setFormData] = useState({
        company: '', role: '', status: 'applied', date: new Date().toISOString().split('T')[0],
        portal: '', link: '', jd: '', notes: '', interviewDate: ''
    });

    useEffect(() => {
        if (editingJob) {
            setFormData(editingJob);
        } else {
            setFormData({
                company: '', role: '', status: 'applied', date: new Date().toISOString().split('T')[0],
                portal: '', link: '', jd: '', notes: '', interviewDate: ''
            });
        }
    }, [editingJob]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingJob) {
            updateJob(editingJob._id, formData);
        } else {
            addJob(formData);
        }
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel">
                <div className="modal-header">
                    <h2>
                        <i className={`fa-solid ${editingJob ? 'fa-pen-to-square' : 'fa-plus-circle'}`}></i>
                        {editingJob ? 'Edit Application' : 'New Application'}
                    </h2>
                    <button onClick={onClose} className="close-btn"><i className="fa-solid fa-xmark"></i></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label><i className="fa-solid fa-building"></i> Company</label>
                            <input type="text" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} required placeholder="e.g. Google" />
                        </div>

                        <div className="form-group">
                            <label><i className="fa-solid fa-briefcase"></i> Role</label>
                            <input type="text" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required placeholder="e.g. Frontend Engineer" />
                        </div>

                        <div className="form-group">
                            <label><i className="fa-solid fa-list-check"></i> Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                <option value="applied">Applied</option>
                                <option value="shortlisted">Shortlisted</option>
                                <option value="interview_scheduled">Interview Scheduled</option>
                                <option value="interview_completed">Interview Completed</option>
                                <option value="offer_received">Offer Received</option>
                                <option value="rejected">Rejected</option>
                                <option value="on_hold">On Hold</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label><i className="fa-regular fa-calendar"></i> Date</label>
                            <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
                        </div>
                    </div>

                    {(formData.status === 'interview_scheduled' || formData.status === 'interview_completed') && (
                        <div className="form-group highlight-group">
                            <label><i className="fa-solid fa-clock"></i> Interview Details</label>
                            <div className="interview-meta-grid">
                                <input
                                    type="datetime-local"
                                    value={formData.interviewDate}
                                    onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
                                    title="Date & Time"
                                />
                                <select
                                    value={formData.interviewRound || ''}
                                    onChange={(e) => setFormData({ ...formData, interviewRound: e.target.value })}
                                    title="Round"
                                >
                                    <option value="">Select Round...</option>
                                    <option value="HR">HR Screen</option>
                                    <option value="Technical">Technical</option>
                                    <option value="Managerial">Managerial</option>
                                    <option value="Final">Final</option>
                                </select>
                                <select
                                    value={formData.interviewMode || ''}
                                    onChange={(e) => setFormData({ ...formData, interviewMode: e.target.value })}
                                    title="Mode"
                                >
                                    <option value="">Select Mode...</option>
                                    <option value="Online">Online</option>
                                    <option value="Onsite">Onsite</option>
                                    <option value="Phone">Phone</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="form-grid">
                        <div className="form-group">
                            <label><i className="fa-solid fa-earth-americas"></i> Portal</label>
                            <input type="text" value={formData.portal} onChange={(e) => setFormData({ ...formData, portal: e.target.value })} placeholder="e.g. LinkedIn" />
                        </div>
                        <div className="form-group">
                            <label><i className="fa-solid fa-link"></i> Link</label>
                            <input type="url" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} placeholder="https://..." />
                        </div>
                    </div>

                    <div className="form-group">
                        <label><i className="fa-solid fa-align-left"></i> Job Description / Notes</label>
                        <textarea
                            rows="4"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Paste JD or add personal notes here..."
                        ></textarea>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-submit">
                            <i className="fa-solid fa-check"></i> Save Application
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default JobModal;
