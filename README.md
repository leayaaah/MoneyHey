# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## AI Quick Transaction Parsing

The transaction modal supports parsing long free-form notes into multiple transactions with either OpenAI or Gemini.

1. Copy `.env.example` to `.env`.
2. Choose a provider with `VITE_TRANSACTION_AI_PROVIDER=openai` or `VITE_TRANSACTION_AI_PROVIDER=gemini`.
3. For local testing, set either `VITE_OPENAI_API_KEY` or `VITE_GEMINI_API_KEY` depending on the provider you selected.
4. Optionally change `VITE_OPENAI_MODEL` or `VITE_GEMINI_MODEL`.
5. If you already have your own backend or edge function, set `VITE_TRANSACTION_AI_ENDPOINT` to override the built-in provider flow.

Example input:

```text
uống phúc long hết 65k, ăn mỳ cay hết 79k, mua áo hết 100k
```

Suggested defaults:

- OpenAI: `gpt-5.4-nano`
- Gemini: `gemini-2.5-flash`

Important: API keys should not be exposed in client-side browser code for production. Use `VITE_OPENAI_API_KEY` or `VITE_GEMINI_API_KEY` only for local development; production should go through your own server or edge function.
