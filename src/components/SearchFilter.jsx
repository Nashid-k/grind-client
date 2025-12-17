import React, { memo } from 'react';

const SearchFilter = memo(({ searchTerm, setSearchTerm, filteredCount, totalCount }) => {
    const hasActiveFilter = searchTerm.length > 0;
    const showCounter = hasActiveFilter && filteredCount !== totalCount;

    return (
        <div className="search-input">
            <i className="fa-solid fa-search" />
            <input
                type="text"
                placeholder="Search company or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoComplete="off"
                spellCheck="false"
                name="search_query_dashboard"
            />
            {showCounter && (
                <span className="search-counter">
                    {filteredCount} result{filteredCount !== 1 ? 's' : ''}
                </span>
            )}
            <button
                className="search-clear"
                onClick={() => setSearchTerm('')}
                style={{
                    visibility: searchTerm ? 'visible' : 'hidden',
                    opacity: searchTerm ? 1 : 0,
                    transition: 'opacity 0.2s, transform 0.2s',
                    transform: searchTerm ? 'scale(1)' : 'scale(0.8)'
                }}
                tabIndex="-1"
            >
                <i className="fa-solid fa-xmark" />
            </button>
        </div>
    );
});

export default SearchFilter;
