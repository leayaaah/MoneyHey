const formatUnit = (value, unit, suffix, step) => {
    let base = Math.floor(value / unit);
    let remainderPart = Math.round((value % unit) / step);

    if (remainderPart >= 100) {
        base += 1;
        remainderPart = 0;
    }

    if (remainderPart === 0) {
        return `${base}${suffix}`;
    }

    const remainderText = String(remainderPart).padStart(2, '0').replace(/0+$/, '');
    return `${base}${suffix}${remainderText}`;
};

export const formatCompactVnd = (value, { showSign = false } = {}) => {
    const numberValue = Number(value);

    if (!Number.isFinite(numberValue)) {
        return '0';
    }

    const sign = numberValue < 0 ? '-' : (showSign && numberValue > 0 ? '+' : '');
    const absValue = Math.round(Math.abs(numberValue));

    let formatted = absValue.toString();

    if (absValue >= 1_000_000) {
        formatted = formatUnit(absValue, 1_000_000, 'tr', 10_000);
    } else if (absValue >= 1_000) {
        formatted = formatUnit(absValue, 1_000, 'k', 10);
    }

    return `${sign}${formatted}`;
};
