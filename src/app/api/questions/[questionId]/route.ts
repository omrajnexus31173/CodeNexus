import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { progressionForDifficulty } from '@/lib/questionTaxonomy';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params;
    const userPayload = getUserFromRequest(req);

    const qRes = await query(`SELECT * FROM questions WHERE id = $1`, [questionId]);
    if (qRes.rows.length === 0) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const question = qRes.rows[0];

    // Check user attempt
    let userAttempt = null;
    if (userPayload) {
      const attemptRes = await query(
        `SELECT * FROM user_question_attempts WHERE user_id = $1 AND question_id = $2`,
        [userPayload.id, question.id]
      );
      if (attemptRes.rows.length > 0) {
        userAttempt = attemptRes.rows[0];
      }
    }

    // Expose visible test cases only (hide hidden test cases inputs/outputs)
    const rawTestCases = Array.isArray(question.test_cases)
      ? question.test_cases
      : JSON.parse(question.test_cases || '[]');

    const publicTestCases = rawTestCases
      .filter((tc: any) => !tc.is_hidden)
      .map((tc: any, index: number) => ({
        index: index + 1,
        input: tc.input,
        expected_output: tc.expected_output,
      }));

    // Only expose reference solution if user already solved it or revealed it.
    // Hints are similarly gated: they are returned only after the matching
    // paid hint has been unlocked (or once the solution itself is visible).
    const canSeeSolution =
      userAttempt?.status === 'solved' || userAttempt?.revealed_solution === true;
    const hintsUsed = Number(userAttempt?.hints_used || 0);

    return NextResponse.json({
      question: {
        id: question.id,
        language: question.language,
        course_id: question.course_id,
        topic_id: question.topic_id,
        difficulty: question.difficulty,
        title: question.title,
        statement: question.statement,
        input_format: question.input_format,
        output_format: question.output_format,
        constraints: question.constraints,
        sample_input: question.sample_input,
        sample_output: question.sample_output,
        starter_code: question.starter_code,
        hint_1: canSeeSolution || hintsUsed >= 1 ? question.hint_1 : null,
        hint_2: canSeeSolution || hintsUsed >= 2 ? question.hint_2 : null,
        expected_time_complexity: question.expected_time_complexity,
        expected_space_complexity: question.expected_space_complexity,
        progression: progressionForDifficulty(question.difficulty),
        validation_status: question.validation_status,
        is_exam_eligible: question.is_exam_eligible,
        task_type: question.task_type,
        runtime: question.runtime,
        input_contract: question.input_contract,
        mapping_status: question.mapping_status,
        practice_only: question.practice_only,
        // Difficulty rationales can mention the intended technique, so they
        // use the same solved/revealed gate as the explanation.
        difficulty_rationale: canSeeSolution ? question.difficulty_rationale : null,
        generation_schema_version: question.generation_schema_version,
        taxonomy_version: question.taxonomy_version,
        tags: question.tags,
        publicTestCases,
        totalTestCasesCount: rawTestCases.length,
        reference_solution: canSeeSolution ? question.reference_solution : null,
        solution_explanation: canSeeSolution ? question.solution_explanation : null,
      },
      userAttempt,
    });
  } catch (err: any) {
    console.error('Question detail GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
