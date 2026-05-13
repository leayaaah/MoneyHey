import { ResponsiveBar } from '@nivo/bar';
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

const ExpenseBarChart = ({ data }) => {
    const chartData = (data || [])
        .filter((item) => Number(item.value) > 0)
        .map((item) => ({
            category: item.name,
            amount: Number(item.value)
        }));

    if (chartData.length === 0) {
        return (
            <div className="chart-empty chart-empty--medium">
                Chưa có dữ liệu để hiển thị biểu đồ.
            </div>
        );
    }

    return (
        <div className="chart-wrapper chart-wrapper--medium">
            <ResponsiveBar
                data={chartData}
                keys={['amount']}
                indexBy="category"
                margin={{ top: 20, right: 20, bottom: 70, left: 60 }}
                padding={0.3}
                valueScale={{ type: 'linear' }}
                indexScale={{ type: 'band', round: true }}
                colors={themeColors.primary}
                borderRadius={4}
                axisBottom={{
                    tickRotation: 30,
                    tickPadding: 8,
                    tickSize: 5
                }}
                axisLeft={{
                    tickPadding: 6,
                    tickSize: 5,
                    format: formatCurrency
                }}
                labelSkipWidth={16}
                labelSkipHeight={16}
                valueFormat={formatCurrency}
                theme={chartTheme}
                tooltip={({ indexValue, value }) => (
                    <div>
                        <strong>{indexValue}</strong>
                        <div>{formatCurrency(value)}</div>
                    </div>
                )}
            />
        </div>
    );
};

export default ExpenseBarChart;
