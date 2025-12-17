import React, { memo, useState, useEffect, useMemo, useCallback } from 'react';
import './InterviewPrepHub.css';
import { TECH_QUESTIONS, ROLE_QUESTIONS } from '../data/interviewQuestions';

// Calculate days until interview
const daysUntil = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return Math.ceil((date - now) / (1000 * 60 * 60 * 24));
};

// Common interview questions by category
const commonQuestions = {
    behavioral: [
        "Tell me about yourself",
        "Why do you want to work here?",
        "Describe a challenge you overcame",
        "Tell me about a time you failed",
        "Where do you see yourself in 5 years?",
        "Why are you leaving your current job?",
        "What's your greatest strength?",
        "What's your biggest weakness?",
    ],
    technical: [
        "Walk me through your experience",
        "Describe a complex project you worked on",
        "How do you stay updated with technology?",
        "Explain a technical concept simply",
        "How do you handle debugging?",
        "Describe your development process",
    ],
    situational: [
        "How would you handle a difficult colleague?",
        "What would you do if you disagreed with your manager?",
        "How do you prioritize conflicting deadlines?",
        "Describe how you'd handle an angry customer",
    ]
};

// Research checklist
const researchChecklist = [
    { id: 'company-about', label: 'Company mission & values', icon: 'fa-building' },
    { id: 'company-products', label: 'Products/services offered', icon: 'fa-box' },
    { id: 'company-news', label: 'Recent news & press releases', icon: 'fa-newspaper' },
    { id: 'company-culture', label: 'Company culture (Glassdoor)', icon: 'fa-users' },
    { id: 'role-desc', label: 'Reviewed job description', icon: 'fa-file-lines' },
    { id: 'interviewer', label: 'Researched interviewer (LinkedIn)', icon: 'fa-user-tie' },
    { id: 'competitors', label: 'Know main competitors', icon: 'fa-chart-line' },
    { id: 'questions', label: 'Prepared questions to ask', icon: 'fa-comments' },
];

