import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PropTypes from 'prop-types';
import './StatsComponents.css';

const StatsCard = ({ title, value, icon, color = "#3b82f6", change, changeType }) => {
    return (
        <div className="stats-card">
            <div className="stats-card-header">
                <div className="stats-card-icon" style={{ color }}>
                    {icon}
                </div>
                <div className="stats-card-info">
                    <h3 className="stats-card-title">{title}</h3>
                    <p className="stats-card-value">{value}</p>
                    {change && (
                        <p className={`stats-card-change ${changeType}`}>
                            {changeType === 'positive' ? '+' : ''}{change}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

const CommentsChart = ({ data, title }) => {
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="comments-chart-tooltip">
                    <p className="tooltip-label">{`${label}: ${payload[0].value} comentarios`}</p>
                </div>
            );
        }
        return null;
    };

    CustomTooltip.propTypes = {
        active: PropTypes.bool,
        payload: PropTypes.array,
        label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    };

    return (
        <div className="comments-chart-container">
            <h3 className="comments-chart-title">{title}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                        type="monotone"
                        dataKey="comments"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.3}
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
StatsCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    icon: PropTypes.node,
    color: PropTypes.string,
    change: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    changeType: PropTypes.string,
};

CommentsChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    title: PropTypes.string.isRequired,
};

export { StatsCard, CommentsChart };
