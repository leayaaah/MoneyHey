const OPENAI_RESPONSES_ENDPOINT = 'https://api.openai.com/v1/responses';
const DEFAULT_MODEL = 'gpt-5.4-nano';

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

const extractOutputText = (response) => {
    if (typeof response.output_text === 'string' && response.output_text.trim()) {
        return response.output_text;
    }

    const messageItem = response.output?.find((item) => item.type === 'message');
    const textItem = messageItem?.content?.find((item) => item.type === 'output_text');
    return textItem?.text || '';
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

const requestFromOpenAI = async ({ rawText, categories }) => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (!apiKey) {
        throw new Error('Missing OpenAI API key');
    }

    const model = import.meta.env.VITE_OPENAI_MODEL || DEFAULT_MODEL;
    const categoryOptions = categories.map((category) => ({
        category_id: Number(category.category_id),
        category_name: category.category_name
    }));

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
                            text: [
                                'You extract Vietnamese personal finance transactions from free-form notes.',
                                'Return one item per transaction.',
                                'Normalize amounts like 65k = 65000, 1tr = 1000000.',
                                'Infer tx_type as income or expense.',
                                'Pick category_id only from the provided category options.',
                                'If no category is suitable, return null for category_id and an empty string for category_name.',
                                'Keep note concise and preserve the original meaning.'
                            ].join(' ')
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
    const outputText = extractOutputText(data);

    if (!outputText) {
        throw new Error('OpenAI response did not contain output text');
    }

    return JSON.parse(outputText);
};

export const parseTransactionsByAi = async ({ rawText, categories }) => {
    const endpoint = import.meta.env.VITE_TRANSACTION_AI_ENDPOINT;
    const payload = { rawText, categories };

    if (endpoint) {
        return requestFromCustomEndpoint(endpoint, payload);
    }

    return requestFromOpenAI(payload);
};
