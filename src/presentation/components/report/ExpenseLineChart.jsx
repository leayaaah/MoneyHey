import { ResponsiveLine } from '@nivo/line';
import { colors as themeColors } from '../../../theme/theme';

const formatCurrency = (value) => `$${Number(value).toLocaleString('en-US')}`;

const chartTheme = {
    text: {
        fill: themeColors.onSurface
    },
    axis: {
        ticks: {
            text: {
                fill: themeColors.onSurfaceVariant
            }
        },
        legend: {
            text: {
                fill: themeColors.onSurfaceVariant
            }
        }
    },
    legends: {
        text: {
            fill: themeColors.onSurfaceVariant
        }
    },
    tooltip: {
        container: {
            background: themeColors.surfaceContainerLowest,
            color: themeColors.onSurface,
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
            padding: '8px 12px'
        }
    }
};

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const lineData = [
    {
        id: 'Spending',
        data: months.map((month) => ({
            x: month,
            y: Math.round(Math.random() * 100)
        }))
    }
];

const ExpenseLineChart = () => {
    return (
        <div className="chart-wrapper chart-wrapper--tall">
            <ResponsiveLine
                data={lineData}
                margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', min: 0, max: 100, stacked: false }}
                curve="catmullRom"
                axisBottom={{
                    tickPadding: 8,
                    tickSize: 5
                }}
                axisLeft={{
                    tickPadding: 6,
                    tickSize: 5,
                    format: formatCurrency
                }}
                colors={[themeColors.primary]}
                pointSize={8}
                pointColor={themeColors.surfaceContainerLowest}
                pointBorderWidth={2}
                pointBorderColor={themeColors.primary}
                enableArea={false}
                useMesh
                yFormat={formatCurrency}
                theme={chartTheme}
                tooltip={({ point }) => (
                    <div>
                        <strong>{point.data.xFormatted}</strong>
                        <div>{point.data.yFormatted}</div>
                    </div>
                )}
            />
        </div>
    );
};

export default ExpenseLineChart;
