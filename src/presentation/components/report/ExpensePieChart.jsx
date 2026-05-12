import { ResponsivePie } from '@nivo/pie';
import { colors as themeColors } from '../../../theme/theme';

const BORDER_DARKEN_AMOUNT = 0.2; // Subtle darken for slice borders.
const ARC_LABEL_DARKEN_AMOUNT = 2; // Stronger contrast for readable labels.
const formatCurrency = (value) => `$${Number(value).toLocaleString('en-US')}`;

const chartTheme = {
    text: {
        fill: themeColors.onSurface
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

const ExpensePieChart = ({ data }) => {
    const chartData = (data || [])
        .filter((item) => Number(item.value) > 0)
        .map((item, index) => ({
            id: item.name,
            label: item.name,
            value: Number(item.value),
            color: `hsl(${index * 37}, 70%, 50%)`
        }));

    if (chartData.length === 0) {
        return (
            <div className="chart-empty chart-empty--compact">
                Chưa có dữ liệu để hiển thị biểu đồ.
            </div>
        );
    }

    return (
        <div className="chart-wrapper chart-wrapper--compact">
            <ResponsivePie
                data={chartData}
                margin={{ top: 20, right: 130, bottom: 20, left: 20 }}
                innerRadius={0.55}
                padAngle={0.7}
                cornerRadius={4}
                activeOuterRadiusOffset={8}
                colors={{ datum: 'data.color' }}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', BORDER_DARKEN_AMOUNT]] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor={themeColors.onSurfaceVariant}
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{ from: 'color', modifiers: [['darker', ARC_LABEL_DARKEN_AMOUNT]] }}
                arcLinkLabel={(datum) => datum.label}
                arcLabel={(datum) => formatCurrency(datum.value)}
                valueFormat={formatCurrency}
                legends={[
                    {
                        anchor: 'right',
                        direction: 'column',
                        justify: false,
                        translateX: 110,
                        itemsSpacing: 8,
                        itemWidth: 110,
                        itemHeight: 18,
                        itemTextColor: themeColors.onSurfaceVariant,
                        symbolSize: 12,
                        symbolShape: 'circle'
                    }
                ]}
                theme={chartTheme}
                tooltip={({ datum }) => (
                    <div>
                        <strong>{datum.label}</strong>
                        <div>{formatCurrency(datum.value)}</div>
                    </div>
                )}
            />
        </div>
    );
};

export default ExpensePieChart;
