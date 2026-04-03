import { ModelId } from '@/store/chatStore';

export interface StreamCallbacks {
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

function parseSSE(buffer: string, onChunk: (json: any) => void): string {
  let rest = buffer;
  let idx: number;
  while ((idx = rest.indexOf('\n')) !== -1) {
    let line = rest.slice(0, idx);
    rest = rest.slice(idx + 1);
    if (line.endsWith('\r')) line = line.slice(0, -1);
    if (!line.startsWith('data: ')) continue;
    const data = line.slice(6).trim();
    if (data === '[DONE]') continue;
    try { onChunk(JSON.parse(data)); } catch {}
  }
  return rest;
}

export async function streamGemini(
  apiKey: string,
  prompt: string,
  history: { role: string; content: string }[],
  cb: StreamCallbacks,
  signal?: AbortSignal
) {
  try {
    const messages = [
      ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
      { role: 'user', parts: [{ text: prompt }] }
    ];

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: messages }),
        signal,
      }
    );

    if (!res.ok) {
      const text = await res.text();
      cb.onError(`Gemini error ${res.status}: ${text.slice(0, 200)}`);
      return;
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      buffer = parseSSE(buffer, (json) => {
        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) cb.onDelta(text);
      });
    }
    cb.onDone();
  } catch (e: any) {
    if (e.name !== 'AbortError') cb.onError(e.message);
  }
}

export async function streamOpenAI(
  apiKey: string,
  prompt: string,
  history: { role: string; content: string }[],
  cb: StreamCallbacks,
  signal?: AbortSignal
) {
  try {
    const messages = [
      ...history,
      { role: 'user', content: prompt }
    ];

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        stream: true,
      }),
      signal,
    });

    if (!res.ok) {
      const text = await res.text();
      cb.onError(`GPT error ${res.status}: ${text.slice(0, 200)}`);
      return;
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      buffer = parseSSE(buffer, (json) => {
        const text = json?.choices?.[0]?.delta?.content;
        if (text) cb.onDelta(text);
      });
    }
    cb.onDone();
  } catch (e: any) {
    if (e.name !== 'AbortError') cb.onError(e.message);
  }
}

export async function streamGroq(
  apiKey: string,
  prompt: string,
  history: { role: string; content: string }[],
  cb: StreamCallbacks,
  signal?: AbortSignal
) {
  try {
    const messages = [
      ...history,
      { role: 'user', content: prompt }
    ];

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        stream: true,
      }),
      signal,
    });

    if (!res.ok) {
      const text = await res.text();
      cb.onError(`Groq error ${res.status}: ${text.slice(0, 200)}`);
      return;
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      buffer = parseSSE(buffer, (json) => {
        const text = json?.choices?.[0]?.delta?.content;
        if (text) cb.onDelta(text);
      });
    }
    cb.onDone();
  } catch (e: any) {
    if (e.name !== 'AbortError') cb.onError(e.message);
  }
}

export async function streamHuggingFace(
  apiKey: string,
  prompt: string,
  history: { role: string; content: string }[],
  cb: StreamCallbacks,
  signal?: AbortSignal
) {
  try {
    const res = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ inputs: prompt }),
      signal,
    });

    if (!res.ok) {
      const text = await res.text();
      cb.onError(`HF error ${res.status}: ${text.slice(0, 200)}`);
      return;
    }

    const data = await res.json();
    const text = data[0]?.generated_text || "Error fetching result";
    cb.onDelta(text);
    cb.onDone();
  } catch (e: any) {
    if (e.name !== 'AbortError') cb.onError(e.message);
  }
}

export async function streamClaude(
  apiKey: string,
  prompt: string,
  history: { role: string; content: string }[],
  cb: StreamCallbacks,
  signal?: AbortSignal
) {
  try {
    const messages = [
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: prompt }
    ];

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages,
        stream: true,
      }),
      signal,
    });

    if (!res.ok) {
      const text = await res.text();
      cb.onError(`Claude error ${res.status}: ${text.slice(0, 200)}`);
      return;
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      buffer = parseSSE(buffer, (json) => {
        if (json?.type === 'content_block_delta') {
          const text = json?.delta?.text;
          if (text) cb.onDelta(text);
        }
      });
    }
    cb.onDone();
  } catch (e: any) {
    if (e.name !== 'AbortError') cb.onError(e.message);
  }
}

export async function streamPerplexity(
  apiKey: string,
  prompt: string,
  history: { role: string; content: string }[],
  cb: StreamCallbacks,
  signal?: AbortSignal
) {
  try {
    const messages = [
      ...history,
      { role: 'user', content: prompt }
    ];

    const res = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'sonar',
        messages,
        stream: true,
      }),
      signal,
    });

    if (!res.ok) {
      const text = await res.text();
      cb.onError(`Perplexity error ${res.status}: ${text.slice(0, 200)}`);
      return;
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      buffer = parseSSE(buffer, (json) => {
        const text = json?.choices?.[0]?.delta?.content;
        if (text) cb.onDelta(text);
      });
    }
    cb.onDone();
  } catch (e: any) {
    if (e.name !== 'AbortError') cb.onError(e.message);
  }
}

export interface ModelConfig {
  id: ModelId;
  label: string;
  streamFn: (apiKey: string, prompt: string, history: { role: string; content: string }[], cb: StreamCallbacks, signal?: AbortSignal) => Promise<void>;
  apiKeyField: keyof import('@/store/chatStore').ApiKeys;
}

export const MODEL_CONFIGS: ModelConfig[] = [
  { id: 'gemini', label: 'Gemini 2.5 Flash', streamFn: streamGemini, apiKeyField: 'gemini' },
  { id: 'gpt', label: 'GPT-4o', streamFn: streamOpenAI, apiKeyField: 'openai' },
  { id: 'groq', label: 'Groq (Llama 3)', streamFn: streamGroq, apiKeyField: 'groq' },
  { id: 'huggingface', label: 'HuggingFaceH4/zephyr-7b-beta', streamFn: streamHuggingFace, apiKeyField: 'huggingface' },
  { id: 'claude', label: 'Claude Sonnet 4 (Requires Payment)', streamFn: streamClaude, apiKeyField: 'claude' },
  { id: 'perplexity', label: 'Perplexity Sonar (Requires Payment)', streamFn: streamPerplexity, apiKeyField: 'perplexity' },
];

export function generateJudgeSummary(responses: { model: string; label: string; content: string }[]): string {
  let summary = `## ⚖️ Judge's Verdict\n\n`;
  summary += `| Metric | ${responses.map(r => r.label).join(' | ')} |\n`;
  summary += `|--------${responses.map(() => '|--------').join('')}|\n`;
  summary += `| Response Length | ${responses.map(r => `${r.content.length} chars`).join(' | ')} |\n`;
  
  // FIXED: Removed raw regex backticks that broke compilation, using simple includes
  summary += `| Contains Code | ${responses.map(r => r.content.includes('\`\`\`') ? '✅' : '❌').join(' | ')} |\n`;

  const maxLen = Math.max(...responses.map(r => r.content.length));
  summary += `| Detail Level | ${responses.map(r => r.content.length === maxLen ? '🏆 Most detailed' : 'Concise').join(' | ')} |\n\n`;
  summary += `> ${responses.length} models responded. Review each for accuracy and relevance to your specific use case.`;

  return summary;
}