import { ExecutionResult, SandboxLimits, TestCase } from './types';
import { isProduction } from '../env';

function isLoopbackHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function truncate(value: unknown, maxBytes: number): string {
  const text = typeof value === 'string' ? value : '';
  return text.length > maxBytes ? text.slice(0, maxBytes) : text;
}

/**
 * Adapter for an external isolated execution service. Production requires
 * HTTPS (except an explicitly local loopback service) and an API key.
 */
export async function executeExternal(
  language: string,
  code: string,
  testCases: TestCase[] = [],
  limits: SandboxLimits
): Promise<ExecutionResult> {
  const serviceUrl = process.env.CODE_EXECUTION_SERVICE_URL?.trim();
  const apiKey = process.env.CODE_EXECUTION_API_KEY?.trim();

  if (!serviceUrl) {
    return {
      stdout: '',
      stderr: 'External code execution service is not configured.',
      exitCode: 1,
      executionTimeMs: 0,
      status: 'Configuration Error',
      sandboxMode: 'external',
    };
  }

  let parsedServiceUrl: URL;
  try {
    parsedServiceUrl = new URL(serviceUrl);
  } catch {
    return {
      stdout: '',
      stderr: 'External code execution service URL is invalid.',
      exitCode: 1,
      executionTimeMs: 0,
      status: 'Configuration Error',
      sandboxMode: 'external',
    };
  }

  if (
    (parsedServiceUrl.protocol !== 'https:' && parsedServiceUrl.protocol !== 'http:') ||
    (isProduction() && parsedServiceUrl.protocol !== 'https:' && !isLoopbackHost(parsedServiceUrl.hostname)) ||
    (isProduction() && !apiKey)
  ) {
    return {
      stdout: '',
      stderr: 'External code execution service must use HTTPS and an API key in production.',
      exitCode: 1,
      executionTimeMs: 0,
      status: 'Configuration Error',
      sandboxMode: 'external',
    };
  }

  const controller = new AbortController();
  const boundedCases = Math.max(1, Math.min(testCases.length || 1, 20));
  const timeoutMs = Math.min(180_000, Math.max(10_000, limits.timeoutMs * boundedCases + 10_000));
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const endpoint = new URL('execute', `${parsedServiceUrl.toString().replace(/\/+$/, '')}/`);
    const response = await fetch(endpoint, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        language,
        code,
        testCases,
        limits: {
          timeoutMs: limits.timeoutMs,
          maxMemoryBytes: limits.maxMemoryBytes,
          maxOutputBytes: limits.maxOutputBytes,
        },
      }),
    });

    if (!response.ok) {
      return {
        stdout: '',
        stderr: 'External execution service rejected the request.',
        exitCode: 1,
        executionTimeMs: 0,
        status: 'Runtime Error',
        sandboxMode: 'external',
      };
    }

    const data = await response.json();
    const stdout = truncate(data.stdout, limits.maxOutputBytes);
    const stderr = truncate(data.stderr, limits.maxOutputBytes);
    return {
      stdout,
      stderr,
      exitCode: typeof data.exitCode === 'number' ? data.exitCode : 0,
      executionTimeMs: typeof data.executionTimeMs === 'number' ? data.executionTimeMs : 0,
      status: data.status || 'Accepted',
      testCaseResults: data.testCaseResults,
      truncated: Boolean(data.truncated) || stdout.length !== String(data.stdout || '').length || stderr.length !== String(data.stderr || '').length,
      sandboxMode: 'external',
    };
  } catch {
    return {
      stdout: '',
      stderr: 'Failed to connect to the external execution service.',
      exitCode: 1,
      executionTimeMs: 0,
      status: 'Runtime Error',
      sandboxMode: 'external',
    };
  } finally {
    clearTimeout(timer);
  }
}
