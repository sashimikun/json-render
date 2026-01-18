import Link from "next/link";
import { Code } from "@/components/code";

export const metadata = {
  title: "AI SDK Integration | json-render",
};

export default function AiSdkPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-4">AI SDK Integration</h1>
      <p className="text-muted-foreground mb-8">
        Use json-render with the Vercel AI SDK for seamless streaming.
      </p>

      <h2 className="text-xl font-semibold mt-12 mb-4">Installation</h2>
      <Code lang="bash">npm install ai</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">API Route Setup</h2>
      <Code lang="typescript">{`// app/api/generate/route.ts
import { streamText } from 'ai';
import { generateCatalogPrompt } from '@json-render/core';
import { catalog } from '@/lib/catalog';

export async function POST(req: Request) {
  const { prompt, currentTree } = await req.json();
  
  const systemPrompt = generateCatalogPrompt(catalog);
  
  // Optionally include current UI state for context
  const contextPrompt = currentTree 
    ? \`\\n\\nCurrent UI state:\\n\${JSON.stringify(currentTree, null, 2)}\`
    : '';

  const result = streamText({
    model: process.env.AI_GATEWAY_MODEL || 'anthropic/claude-haiku-4.5',
    system: systemPrompt + contextPrompt,
    prompt,
  });

  return new Response(result.textStream, {
    headers: { 
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  });
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">Choosing a Model</h2>
      <p className="text-sm text-muted-foreground mb-4">
        We recommend starting with smaller, faster models like Haiku for most UI
        generation tasks. Use the{" "}
        <code className="text-foreground">AI_GATEWAY_MODEL</code> environment
        variable to switch models without changing code.
      </p>

      <div className="my-6 w-full overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left font-medium py-2">Model</th>
              <th className="text-left font-medium py-2">Best For</th>
              <th className="text-left font-medium py-2">Cost</th>
              <th className="text-left font-medium py-2">Speed</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2">claude-haiku-4.5</td>
              <td className="py-2">Most UI tasks, fast iterations</td>
              <td className="py-2">$</td>
              <td className="py-2">Fastest</td>
            </tr>
            <tr className="border-b">
              <td className="py-2">claude-3-5-sonnet</td>
              <td className="py-2">Complex logic, creative layouts</td>
              <td className="py-2">$$</td>
              <td className="py-2">Fast</td>
            </tr>
            <tr className="border-b">
              <td className="py-2">claude-3-opus</td>
              <td className="py-2">Complex reasoning (overkill for UI)</td>
              <td className="py-2">$$$</td>
              <td className="py-2">Slow</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        See the full list of available models in the{" "}
        <a
          href="https://vercel.com/docs/ai/models"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:underline"
        >
          Vercel AI Gateway documentation
        </a>
        .
      </p>

      <h2 className="text-xl font-semibold mt-12 mb-4">Client-Side Hook</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Use <code className="text-foreground">useUIStream</code> on the client:
      </p>
      <Code lang="tsx">{`'use client';

import { useUIStream } from '@json-render/react';

function GenerativeUI() {
  const { tree, isLoading, error, generate } = useUIStream({
    endpoint: '/api/generate',
  });

  return (
    <div>
      <button 
        onClick={() => generate('Create a dashboard with metrics')}
        disabled={isLoading}
      >
        {isLoading ? 'Generating...' : 'Generate'}
      </button>
      
      {error && <p className="text-red-500">{error.message}</p>}
      
      <Renderer tree={tree} registry={registry} />
    </div>
  );
}`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">Prompt Engineering</h2>
      <p className="text-sm text-muted-foreground mb-4">
        The <code className="text-foreground">generateCatalogPrompt</code>{" "}
        function creates an optimized prompt that:
      </p>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
        <li>Lists all available components and their props</li>
        <li>Describes available actions</li>
        <li>Specifies the expected JSON output format</li>
        <li>Includes examples for better generation</li>
      </ul>

      <h2 className="text-xl font-semibold mt-12 mb-4">
        Custom System Prompts
      </h2>
      <Code lang="typescript">{`const basePrompt = generateCatalogPrompt(catalog);

const customPrompt = \`
\${basePrompt}

Additional instructions:
- Always use Card components for grouping related content
- Prefer horizontal layouts (Row) for metrics
- Use consistent spacing with padding="md"
\`;`}</Code>

      <h2 className="text-xl font-semibold mt-12 mb-4">Next</h2>
      <p className="text-sm text-muted-foreground">
        Learn about{" "}
        <Link
          href="/docs/streaming"
          className="text-foreground hover:underline"
        >
          progressive streaming
        </Link>
        .
      </p>
    </article>
  );
}
