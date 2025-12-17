import React, { useMemo, memo } from 'react';
import './ApplicationAnalytics.css';

// Helper functions
const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

const getDayName = (dayIndex) => {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex];
};

const getMonthName = (monthIndex) => {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][monthIndex];
};

// Stat Card Component
const StatCard = memo(({ icon, label, value, subvalue, color, trend }) => (
    <div className={`analytics-stat ${color}`}>
        <div className="stat-icon">
            <i className={`fa-solid ${icon}`} />
        </div>
        <div className="stat-content">
            <span className="stat-value">{value}</span>
            <span className="stat-label">{label}</span>
            {subvalue && <span className="stat-subvalue">{subvalue}</span>}
        </div>
        {trend && (
            <div className={`stat-trend ${trend > 0 ? 'up' : trend < 0 ? 'down' : ''}`}>
                {trend > 0 ? <i className="fa-solid fa-arrow-up" /> : trend < 0 ? <i className="fa-solid fa-arrow-down" /> : null}
                {trend !== 0 && <span>{Math.abs(trend)}%</span>}
            </div>
        )}
    </div>
));

// Mini Bar Chart
const MiniBarChart = memo(({ data, maxValue }) => (
    <div className="mini-bar-chart">
        {data.map((item, index) => (
            <div key={index} className="bar-column">
                <div
                    className="bar-fill"
                    style={{ height: `${maxValue ? (item.value / maxValue) * 100 : 0}%` }}
                    title={`${item.label}: ${item.value}`}
                />
                <span className="bar-label">{item.label}</span>
            </div>
        ))}
    </div>
));

