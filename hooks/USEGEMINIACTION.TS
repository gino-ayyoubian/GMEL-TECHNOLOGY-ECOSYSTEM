import { useState } from 'react';
import { generateText } from '../services/geminiService';

export type GeminiStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

export function useGeminiAction() {
  const [status, setStatus] = useState<GeminiStatus>('idle');
  const [data, setData] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  async function run(prompt: string) {
    if (!prompt.trim()) {
      setStatus('empty');
      return;
    }

    setStatus('loading');
    setError(undefined);
    setData(undefined);

    try {
      const result = await generateText(prompt);
      
      if (!result || result.trim().length < 3) {
        setStatus('empty');
      } else {
        setStatus('success');
        setData(result);
      }
    } catch (err: any) {
      setStatus('error');
      const message = err?.message || 'An unknown error occurred.';
      setError(message);
    }
  }

  return {
    status,
    data,
    error,
    run,
    isIdle: status === 'idle',
    isLoading: status === 'loading',
    isError: status === 'error',
    isEmpty: status === 'empty',
    isSuccess: status === 'success',
  };
}
