import React from 'react';

function WidgetToolbar({ activeWidget, setActiveWidget }) {
    const widgets = [
        { id: 'focus', icon: 'fa-bullseye', color: '#3b82f6', label: 'Daily Focus' },
        { id: 'logger', icon: 'fa-bolt', color: '#eab308', label: 'Speed Logger' },
        { id: 'quests', icon: 'fa-scroll', color: '#a855f7', label: 'Daily Quests' },
    ];

    return (
        <div className="widget-toolbar glass-panel" style={{
            display: 'flex',
            gap: '1rem',
            padding: '0.8rem',
            borderRadius: '2rem',
            marginBottom: '2rem',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            width: 'fit-content',
            margin: '0 auto 2rem auto'
        }}>
            {widgets.map(w => (
                <button
                    key={w.id}
                    onClick={() => setActiveWidget(activeWidget === w.id ? null : w.id)}
                    className="widget-btn"
                    title={w.label}
                    style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '50%',
                        border: activeWidget === w.id ? `2px solid ${w.color}` : '2px solid transparent',
                        background: activeWidget === w.id ? `rgba(${parseInt(w.color.slice(1, 3), 16)}, ${parseInt(w.color.slice(3, 5), 16)}, ${parseInt(w.color.slice(5, 7), 16)}, 0.2)` : 'rgba(255,255,255,0.05)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        fontSize: '1.2rem',
                        position: 'relative',
                        outline: 'none'
                    }}
                >
                    <i className={`fa-solid ${w.icon}`} style={{ color: activeWidget === w.id ? w.color : 'var(--text-secondary)' }}></i>

                    {/* Tooltip on hover (simple check) */}
                </button>
            ))}
        </div>
    );
}

export default WidgetToolbar;
