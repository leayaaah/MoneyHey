import { ResponsivePie } from '@nivo/pie';
import { colors as themeColors } from '../../../theme/theme';

const chartColors = [
    themeColors.primary,
    themeColors.secondary,
    themeColors.tertiary,
    themeColors.primaryContainer,
    themeColors.secondaryContainer,
    themeColors.tertiaryContainer,
    themeColors.tertiaryFixed,
    themeColors.error
];

const BORDER_DARKEN_AMOUNT = 0.2; // Subtle darken for slice borders.
const ARC_LABEL_DARKEN_AMOUNT = 2; // Stronger contrast for readable labels.

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
        .map((item) => ({
            id: item.name,
            label: item.name,
            value: Number(item.value)
        }));

    if (chartData.length === 0) {
        return (
            <div className="chart-empty">
                Chưa có dữ liệu để hiển thị biểu đồ.
            </div>
        );
    }

    return (
        <div className="chart-wrapper">
            <ResponsivePie
                data={chartData}
                margin={{ top: 20, right: 20, bottom: 70, left: 20 }}
                innerRadius={0.55}
                padAngle={0.7}
                cornerRadius={4}
                activeOuterRadiusOffset={8}
                colors={chartColors}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', BORDER_DARKEN_AMOUNT]] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor={themeColors.onSurfaceVariant}
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{ from: 'color', modifiers: [['darker', ARC_LABEL_DARKEN_AMOUNT]] }}
                legends={[
                    {
                        anchor: 'bottom',
                        direction: 'row',
                        justify: false,
                        translateY: 60,
                        itemsSpacing: 12,
                        itemWidth: 90,
                        itemHeight: 18,
                        itemTextColor: themeColors.onSurfaceVariant,
                        symbolSize: 12,
                        symbolShape: 'circle'
                    }
                ]}
                theme={chartTheme}
            />
        </div>
    );
};

export default ExpensePieChart;
