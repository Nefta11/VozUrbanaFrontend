import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PropTypes from 'prop-types';
import './BarChart.css';

const CustomBarChart = ({ data, title, xAxisKey = "name", yAxisKey = "value", color = "#8884d8" }) => {
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bar-chart-tooltip">
                    <p className="tooltip-label">{`${label}: ${payload[0].value}`}</p>
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
        <div className="bar-chart-container">
            <h3 className="bar-chart-title">{title}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey={xAxisKey}
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                        dataKey={yAxisKey}
                        fill={color}
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
CustomBarChart.propTypes = {
    data: PropTypes.array.isRequired,
    title: PropTypes.string.isRequired,
    xAxisKey: PropTypes.string,
    yAxisKey: PropTypes.string,
    color: PropTypes.string,
};

export default CustomBarChart;

