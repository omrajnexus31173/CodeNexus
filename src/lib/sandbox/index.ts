import { DEFAULT_SANDBOX_LIMITS, ExecutionResult, SandboxLimits, TestCase } from './types';
import { executeIsolated } from './isolated-runner';
import { executeExternal } from './external-adapter';

export * from './types';

/**
 * Unified Sandboxed Code Execution Entrypoint.
 *
 * Checks configuration:
 * - If CODE_RUNNER_MODE === 'external': delegates to isolated remote sandbox cluster.
 * - Otherwise defaults to CODE_RUNNER_MODE === 'sandboxed_local': enforces Linux kernel
 *   resource limits via prlimit, sanitized unprivileged environments, and timeout process group termination.
 */
export async function runInSandbox(
  language: string,
  code: string,
  testCases: TestCase[] = [],
  customLimits?: Partial<SandboxLimits>
): Promise<ExecutionResult> {
  const limits: SandboxLimits = {
    ...DEFAULT_SANDBOX_LIMITS,
    ...customLimits,
  };

  const mode = process.env.CODE_RUNNER_MODE?.trim().toLowerCase();

  if (mode === 'external') {
    return executeExternal(language, code, testCases, limits);
  }

  return executeIsolated(language, code, testCases, limits);
}
