import { NextRequest, NextResponse } from 'next/server';
import { executeCode } from '@/lib/runner';
import type { TestCase } from '@/lib/sandbox/types';

const MAX_CODE_BYTES = 64 * 1024;
const MAX_TEST_CASES = 20;
const MAX_TEST_FIELD_CHARS = 64 * 1024;
const MAX_TOTAL_TEST_CHARS = 256 * 1024;
const MAX_REQUEST_BYTES = 1024 * 1024;
const MAX_CONCURRENT_EXECUTIONS = 4;
const MAX_QUEUED_EXECUTIONS = 20;

let activeExecutions = 0;
const executionWaiters: Array<() => void> = [];

async function acquireExecutionSlot(): Promise<boolean> {
  if (activeExecutions < MAX_CONCURRENT_EXECUTIONS) {
    activeExecutions += 1;
    return true;
  }
  if (executionWaiters.length >= MAX_QUEUED_EXECUTIONS) return false;
  await new Promise<void>((resolve) => executionWaiters.push(resolve));
  activeExecutions += 1;
  return true;
}

function releaseExecutionSlot(): void {
  activeExecutions = Math.max(0, activeExecutions - 1);
  executionWaiters.shift()?.();
}

function validateTestCases(value: unknown): TestCase[] | string {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) return 'testCases must be an array.';
  if (value.length > MAX_TEST_CASES) {
    return `At most ${MAX_TEST_CASES} test cases may be submitted per execution.`;
  }

  let totalChars = 0;
  const validated: TestCase[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      return 'Each test case must be an object.';
    }
    const candidate = item as Record<string, unknown>;
    const input = candidate.input ?? '';
    const expected = candidate.expected_output ?? '';
    if (typeof input !== 'string' || typeof expected !== 'string') {
      return 'Test-case input and expected_output must be strings.';
    }
    if (input.length > MAX_TEST_FIELD_CHARS || expected.length > MAX_TEST_FIELD_CHARS) {
      return 'A test-case input or expected output exceeds the 64 KB limit.';
    }
    totalChars += input.length + expected.length;
    if (totalChars > MAX_TOTAL_TEST_CHARS) {
      return 'The combined test-case payload exceeds the 256 KB limit.';
    }
    validated.push({
      input,
      expected_output: expected,
      is_hidden: candidate.is_hidden === true,
    });
  }
  return validated;
}

export async function POST(req: NextRequest) {
  let slotAcquired = false;
  try {
    const contentLength = Number(req.headers.get('content-length') || 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
      return NextResponse.json({ error: 'Execution request is too large.' }, { status: 413 });
    }

    const body = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'A JSON execution request is required.' }, { status: 400 });
    }

    const { language, code, customInput, testCases } = body as Record<string, unknown>;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Code is required.' }, { status: 400 });
    }
    if (!language || typeof language !== 'string' || language.length > 30) {
      return NextResponse.json({ error: 'Language is required.' }, { status: 400 });
    }
    if (Buffer.byteLength(code, 'utf8') > MAX_CODE_BYTES) {
      return NextResponse.json(
        { error: 'Submitted code exceeds maximum limit of 64 KB.' },
        { status: 400 }
      );
    }
    if (customInput !== undefined && customInput !== null) {
      if (typeof customInput !== 'string' || customInput.length > MAX_TEST_FIELD_CHARS) {
        return NextResponse.json(
          { error: 'Custom input must be a string no larger than 64 KB.' },
          { status: 400 }
        );
      }
    }

    const validatedCases = validateTestCases(testCases);
    if (typeof validatedCases === 'string') {
      return NextResponse.json({ error: validatedCases }, { status: 400 });
    }

    let casesToRun = validatedCases;
    if (typeof customInput === 'string' && customInput.trim() !== '') {
      casesToRun = [{ input: customInput, expected_output: '', is_hidden: false }];
    }

    slotAcquired = await acquireExecutionSlot();
    if (!slotAcquired) {
      return NextResponse.json(
        { error: 'The execution service is busy. Please retry shortly.' },
        { status: 429 }
      );
    }

    const result = await executeCode(language, code, casesToRun);
    if (result.status === 'Configuration Error') {
      return NextResponse.json(result, { status: 503 });
    }
    return NextResponse.json(result);
  } catch {
    console.error('Code execution endpoint error.');
    return NextResponse.json(
      {
        stdout: '',
        stderr: 'Execution error',
        exitCode: 1,
        executionTimeMs: 0,
        status: 'Runtime Error',
      },
      { status: 500 }
    );
  } finally {
    if (slotAcquired) releaseExecutionSlot();
  }
}
