const OPENAI_RESPONSES_ENDPOINT = 'https://api.openai.com/v1/responses';
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_PROVIDER = 'openai';
const DEFAULT_OPENAI_MODEL = 'gpt-5.4-nano';
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

const transactionSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['transactions'],
    properties: {
        transactions: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['note', 'amount', 'tx_type', 'category_id', 'category_name', 'confidence'],
                properties: {
                    note: { type: 'string' },
                    amount: { type: 'number' },
                    tx_type: {
                        type: 'string',
                        enum: ['expense', 'income']
                    },
                    category_id: {
                        anyOf: [
                            { type: 'integer' },
                            { type: 'null' }
                        ]
                    },
                    category_name: { type: 'string' },
                    confidence: {
                        type: 'number',
                        minimum: 0,
                        maximum: 1
                    }
                }
            }
        }
    }
};

const geminiTransactionSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['transactions'],
    properties: {
        transactions: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['note', 'amount', 'tx_type', 'category_id', 'category_name', 'confidence'],
                properties: {
                    note: {
                        type: 'string',
                        description: 'A concise transaction note in Vietnamese.'
                    },
                    amount: {
                        type: 'number',
                        description: 'Transaction amount normalized into VND.'
                    },
                    tx_type: {
                        type: 'string',
                        enum: ['expense', 'income'],
                        description: 'Use expense for spending and income for money received.'
                    },
                    category_id: {
                        type: ['integer', 'null'],
                        description: 'Only use a category_id from the provided options, otherwise null.'
                    },
                    category_name: {
                        type: 'string',
                        description: 'Category name matching category_id, or empty string when category_id is null.'
                    },
                    confidence: {
                        type: 'number',
                        minimum: 0,
                        maximum: 1,
                        description: 'Confidence score between 0 and 1.'
                    }
                }
            }
        }
    }
};

const extractOutputText = (response) => {
    if (typeof response.output_text === 'string' && response.output_text.trim()) {
        return response.output_text;
    }

    const messageItem = response.output?.find((item) => item.type === 'message');
    const textItem = messageItem?.content?.find((item) => item.type === 'output_text');
    return textItem?.text || '';
};

const extractRefusalText = (response) => {
    const messageItem = response.output?.find((item) => item.type === 'message');
    const refusalItem = messageItem?.content?.find((item) => item.type === 'refusal');
    return refusalItem?.refusal || refusalItem?.text || '';
};

const extractGeminiOutputText = (response) =>
    response.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || '')
        .join('')
        .trim() || '';

const getAiProvider = () => (import.meta.env.VITE_TRANSACTION_AI_PROVIDER || DEFAULT_PROVIDER).toLowerCase();
const getOpenAiApiKey = () => import.meta.env.VITE_OPENAI_API_KEY;
const getOpenAiModel = () => import.meta.env.VITE_OPENAI_MODEL || DEFAULT_OPENAI_MODEL;
const getGeminiApiKey = () => import.meta.env.VITE_GEMINI_API_KEY;
const getGeminiModel = () => import.meta.env.VITE_GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

const getProviderLabel = (provider) => {
    if (provider === 'gemini') {
        return 'Gemini';
    }

    if (provider === 'endpoint') {
        return 'Custom AI endpoint';
    }

    return 'OpenAI';
};

export const getTransactionAiConfig = () => {
    const endpoint = import.meta.env.VITE_TRANSACTION_AI_ENDPOINT || '';
    const provider = endpoint ? 'endpoint' : getAiProvider();

    return {
        provider,
        providerLabel: getProviderLabel(provider),
        endpoint,
        openAiApiKeyConfigured: Boolean(getOpenAiApiKey()),
        geminiApiKeyConfigured: Boolean(getGeminiApiKey()),
        model:
            provider === 'gemini'
                ? getGeminiModel()
                : provider === 'endpoint'
                    ? 'custom-endpoint'
                    : getOpenAiModel()
    };
};

const requestFromCustomEndpoint = async (endpoint, payload) => {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`AI endpoint failed with status ${response.status}`);
    }

    return response.json();
};

const buildCategoryOptions = (categories) => categories.map((category) => ({
    category_id: Number(category.category_id),
    category_name: category.category_name
}));

const buildInstructionText = () => [
    'You extract Vietnamese personal finance transactions from free-form notes.',
    'Return one item per transaction.',
    'Normalize amounts like 65k = 65000, 1tr = 1000000.',
    'Infer tx_type as income or expense.',
    'Pick category_id only from the provided category options.',
    'If no category is suitable, return null for category_id and an empty string for category_name.',
    'Keep note concise and preserve the original meaning.'
].join(' ');

const requestFromOpenAI = async ({ rawText, categories }) => {
    const apiKey = getOpenAiApiKey();

    if (!apiKey) {
        throw new Error('Missing OpenAI API key');
    }

    const model = getOpenAiModel();
    const categoryOptions = buildCategoryOptions(categories);

    const response = await fetch(OPENAI_RESPONSES_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model,
            input: [
                {
                    role: 'system',
                    content: [
                        {
                            type: 'input_text',
                            text: buildInstructionText()
                        }
                    ]
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'input_text',
                            text: JSON.stringify({
                                raw_text: rawText,
                                categories: categoryOptions
                            })
                        }
                    ]
                }
            ],
            text: {
                format: {
                    type: 'json_schema',
                    name: 'parsed_transactions',
                    strict: true,
                    schema: transactionSchema
                }
            }
        })
    });

    if (!response.ok) {
        throw new Error(`OpenAI request failed with status ${response.status}`);
    }

    const data = await response.json();
    const refusalText = extractRefusalText(data);

    if (refusalText) {
        throw new Error(`OpenAI refused this request: ${refusalText}`);
    }

    const outputText = extractOutputText(data);

    if (!outputText) {
        throw new Error('OpenAI response did not contain output text');
    }

    return JSON.parse(outputText);
};

const requestFromGemini = async ({ rawText, categories }) => {
    const apiKey = getGeminiApiKey();

    if (!apiKey) {
        throw new Error('Missing Gemini API key');
    }

    const model = getGeminiModel();
    const categoryOptions = buildCategoryOptions(categories);

    const response = await fetch(`${GEMINI_API_BASE_URL}/${model}:generateContent`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: [
                                buildInstructionText(),
                                'Return valid JSON only.',
                                JSON.stringify({
                                    raw_text: rawText,
                                    categories: categoryOptions
                                })
                            ].join('\n\n')
                        }
                    ]
                }
            ],
            generationConfig: {
                responseMimeType: 'application/json',
                responseJsonSchema: geminiTransactionSchema
            }
        })
    });

    if (!response.ok) {
        throw new Error(`Gemini request failed with status ${response.status}`);
    }

    const data = await response.json();
    const blockReason = data.promptFeedback?.blockReason;

    if (blockReason) {
        throw new Error(`Gemini blocked this request: ${blockReason}`);
    }

    const outputText = extractGeminiOutputText(data);

    if (!outputText) {
        throw new Error('Gemini response did not contain output text');
    }

    return JSON.parse(outputText);
};

export const parseTransactionsByAi = async ({ rawText, categories }) => {
    const endpoint = import.meta.env.VITE_TRANSACTION_AI_ENDPOINT;
    const payload = { rawText, categories };

    if (endpoint) {
        return requestFromCustomEndpoint(endpoint, payload);
    }

    if (getAiProvider() === 'gemini') {
        return requestFromGemini(payload);
    }

    return requestFromOpenAI(payload);
};
