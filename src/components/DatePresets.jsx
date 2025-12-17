import React from 'react';
import './DatePresets.css';

const DatePresets = ({ activePreset, onPresetClick, dateRange, onDateChange }) => {
    return (
        <div className="date-filter-wrapper">
            <select
                className="date-preset-dropdown"
                value={activePreset}
                onChange={(e) => onPresetClick(e.target.value)}
            >
                <option value="all">All Time</option>
                <option value="last7">Last 7 Days</option>
                <option value="last30">Last 30 Days</option>
                <option value="thisMonth">This Month</option>
                <option value="thisYear">This Year</option>
                <option value="custom">Custom Date Range</option>
            </select>

            {activePreset === 'custom' && (
                <div className="custom-date-inputs">
                    <input
                        type="date"
                        className="date-input"
                        value={dateRange.start}
                        onChange={(e) => onDateChange('start', e.target.value)}
                        placeholder="Start Date"
                    />
                    <span className="date-separator">to</span>
                    <input
                        type="date"
                        className="date-input"
                        value={dateRange.end}
                        onChange={(e) => onDateChange('end', e.target.value)}
                        placeholder="End Date"
                    />
                </div>
            )}
        </div>
    );
};

export default DatePresets;
