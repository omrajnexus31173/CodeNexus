import { NextRequest, NextResponse } from 'next/server';
import { getClient, query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { executeCode } from '@/lib/runner';
import { adjustPointsWithLedger } from '@/lib/db';

export async function POST(req: NextRequest) {
  const userPayload = getUserFromRequest(req);
  if (!userPayload) {
    return NextResponse.json({ error: 'Unauthorized. Please login to submit code.' }, { status: 401 });
  }

  const client = await getClient();
  try {
    const { question_id, code, language, action, hint_number } = await req.json();

    if (!question_id) {
      return NextResponse.json({ error: 'question_id is required' }, { status: 400 });
    }

    const qRes = await query('SELECT * FROM questions WHERE id = $1', [question_id]);
    if (qRes.rows.length === 0) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
    const question = qRes.rows[0];

    // Fetch existing attempt
    const attemptRes = await query(
      'SELECT * FROM user_question_attempts WHERE user_id = $1 AND question_id = $2',
      [userPayload.id, question_id]
    );
    const existingAttempt = attemptRes.rows[0] || null;

    // --- ACTION: USE HINT ---
    if (action === 'use_hint') {
      const currentHints = existingAttempt ? existingAttempt.hints_used : 0;
      const targetHint = Math.min(2, Math.max(currentHints, hint_number || 1));

      await client.query(
        `INSERT INTO user_question_attempts (user_id, question_id, hints_used, language, status)
         VALUES ($1, $2, $3, $4, 'attempted')
         ON CONFLICT (user_id, question_id) DO UPDATE SET
           hints_used = GREATEST(user_question_attempts.hints_used, EXCLUDED.hints_used),
           updated_at = NOW();`,
        [userPayload.id, question_id, targetHint, language || question.language]
      );

      return NextResponse.json({
        success: true,
        hints_used: targetHint,
        hintText: targetHint === 1 ? question.hint_1 : question.hint_2,
      });
    }

    // --- ACTION: REVEAL SOLUTION ---
    if (action === 'reveal') {
      await client.query(
        `INSERT INTO user_question_attempts (user_id, question_id, revealed_solution, status, language)
         VALUES ($1, $2, true, 'revealed', $3)
         ON CONFLICT (user_id, question_id) DO UPDATE SET
           revealed_solution = true,
           status = CASE WHEN user_question_attempts.status = 'solved' THEN 'solved' ELSE 'revealed' END,
           updated_at = NOW();`,
        [userPayload.id, question_id, language || question.language]
      );

      return NextResponse.json({
        success: true,
        reference_solution: question.reference_solution,
        solution_explanation: question.solution_explanation,
        message: 'Solution revealed. According to Code Nexus rules, no practice points will be awarded for this question.',
      });
    }

    // --- ACTION: CODE SUBMISSION ---
    if (!code) {
      return NextResponse.json({ error: 'Code is required for submission.' }, { status: 400 });
    }

    const testCases = Array.isArray(question.test_cases)
      ? question.test_cases
      : JSON.parse(question.test_cases || '[]');

    // Run code through the isolated execution runner against all test cases
    const runResult = await executeCode(language || question.language, code, testCases);

    const isAllPassed = runResult.status === 'Accepted';

    await client.query('BEGIN');

    let pointsToAward = 0;
    let newlySolved = false;

    const alreadySolved = existingAttempt && existingAttempt.status === 'solved';
    const hasRevealed = existingAttempt && existingAttempt.revealed_solution;
    const hintsUsed = existingAttempt ? existingAttempt.hints_used : 0;

    if (isAllPassed) {
      if (!alreadySolved) {
        newlySolved = true;
        if (!hasRevealed) {
          // Rule: 4 points - 1 per hint used (min 2 points if 2 hints used, max 4 points if 0 hints used)
          pointsToAward = Math.max(1, 4 - hintsUsed);

          // Atomic point adjustment & auditable ledger entry
          await adjustPointsWithLedger(
            client,
            userPayload.id,
            pointsToAward,
            'PRACTICE_SOLVED',
            'question',
            question_id
          );
        } else {
          // User revealed answer before solving: 0 points awarded
          pointsToAward = 0;
        }
      }

      await client.query(
        `INSERT INTO user_question_attempts (
           user_id, question_id, status, points_awarded, submitted_code, language, updated_at
         ) VALUES ($1, $2, 'solved', $3, $4, $5, NOW())
         ON CONFLICT (user_id, question_id) DO UPDATE SET
           status = 'solved',
           points_awarded = CASE WHEN user_question_attempts.status = 'solved' THEN user_question_attempts.points_awarded ELSE EXCLUDED.points_awarded END,
           submitted_code = EXCLUDED.submitted_code,
           language = EXCLUDED.language,
           updated_at = NOW();`,
        [userPayload.id, question_id, pointsToAward, code, language || question.language]
      );
    } else {
      // Failed attempt
      await client.query(
        `INSERT INTO user_question_attempts (
           user_id, question_id, status, submitted_code, language, updated_at
         ) VALUES ($1, $2, 'attempted', $3, $4, NOW())
         ON CONFLICT (user_id, question_id) DO UPDATE SET
           status = CASE WHEN user_question_attempts.status = 'solved' THEN 'solved' ELSE 'attempted' END,
           submitted_code = EXCLUDED.submitted_code,
           language = EXCLUDED.language,
           updated_at = NOW();`,
        [userPayload.id, question_id, code, language || question.language]
      );
    }

    await client.query('COMMIT');

    // Filter testCaseResults so hidden test cases don't leak input/output
    const sanitizedTestCases = runResult.testCaseResults?.map((tc) => ({
      testCaseIndex: tc.testCaseIndex,
      passed: tc.passed,
      is_hidden: tc.is_hidden,
      input: tc.is_hidden ? '[Hidden Test Case]' : tc.input,
      expectedOutput: tc.is_hidden ? '[Hidden Test Case]' : tc.expectedOutput,
      actualOutput: tc.is_hidden ? (tc.passed ? 'Matches expected' : 'Wrong answer') : tc.actualOutput,
    }));

    return NextResponse.json({
      status: runResult.status,
      allPassed: isAllPassed,
      executionTimeMs: runResult.executionTimeMs,
      stderr: runResult.stderr,
      testCaseResults: sanitizedTestCases,
      pointsAwarded: pointsToAward,
      newlySolved,
      hintsUsed,
      hasRevealed,
      message: isAllPassed
        ? newlySolved
          ? hasRevealed
            ? 'Correct! (0 points awarded because solution was previously revealed)'
            : `Accepted! +${pointsToAward} Points awarded to your profile!`
          : 'Accepted! (Already solved previously)'
        : 'Some test cases failed. Review output and try again.',
    });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('Submit practice error:', err);
    return NextResponse.json({ error: 'Failed to process submission' }, { status: 500 });
  } finally {
    client.release();
  }
}