// Funnel Chart
const FunnelChart = memo(({ stages }) => {
    const maxValue = stages[0]?.value || 1;

    return (
        <div className="funnel-chart">
            {stages.map((stage, index) => (
                <div key={stage.name} className="funnel-stage">
                    <div
                        className="funnel-bar"
                        style={{ width: `${(stage.value / maxValue) * 100}%` }}
                    >
                        <span className="funnel-value">{stage.value}</span>
                    </div>
                    <span className="funnel-label">{stage.name}</span>
                    {index < stages.length - 1 && (
                        <span className="funnel-rate">
                            {stage.value > 0
                                ? `${Math.round((stages[index + 1]?.value / stage.value) * 100)}%`
                                : '-'
                            }
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
});

// Insight Card
const InsightCard = memo(({ icon, title, description, type }) => (
    <div className={`insight-card ${type}`}>
        <div className="insight-icon">
            <i className={`fa-solid ${icon}`} />
        </div>
        <div className="insight-content">
            <strong>{title}</strong>
            <p>{description}</p>
        </div>
    </div>
));

function ApplicationAnalytics({ jobs = [] }) {
    // Calculate all analytics
    const analytics = useMemo(() => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000);

        // Filter jobs by time period
        const last30Days = jobs.filter(j => new Date(j.date) >= thirtyDaysAgo);
        const prev30Days = jobs.filter(j => {
            const d = new Date(j.date);
            return d >= sixtyDaysAgo && d < thirtyDaysAgo;
        });

        // Status counts
        const statusCounts = {
            applied: jobs.length, // Total applications (All Time)
            shortlisted: jobs.filter(j => j.status === 'shortlisted').length,
            interviewed: jobs.filter(j => ['interview_scheduled', 'interview_completed'].includes(j.status)).length,
            offer: jobs.filter(j => j.status === 'offer_received').length,
            rejected: jobs.filter(j => j.status === 'rejected').length,
        };

        // Response rate
        const totalWithResponse = statusCounts.shortlisted + statusCounts.interviewed + statusCounts.offer;
        const responseRate = jobs.length > 0
            ? Math.round((totalWithResponse / jobs.length) * 100)
            : 0;

        // Previous period rate for comparison
        const prevWithResponse = prev30Days.filter(j =>
            ['shortlisted', 'interviewed', 'offer'].includes(j.status)
        ).length;
        const prevResponseRate = prev30Days.length > 0
            ? Math.round((prevWithResponse / prev30Days.length) * 100)
            : 0;

        // Applications by day of week
        const byDayOfWeek = Array(7).fill(0);
        jobs.forEach(job => {
            const day = new Date(job.date).getDay();
            byDayOfWeek[day]++;
        });

        const dayData = byDayOfWeek.map((count, index) => ({
            label: getDayName(index),
            value: count
        }));

        // Find best day
        const maxDayIndex = byDayOfWeek.indexOf(Math.max(...byDayOfWeek));
        const bestDay = getDayName(maxDayIndex);

        // Applications by month (last 6 months)
        const byMonth = {};
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

        jobs.forEach(job => {
            const d = new Date(job.date);
            if (d >= sixMonthsAgo) {
                const key = `${d.getFullYear()}-${d.getMonth()}`;
                byMonth[key] = (byMonth[key] || 0) + 1;
            }
        });

        const monthData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now);
            d.setMonth(d.getMonth() - i);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            monthData.push({
                label: getMonthName(d.getMonth()),
                value: byMonth[key] || 0
            });
        }

        // Average response time (days between applied and first response)
        let totalResponseTime = 0;
        let respondedCount = 0;

        jobs.forEach(job => {
            if (['shortlisted', 'interviewed', 'offer'].includes(job.status) && job.updatedAt) {
                const appliedDate = new Date(job.date);
                const responseDate = new Date(job.updatedAt);
                const days = Math.ceil((responseDate - appliedDate) / (1000 * 60 * 60 * 24));
                if (days > 0 && days < 90) {
                    totalResponseTime += days;
                    respondedCount++;
                }
            }
        });

        const avgResponseTime = respondedCount > 0
            ? Math.round(totalResponseTime / respondedCount)
            : null;

        // Trend calculation
        const volumeTrend = prev30Days.length > 0
            ? Math.round(((last30Days.length - prev30Days.length) / prev30Days.length) * 100)
            : 0;

        const responseTrend = prevResponseRate > 0
            ? responseRate - prevResponseRate
            : 0;

        return {
            total: jobs.length,
            last30Days: last30Days.length,
            statusCounts,
            responseRate,
            volumeTrend,
            responseTrend,
            dayData,
            bestDay,
            monthData,
            avgResponseTime,
            funnelData: [
                { name: 'Applied', value: jobs.length },
                { name: 'Shortlisted', value: statusCounts.shortlisted + statusCounts.interviewed + statusCounts.offer },
                { name: 'Interviewed', value: statusCounts.interviewed + statusCounts.offer },
                { name: 'Offer', value: statusCounts.offer },
            ]
        };
    }, [jobs]);

    // Generate insights
    const insights = useMemo(() => {
        const list = [];

        // Best day insight
        if (analytics.total >= 5) {
            const maxDay = Math.max(...analytics.dayData.map(d => d.value));
            const bestDays = analytics.dayData.filter(d => d.value === maxDay);

            list.push({
                icon: 'fa-calendar-check',
                title: `${bestDays.map(d => d.label).join(' & ')} is your most active day`,
                description: `You've applied to ${maxDay} jobs on ${bestDays.length > 1 ? 'these days' : 'this day'}.`,
                type: 'info'
            });
        }

        // Response rate insight
        if (analytics.responseRate >= 20) {
            list.push({
                icon: 'fa-chart-line',
                title: `${analytics.responseRate}% response rate - Great!`,
                description: 'Your applications are getting noticed. Keep up the quality!',
                type: 'success'
            });
        } else if (analytics.total >= 10 && analytics.responseRate < 10) {
            list.push({
                icon: 'fa-lightbulb',
                title: 'Consider customizing applications',
                description: 'Tailored resumes and cover letters often improve response rates.',
                type: 'warning'
            });
        }

        // Volume insight
        if (analytics.volumeTrend > 50) {
            list.push({
                icon: 'fa-fire',
                title: 'Application volume is up!',
                description: `You're applying ${analytics.volumeTrend}% more than last month. Great momentum!`,
                type: 'success'
            });
        } else if (analytics.volumeTrend < -30 && analytics.total >= 10) {
            list.push({
                icon: 'fa-battery-half',
                title: 'Application pace slowing',
                description: 'Consider setting a daily goal to maintain momentum.',
                type: 'info'
            });
        }

        // Rejection insight
        if (analytics.statusCounts.rejected >= 10 && analytics.statusCounts.offer === 0) {
            list.push({
                icon: 'fa-heart',
                title: "Don't get discouraged!",
                description: `${analytics.statusCounts.rejected} rejections is part of the journey. Keep going!`,
                type: 'encouragement'
            });
        }

        return list;
    }, [analytics]);

    if (jobs.length === 0) {
        return (
            <div className="analytics-container">
                <div className="analytics-header">
                    <h2>
                        <i className="fa-solid fa-chart-pie" />
                        Application Analytics
                    </h2>
                </div>
                <div className="analytics-empty">
                    <i className="fa-solid fa-chart-simple" />
                    <h3>No Data Yet</h3>
                    <p>Start tracking applications to see your analytics!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="analytics-container">
            <div className="analytics-header">
                <h2>
                    <i className="fa-solid fa-chart-pie" />
                    Application Analytics
                </h2>
                <span className="analytics-period">Last 30 days</span>
            </div>

            {/* Stats Row */}
            <div className="analytics-stats">
                <StatCard
                    icon="fa-briefcase"
                    label="Total Applications"
                    value={analytics.total}
                    subvalue={`${analytics.last30Days} this month`}
                    color="blue"
                    trend={analytics.volumeTrend}
                />
                <StatCard
                    icon="fa-reply"
                    label="Response Rate"
                    value={`${analytics.responseRate}%`}
                    subvalue="of applications"
                    color="green"
                    trend={analytics.responseTrend}
                />
                <StatCard
                    icon="fa-trophy"
                    label="Offers"
                    value={analytics.statusCounts.offer}
                    subvalue={analytics.statusCounts.interviewed > 0
                        ? `from ${analytics.statusCounts.interviewed} interviews`
                        : null
                    }
                    color="gold"
                />
                <StatCard
                    icon="fa-clock"
                    label="Avg Response"
                    value={analytics.avgResponseTime ? `${analytics.avgResponseTime}d` : '-'}
                    subvalue="time to hear back"
                    color="purple"
                />
            </div>

            {/* Charts Row */}
            <div className="analytics-charts">
                <div className="chart-card">
                    <h3>
                        <i className="fa-solid fa-calendar-week" />
                        Applications by Day
                    </h3>
                    <MiniBarChart
                        data={analytics.dayData}
                        maxValue={Math.max(...analytics.dayData.map(d => d.value))}
                    />
                </div>

                <div className="chart-card">
                    <h3>
                        <i className="fa-solid fa-filter" />
                        Application Funnel
                    </h3>
                    <FunnelChart stages={analytics.funnelData} />
                </div>
            </div>

            {/* Monthly Trend */}
            <div className="chart-card chart-wide">
                <h3>
                    <i className="fa-solid fa-chart-line" />
                    Monthly Activity
                </h3>
                <MiniBarChart
                    data={analytics.monthData}
                    maxValue={Math.max(...analytics.monthData.map(d => d.value))}
                />
            </div>

            {/* Insights */}
            {insights.length > 0 && (
                <div className="analytics-insights">
                    <h3>
                        <i className="fa-solid fa-lightbulb" />
                        Insights
                    </h3>
                    <div className="insights-grid">
                        {insights.map((insight, index) => (
                            <InsightCard key={index} {...insight} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default memo(ApplicationAnalytics);
