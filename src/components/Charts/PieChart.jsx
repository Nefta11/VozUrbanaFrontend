import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import PropTypes from 'prop-types';
import './PieChart.css';

const CustomPieChart = ({ data, title, colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'] }) => {
    const RADIAN = Math.PI / 180;

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        if (percent < 0.05) return null; // No mostrar etiquetas para valores muy pequeños
        
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize="13"
                fontWeight="700"
                style={{ 
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="pie-chart-tooltip">
                    <p className="tooltip-label">
                        <strong>{payload[0].name}</strong>
                        <br />
                        <span>{payload[0].value} reportes ({((payload[0].value / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%)</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    CustomTooltip.propTypes = {
        active: PropTypes.bool,
        payload: PropTypes.array
    };

    return (
        <div className="pie-chart-container">
            <h3 className="pie-chart-title">{title}</h3>
            <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={90}
                        innerRadius={30}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth={2}
                    >
                        {data.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={colors[index % colors.length]}
                                style={{
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                                }}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        iconType="circle"
                        wrapperStyle={{
                            fontSize: '12px',
                            fontWeight: '500'
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
CustomPieChart.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number
        })
    ).isRequired,
    title: PropTypes.string,
    colors: PropTypes.arrayOf(PropTypes.string)
};

export default CustomPieChart;
