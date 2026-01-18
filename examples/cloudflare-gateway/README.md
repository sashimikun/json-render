# Cloudflare AI Gateway Example

This example demonstrates how to use [Cloudflare AI Gateway](https://developers.cloudflare.com/ai-gateway/) with `@json-render` to generate UI components.

Unlike the default dashboard example which uses the Vercel AI SDK, this example makes direct API calls to Cloudflare AI Gateway, which then proxies requests to Anthropic.

## Prerequisites

1.  **Cloudflare Account**: You need a Cloudflare account.
2.  **AI Gateway**: Create a new AI Gateway in the Cloudflare dashboard.
3.  **Anthropic API Key**: You need an API key from Anthropic.

## Setup

1.  Copy `.env.example` to `.env.local`:

    ```bash
    cp .env.example .env.local
    ```

2.  Fill in the environment variables:

    -   `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare Account ID (found in the URL of your Cloudflare dashboard).
    -   `CLOUDFLARE_GATEWAY_NAME`: The slug/name of the AI Gateway you created.
    -   `ANTHROPIC_API_KEY`: Your Anthropic API Key.

## Running the Example

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Implementation Details

The core logic is in `app/api/generate/route.ts`. It replaces the `ai` library's `streamText` with a native `fetch` call to Cloudflare AI Gateway.

The response from Cloudflare (proxying Anthropic) is a Server-Sent Events (SSE) stream. The API route parses this stream to extract the text deltas and streams them to the client in a format compatible with `useUIStream`.
