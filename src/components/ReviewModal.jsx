import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './ReviewModal.css';

function ReviewModal({ isOpen, onClose, onSuccess }) {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!rating) {
            setError('Please select a rating');
            return;
        }

        if (!comment.trim()) {
            setError('Please write a review');
            return;
        }

        if (comment.length > 500) {
            setError('Review must be 500 characters or less');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('http://localhost:5000/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user._id,
                    rating,
                    comment: comment.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit review');
            }

            // Success
            if (onSuccess) onSuccess();
            setRating(0);
            setComment('');
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="review-modal-overlay" onClick={onClose}>
            <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="review-modal-header">
                    <h2>
                        <i className="fa-solid fa-star" />
                        Leave a Review
                    </h2>
                    <button className="review-modal-close" onClick={onClose}>
                        <i className="fa-solid fa-times" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="review-modal-form">
                    {/* Star Rating */}
                    <div className="review-rating-section">
                        <label>Your Rating</label>
                        <div className="review-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className={`star-btn ${star <= (hoverRating || rating) ? 'active' : ''}`}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                >
                                    <i className="fa-solid fa-star" />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="rating-text">
                                {rating === 5 && '⭐ Excellent!'}
                                {rating === 4 && '⭐ Great!'}
                                {rating === 3 && '⭐ Good!'}
                                {rating === 2 && '⭐ Fair'}
                                {rating === 1 && '⭐ Poor'}
                            </p>
                        )}
                    </div>

                    {/* Review Text */}
                    <div className="review-comment-section">
                        <label htmlFor="review-comment">Your Review</label>
                        <textarea
                            id="review-comment"
                            placeholder="Share your experience with The Grind... What features do you love? How has it helped your job search?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            maxLength={500}
                            rows={5}
                        />
                        <div className="char-count">
                            {comment.length}/500 characters
                        </div>
                    </div>

                    {error && (
                        <div className="review-error">
                            <i className="fa-solid fa-exclamation-circle" />
                            {error}
                        </div>
                    )}

                    <div className="review-modal-actions">
                        <button
                            type="button"
                            className="review-btn review-btn-cancel"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="review-btn review-btn-submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-paper-plane" />
                                    Submit Review
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ReviewModal;
