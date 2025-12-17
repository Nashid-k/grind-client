import React, { useEffect, useRef, useCallback } from 'react';
import './WidgetModal.css';

function WidgetModal({ isOpen, onClose, title, icon, children }) {
    const modalRef = useRef(null);
    const previousActiveElement = useRef(null);

    // Handle Escape key
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    // Handle click outside
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Focus trap and accessibility
    useEffect(() => {
        if (isOpen) {
            // Store current focus
            previousActiveElement.current = document.activeElement;

            // Focus the modal
            if (modalRef.current) {
                modalRef.current.focus();
            }

            // Add event listener
            document.addEventListener('keydown', handleKeyDown);

            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';

            // Restore focus
            if (previousActiveElement.current) {
                previousActiveElement.current.focus();
            }
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    return (
        <div className="widget-modal-backdrop" onClick={handleBackdropClick}>
            <div
                className="widget-modal"
                ref={modalRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby="widget-modal-title"
            >
                <div className="widget-modal-header">
                    <h2 className="widget-modal-title" id="widget-modal-title">
                        {icon && <i className={icon} />}
                        {title}
                    </h2>
                    <button
                        className="widget-modal-close"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <i className="fa-solid fa-times" />
                    </button>
                </div>
                <div className="widget-modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default WidgetModal;
