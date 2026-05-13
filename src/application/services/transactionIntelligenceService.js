import { getTransactionAiConfig, parseTransactionsByAi } from '../../infrastructure/repositories/transactionAiRepository';

const normalizeVietnamese = (value = '') =>
    value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\u0111/g, 'd')
        .replace(/\u0110/g, 'D')
        .toLowerCase();

const amountPattern = /(\d+(?:[.,]\d+)?)\s*(k|nghin|ngan|tr|trieu|cu|xiu|chai|d)?/gi;

const incomeKeywords = [
    'luong',
    'thuong',
    'nhan',
    'thu',
    'ban duoc',
    'hoan tien',
    'duoc cho',
    'freelance'
];

const categoryKeywordMap = {
    'an uong': ['an', 'uong', 'tra sua', 'ca phe', 'com', 'mi', 'my cay', 'bun', 'pho', 'phuc long'],
    'am thuc': ['an', 'uong', 'tra sua', 'ca phe', 'com', 'mi', 'my cay', 'bun', 'pho', 'phuc long'],
    'do an': ['an', 'uong', 'tra sua', 'ca phe', 'com', 'mi', 'my cay', 'bun', 'pho', 'phuc long'],
    'di chuyen': ['grab', 'xe', 'do xang', 'xang', 'taxi', 'bus', 'di chuyen'],
    'mua sam': ['mua', 'ao', 'quan', 'giay', 'shopping', 'sam'],
    'giai tri': ['netflix', 'xem phim', 'game', 'giai tri', 'spotify'],
    'hoa don': ['dien', 'nuoc', 'internet', 'wifi', 'hoa don'],
    'nha o': ['thue nha', 'nha', 'noi that'],
    'suc khoe': ['thuoc', 'benh vien', 'kham', 'suc khoe'],
    'giao duc': ['hoc', 'khoa hoc', 'sach', 'hoc phi'],
    'luong': ['luong', 'salary'],
    'thu nhap': ['luong', 'thuong', 'freelance', 'thu nhap', 'hoan tien']
};

const parseAmount = (segment) => {
    const matches = [...normalizeVietnamese(segment).matchAll(amountPattern)];
    const lastMatch = matches.at(-1);

    if (!lastMatch) {
        return 0;
    }

    const base = Number(lastMatch[1].replace(',', '.'));
    const unit = normalizeVietnamese(lastMatch[2] || '');

    if (['k', 'nghin', 'ngan', 'cu', 'xi', 'xiu', 'chai'].includes(unit)) {
        return Math.round(base * 1000);
    }

    if (['tr', 'trieu'].includes(unit)) {
        return Math.round(base * 1000000);
    }

    return Math.round(base);
};

const inferType = (segment) => {
    const normalized = normalizeVietnamese(segment);
    return incomeKeywords.some((keyword) => normalized.includes(keyword)) ? 'income' : 'expense';
};

const scoreCategory = (segment, categoryName) => {
    const normalizedSegment = normalizeVietnamese(segment);
    const normalizedCategory = normalizeVietnamese(categoryName);

    let score = 0;

    if (normalizedSegment.includes(normalizedCategory)) {
        score += 4;
    }

    const mappedKeywords = categoryKeywordMap[normalizedCategory] || [];
    score += mappedKeywords.filter((keyword) => normalizedSegment.includes(keyword)).length * 2;

    return score;
};

const inferCategory = (segment, categories) => {
    const ranked = categories
        .map((category) => ({
            ...category,
            score: scoreCategory(segment, category.category_name)
        }))
        .sort((left, right) => right.score - left.score);

    if (!ranked.length || ranked[0].score <= 0) {
        return {
            category_id: '',
            category_name: '',
            confidence: 0.2
        };
    }

    const best = ranked[0];
    return {
        category_id: String(best.category_id),
        category_name: best.category_name,
        confidence: Math.min(0.35 + best.score * 0.1, 0.89)
    };
};

const parseFallbackTransactions = ({ rawText, categories }) => {
    const segments = rawText
        .split(/[\n,;]+/)
        .map((segment) => segment.trim())
        .filter(Boolean);

    return segments.map((segment) => {
        const category = inferCategory(segment, categories);

        return {
            note: segment,
            amount: parseAmount(segment),
            tx_type: inferType(segment),
            category_id: category.category_id,
            category_name: category.category_name,
            confidence: category.confidence
        };
    }).filter((transaction) => transaction.amount > 0);
};

const normalizeAiTransactions = (transactions = []) =>
    transactions.map((transaction) => ({
        note: String(transaction.note || '').trim(),
        amount: Number(transaction.amount || 0),
        tx_type: transaction.tx_type === 'income' ? 'income' : 'expense',
        category_id:
            transaction.category_id === null || transaction.category_id === undefined || transaction.category_id === ''
                ? ''
                : String(transaction.category_id),
        category_name: String(transaction.category_name || '').trim(),
        confidence: Number(transaction.confidence || 0)
    })).filter((transaction) => transaction.note && transaction.amount > 0);

export const parseQuickTransactions = async ({ rawText, categories }) => {
    const aiConfig = getTransactionAiConfig();

    try {
        const response = await parseTransactionsByAi({ rawText, categories });
        const normalized = normalizeAiTransactions(response.transactions);

        if (normalized.length > 0) {
            return {
                source: 'ai',
                provider: aiConfig.provider,
                providerLabel: aiConfig.providerLabel,
                model: aiConfig.model,
                transactions: normalized
            };
        }
    } catch (error) {
        console.warn('AI parse failed, using fallback parser instead.', error);
        return {
            source: 'fallback',
            provider: aiConfig.provider,
            providerLabel: aiConfig.providerLabel,
            model: aiConfig.model,
            reason:
                aiConfig.endpoint || aiConfig.openAiApiKeyConfigured || aiConfig.geminiApiKeyConfigured
                    ? error.message
                    : `${aiConfig.providerLabel} is not configured yet.`,
            transactions: parseFallbackTransactions({ rawText, categories })
        };
    }

    return {
        source: 'fallback',
        provider: aiConfig.provider,
        providerLabel: aiConfig.providerLabel,
        model: aiConfig.model,
        reason: `${aiConfig.providerLabel} returned no valid transactions.`,
        transactions: parseFallbackTransactions({ rawText, categories })
    };
};
