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
    // 1. Gemini specifically requires roles to be ONLY 'user' or 'model'. 
    // It will crash/429 if it sees 'assistant' from our universal chat history.
    const messages = [
      ...history.map(h => ({ 
        role: h.role === 'assistant' ? 'model' : 'user', // Translation fix
        parts: [{ text: h.content }] 
      })),
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
      cb.onError(`Gemini error: ${res.status}`);
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
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [...history, { role: 'user', content: prompt }],
        stream: true,
      }),
      signal,
    });

    if (!res.ok) {
      cb.onError(`OpenAI error: ${res.status}`);
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
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [...history, { role: 'user', content: prompt }],
        stream: true,
      }),
      signal,
    });

    if (!res.ok) {
      cb.onError(`Groq error: ${res.status}`);
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

export async function streamOllama(
  modelName: string,
  prompt: string,
  history: { role: string; content: string }[],
  cb: StreamCallbacks,
  signal?: AbortSignal
) {
  try {
    const model = modelName || 'llama3.2';
    const res = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        messages: [...history, { role: 'user', content: prompt }],
        stream: true,
      }),
      signal,
    });

    if (!res.ok) {
      cb.onError("Ollama not found. Make sure the Ollama app is running.");
      return;
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          if (json.message?.content) cb.onDelta(json.message.content);
          if (json.done) cb.onDone();
        } catch (e) {}
      }
    }
  } catch (e: any) {
    // FIXED: Only show error if it wasn't purposefully stopped by the user!
    if (e.name !== 'AbortError') {
      cb.onError("Ensure Ollama is installed and running locally.");
    }
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
        messages: [...history.map(h => ({ role: h.role, content: h.content })), { role: 'user', content: prompt }],
        stream: true,
      }),
      signal,
    });

    if (!res.ok) {
      cb.onError(`Claude error: ${res.status}`);
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
    const res = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [...history, { role: 'user', content: prompt }],
        stream: true,
      }),
      signal,
    });

    if (!res.ok) {
      cb.onError(`Perplexity error: ${res.status}`);
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
  { id: 'gpt', label: 'ChatGPT (GPT-4o mini)', streamFn: streamOpenAI, apiKeyField: 'openai' },
  { id: 'ollama', label: 'Ollama (Local Free) [Needs installation to work]', streamFn: streamOllama, apiKeyField: 'ollama' },
  { id: 'groq', label: 'Groq (Llama 3)', streamFn: streamGroq, apiKeyField: 'groq' },
  { id: 'claude', label: 'Claude Sonnet 4 (Requires Payment)', streamFn: streamClaude, apiKeyField: 'claude' },
  { id: 'perplexity', label: 'Perplexity Sonar (Requires Payment)', streamFn: streamPerplexity, apiKeyField: 'perplexity' },
];

export function generateJudgeSummary(responses: { model: string; label: string; content: string }[]): string {
  let summary = `## ⚖️ Judge's Verdict\n\n`;
  summary += `| Metric | ${responses.map(r => r.label).join(' | ')} |\n`;
  summary += `|--------${responses.map(() => '|--------').join('')}|\n`;
  summary += `| Response Length | ${responses.map(r => `${r.content.length} chars`).join(' | ')} |\n`;
  summary += `| Contains Code | ${responses.map(r => r.content.includes('\`\`\`') ? '✅' : '❌').join(' | ')} |\n`;

  const maxLen = Math.max(...responses.map(r => r.content.length));
  summary += `| Detail Level | ${responses.map(r => r.content.length === maxLen ? '🏆 Most detailed' : 'Concise').join(' | ')} |\n\n`;
  summary += `> ${responses.length} models responded. Review each for accuracy and relevance to your specific use case.`;

  return summary;
}