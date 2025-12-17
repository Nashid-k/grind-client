import React from 'react';
import './DeleteModal.css'; // We will create this

function DeleteModal({ isOpen, onClose, onConfirm }) {
    if (!isOpen) return null;

    return (
        <div className="delete-modal-overlay">
            <div className="delete-modal-glass">
                <div className="delete-icon-wrapper">
                    <i className="fa-solid fa-triangle-exclamation" />
                </div>
                <h3>Delete Application?</h3>
                <p>This will permanently remove this application from your dashboard. This action cannot be undone.</p>

                <div className="delete-modal-actions">
                    <button className="del-btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="del-btn-confirm" onClick={onConfirm}>
                        <i className="fa-solid fa-trash-can" /> Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteModal;