// Prep card component
const PrepCard = memo(({ interview, onSelect, isSelected }) => {
    const daysLeft = daysUntil(interview.interviewDate);

    let urgencyClass = '';
    if (daysLeft !== null) {
        if (daysLeft <= 0) urgencyClass = 'today';
        else if (daysLeft <= 2) urgencyClass = 'urgent';
        else if (daysLeft <= 7) urgencyClass = 'soon';
    }

    return (
        <div
            className={`prep-card ${isSelected ? 'selected' : ''} ${urgencyClass}`}
            onClick={() => onSelect(interview)}
        >
            <div className="prep-card-header">
                <div className="prep-company-info">
                    <strong>{interview.company}</strong>
                    <span>{interview.role}</span>
                </div>
                {daysLeft !== null && (
                    <div className={`prep-countdown ${urgencyClass}`}>
                        {daysLeft === 0 ? (
                            <>
                                <i className="fa-solid fa-fire" />
                                <span>TODAY</span>
                            </>
                        ) : daysLeft < 0 ? (
                            <span>Past</span>
                        ) : (
                            <>
                                <span className="countdown-number">{daysLeft}</span>
                                <span className="countdown-label">days</span>
                            </>
                        )}
                    </div>
                )}
            </div>
            {interview.interviewDate && (
                <div className="prep-date">
                    <i className="fa-regular fa-calendar" />
                    {new Date(interview.interviewDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
            )}
        </div>
    );
});

// Main Interview Prep Hub
function InterviewPrepHub({ jobs = [], onUpdateJob }) {
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [notes, setNotes] = useState({});
    const [checkedItems, setCheckedItems] = useState({});
    const [savedQuestions, setSavedQuestions] = useState({});
    const [activeTab, setActiveTab] = useState('research');

    // Analysis State
    const [analysisStatus, setAnalysisStatus] = useState('idle'); // idle, loading, success, error
    const [jobAnalysis, setJobAnalysis] = useState({}); // { [jobId]: { role, stack, description, company } }

    // Mobile Master-Detail State
    const [showMobileDetail, setShowMobileDetail] = useState(false);

    // Load saved data
    useEffect(() => {
        const savedNotes = localStorage.getItem('interviewNotes');
        const savedChecks = localStorage.getItem('interviewChecks');
        const savedQs = localStorage.getItem('interviewQuestions');
        if (savedNotes) setNotes(JSON.parse(savedNotes));
        if (savedChecks) setCheckedItems(JSON.parse(savedChecks));
        if (savedQs) setSavedQuestions(JSON.parse(savedQs));
    }, []);

    // Save data persistence (debounced slightly or just effect hook is fine for now)
    useEffect(() => { localStorage.setItem('interviewNotes', JSON.stringify(notes)); }, [notes]);
    useEffect(() => { localStorage.setItem('interviewChecks', JSON.stringify(checkedItems)); }, [checkedItems]);
    useEffect(() => { localStorage.setItem('interviewQuestions', JSON.stringify(savedQuestions)); }, [savedQuestions]);

    // Analyze Job Function
    const analyzeJob = useCallback(async (interview) => {
        if (!interview.link || jobAnalysis[interview._id]) return;

        setAnalysisStatus('loading');
        try {
            const res = await fetch('http://localhost:5000/api/prep/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: interview.link })
            });

            const data = await res.json();

            if (res.ok) {
                setJobAnalysis(prev => ({
                    ...prev,
                    [interview._id]: data
                }));
                setAnalysisStatus('success');
            } else {
                setAnalysisStatus('error');
            }
        } catch (err) {
            console.error(err);
            setAnalysisStatus('error');
        }
    }, [jobAnalysis]);

    // Trigger analysis when selecting interview
    useEffect(() => {
        if (selectedInterview && selectedInterview.link && !jobAnalysis[selectedInterview._id]) {
            analyzeJob(selectedInterview);
        }
    }, [selectedInterview, analyzeJob, jobAnalysis]);

    // INCLUDES 'shortlisted', 'interviewed', 'offer' so notes aren't lost
    const interviews = useMemo(() => {
        return jobs
            .filter(job => ['shortlisted', 'interviewed', 'offer'].includes(job.status))
            .sort((a, b) => {
                // Urgent dates first, then no dates
                if (!a.interviewDate) return 1;
                if (!b.interviewDate) return -1;
                return new Date(a.interviewDate) - new Date(b.interviewDate);
            });
    }, [jobs]);

    // Auto-select first if none selected
    useEffect(() => {
        if (interviews.length > 0 && !selectedInterview) {
            setSelectedInterview(interviews[0]);
        } else if (selectedInterview && !interviews.find(i => i._id === selectedInterview._id)) {
            // If selected interview is no longer in list (e.g. status changed to rejected), reset
            setSelectedInterview(interviews.length > 0 ? interviews[0] : null);
        }
    }, [interviews, selectedInterview]);

    const handleSelectInterview = (interview) => {
        setSelectedInterview(interview);
        setShowMobileDetail(true);
        setActiveTab('research'); // Reset tab on switch
    };

    const handleBackToList = () => {
        setShowMobileDetail(false);
    };

    // ... handlers ...
    const handleNoteChange = (jobId, value) => {
        setNotes(prev => ({ ...prev, [jobId]: value }));
    };

    const handleCheckItem = (jobId, itemId) => {
        setCheckedItems(prev => ({
            ...prev,
            [jobId]: { ...(prev[jobId] || {}), [itemId]: !prev[jobId]?.[itemId] }
        }));
    };

    const handleSaveQuestion = (jobId, question) => {
        setSavedQuestions(prev => ({
            ...prev,
            [jobId]: [...(prev[jobId] || []), { question, answer: '' }]
        }));
    };

    const handleUpdateAnswer = (jobId, index, answer) => {
        setSavedQuestions(prev => ({
            ...prev,
            [jobId]: prev[jobId].map((q, i) => i === index ? { ...q, answer } : q)
        }));
    };

    const handleRemoveQuestion = (jobId, index) => {
        setSavedQuestions(prev => ({
            ...prev,
            [jobId]: prev[jobId].filter((_, i) => i !== index)
        }));
    };

    // Generate Recommended Questions
    const recommendedQuestions = useMemo(() => {
        if (!selectedInterview || !jobAnalysis[selectedInterview._id]) return [];

        const analysis = jobAnalysis[selectedInterview._id];
        let questions = [];

        // Role-based
        if (ROLE_QUESTIONS[analysis.role]) {
            questions = [...questions, ...ROLE_QUESTIONS[analysis.role]];
        } else {
            // Fallback to Software Engineer if role not found
            questions = [...questions, ...ROLE_QUESTIONS['Software Engineer']];
        }

        // Tech-stack based
        if (analysis.stack) {
            analysis.stack.forEach(tech => {
                // Find matching key (simple check)
                const key = Object.keys(TECH_QUESTIONS).find(k => k.toLowerCase() === tech.toLowerCase());
                if (key) {
                    questions = [...questions, ...TECH_QUESTIONS[key]];
                }
            });
        }

        // Shuffle and limit to 5
        return questions.sort(() => 0.5 - Math.random()).slice(0, 5);
    }, [selectedInterview, jobAnalysis]);

    const completedChecks = selectedInterview
        ? Object.values(checkedItems[selectedInterview._id] || {}).filter(Boolean).length
        : 0;

    if (interviews.length === 0) {
        return (
            <div className="prep-hub">
                <div className="prep-hub-header">
                    <h2><i className="fa-solid fa-graduation-cap" /> Interview Prep Hub</h2>
                </div>
                <div className="prep-empty">
                    <div className="prep-empty-icon"><i className="fa-solid fa-calendar-check" /></div>
                    <h3>No Active Interviews</h3>
                    <p>Shortlist candidates or schedule interviews to unlock tools.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="prep-hub">
            <div className="prep-hub-header">
                <h2>
                    <i className="fa-solid fa-graduation-cap" />
                    Interview Prep Hub
                </h2>
                <span className="prep-hub-count">{interviews.length} Active</span>
            </div>

            <div className="prep-hub-content">
                {/* LIST VIEW (Hidden on mobile if detailing) */}
                <div className={`prep-list ${showMobileDetail ? 'mobile-hidden' : ''}`}>
                    {interviews.map(interview => (
                        <PrepCard
                            key={interview._id}
                            interview={interview}
                            onSelect={() => handleSelectInterview(interview)}
                            isSelected={selectedInterview?._id === interview._id}
                        />
                    ))}
                </div>

                {/* DETAIL VIEW (Hidden on mobile if listing) */}
                {selectedInterview ? (
                    <div className={`prep-area ${!showMobileDetail ? 'mobile-hidden' : ''}`}>
                        <div className="prep-area-header">
                            <div className="mobile-back-row">
                                <button className="mobile-back-btn" onClick={handleBackToList}>
                                    <i className="fa-solid fa-arrow-left" /> Back
                                </button>
                                <h3>{selectedInterview.company}</h3>
                            </div>

                            <div className="prep-tabs">
                                <button
                                    className={`prep-tab ${activeTab === 'research' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('research')}
                                >
                                    <i className="fa-solid fa-magnifying-glass" />
                                    <span>Research</span>
                                </button>
                                <button
                                    className={`prep-tab ${activeTab === 'questions' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('questions')}
                                >
                                    <i className="fa-solid fa-comments" />
                                    <span>Questions</span>
                                </button>
                                <button
                                    className={`prep-tab ${activeTab === 'notes' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('notes')}
                                >
                                    <i className="fa-solid fa-note-sticky" />
                                    <span>Notes</span>
                                </button>
                            </div>
                        </div>

                        <div className="prep-area-body">
                            {/* Research Tab */}
                            {activeTab === 'research' && (
                                <div className="prep-research animate-fade-in">
                                    {/* Analysis Card */}
                                    {selectedInterview.link && (
                                        <div className="analysis-card">
                                            <div className="analysis-header">
                                                <h4>
                                                    <i className="fa-solid fa-robot" />
                                                    AI Job Analysis
                                                    {analysisStatus === 'loading' && <span className="loading-dots">...</span>}
                                                </h4>
                                                {analysisStatus === 'success' && <span className="badge-success">Active</span>}
                                            </div>

                                            {jobAnalysis[selectedInterview._id] ? (
                                                <div className="analysis-content">
                                                    <p className="analysis-desc">{jobAnalysis[selectedInterview._id].description}</p>
                                                    <div className="analysis-tags">
                                                        <span className="tag-role"><i className="fa-solid fa-user-tie" /> {jobAnalysis[selectedInterview._id].role}</span>
                                                        {jobAnalysis[selectedInterview._id].stack.map(tech => (
                                                            <span key={tech} className="tag-tech">{tech}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="analysis-placeholder">
                                                    {analysisStatus === 'loading' ? 'Analyzing job post...' : 'Unable to analyze link automatically.'}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="research-progress">
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${(completedChecks / researchChecklist.length) * 100}%` }}
                                            />
                                        </div>
                                        <span>{completedChecks} / {researchChecklist.length} steps</span>
                                    </div>

                                    <div className="research-checklist">
                                        {researchChecklist.map(item => (
                                            <div
                                                key={item.id}
                                                className={`research-item ${checkedItems[selectedInterview._id]?.[item.id] ? 'checked' : ''}`}
                                                onClick={() => handleCheckItem(selectedInterview._id, item.id)}
                                            >
                                                <i className={`fa-solid ${checkedItems[selectedInterview._id]?.[item.id] ? 'fa-check' : item.icon}`} />
                                                <span>{item.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="research-links">
                                        <a
                                            href={`https://www.google.com/search?q=${encodeURIComponent(selectedInterview.company + ' interview questions')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="research-link"
                                        >
                                            <i className="fa-brands fa-google" /> Interview Qs
                                        </a>
                                        <a
                                            href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(selectedInterview.company)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="research-link"
                                        >
                                            <i className="fa-brands fa-linkedin" /> Find Team
                                        </a>
                                        <a
                                            href={selectedInterview.link || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="research-link"
                                        >
                                            <i className="fa-solid fa-link" /> Job Post
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Questions Tab */}
                            {activeTab === 'questions' && (
                                <div className="prep-questions animate-fade-in">
                                    {/* Recommended Questions */}
                                    {recommendedQuestions.length > 0 && (
                                        <div className="questions-section">
                                            <h4><i className="fa-solid fa-wand-magic-sparkles" /> Recommended for You</h4>
                                            <div className="question-list">
                                                {recommendedQuestions.map((q, i) => (
                                                    <div key={i} className="question-item recommended">
                                                        <span>{q}</span>
                                                        <button className="add-q-btn" onClick={() => handleSaveQuestion(selectedInterview._id, q)}>
                                                            <i className="fa-solid fa-plus" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {savedQuestions[selectedInterview._id]?.length > 0 && (
                                        <div className="questions-section">
                                            <h4><i className="fa-solid fa-bookmark" /> My Practice Set</h4>
                                            <div className="saved-questions">
                                                {savedQuestions[selectedInterview._id].map((q, index) => (
                                                    <div key={index} className="saved-question">
                                                        <div className="saved-q-header">
                                                            <span>{q.question}</span>
                                                            <button className="remove-q-btn" onClick={() => handleRemoveQuestion(selectedInterview._id, index)}>
                                                                <i className="fa-solid fa-trash" />
                                                            </button>
                                                        </div>
                                                        <textarea
                                                            placeholder="Draft your answer here..."
                                                            value={q.answer}
                                                            onChange={(e) => handleUpdateAnswer(selectedInterview._id, index, e.target.value)}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {Object.entries(commonQuestions).map(([category, questions]) => (
                                        <div key={category} className="questions-section">
                                            <h4>
                                                <i className={`fa-solid ${category === 'behavioral' ? 'fa-user-group' : category === 'technical' ? 'fa-laptop-code' : 'fa-lightbulb'}`} />
                                                {category}
                                            </h4>
                                            <div className="question-list">
                                                {questions.map((question, index) => (
                                                    <div key={index} className="question-item">
                                                        <span>{question}</span>
                                                        <button className="add-q-btn" onClick={() => handleSaveQuestion(selectedInterview._id, question)}>
                                                            <i className="fa-solid fa-plus" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Notes Tab */}
                            {activeTab === 'notes' && (
                                <div className="prep-notes animate-fade-in">
                                    <textarea
                                        className="notes-textarea"
                                        placeholder={`## Notes for ${selectedInterview.company}\n\n- Role: ${selectedInterview.role}\n- Talking Points:\n- Questions for them:`}
                                        value={notes[selectedInterview._id] || ''}
                                        onChange={(e) => handleNoteChange(selectedInterview._id, e.target.value)}
                                    />
                                    <div className="notes-tip">
                                        <i className="fa-solid fa-circle-check" />
                                        <span>Auto-saving your brilliance...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="prep-area list-placeholder mobile-hidden">
                        <i className="fa-solid fa-arrow-left" />
                        <p>Select an interview to start prepping</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default memo(InterviewPrepHub);
