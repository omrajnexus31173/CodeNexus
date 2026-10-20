export const SUPPORTED_EXAM_COURSE_IDS = [
  'c-lang',
  'cpp',
  'python',
  'java',
  'javascript',
  'sql-databases',
  'dsa',
  'system-design',
] as const;

export const PROGRESSION_BY_DIFFICULTY: Record<string, 'Beginner' | 'Intermediate' | 'Advanced'> = {
  Easy: 'Beginner',
  Medium: 'Intermediate',
  Hard: 'Advanced',
};

export const DIFFICULTY_BY_PROGRESSION: Record<string, 'Easy' | 'Medium' | 'Hard'> = {
  Beginner: 'Easy',
  Intermediate: 'Medium',
  Advanced: 'Hard',
};

export function progressionForDifficulty(difficulty: string | null | undefined) {
  return PROGRESSION_BY_DIFFICULTY[String(difficulty || '')] || null;
}

export function isExamSupportedCourse(courseId: string | null | undefined) {
  return SUPPORTED_EXAM_COURSE_IDS.includes(courseId as (typeof SUPPORTED_EXAM_COURSE_IDS)[number]);
}

export const UNSUPPORTED_EXAM_REASONS: Record<string, string> = {
  'html-css': 'No deterministic browser-rendering grader is integrated for certificate exams.',
  'app-dev': 'No Dart/Flutter runtime is available in the sandbox.',
};

export function unsupportedExamReason(courseId: string | null | undefined) {
  return UNSUPPORTED_EXAM_REASONS[String(courseId || '')] || 'This track does not offer a sandbox-graded certificate exam.';
}
