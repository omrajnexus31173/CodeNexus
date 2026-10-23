-- Code Nexus question-bank count verification (read-only SELECT statements).
-- Run against the database you want to verify. This file never writes.

-- 1. Headline counts.
SELECT
  current_database() AS database_name,
  COUNT(*) AS total_questions,
  COUNT(*) FILTER (WHERE validation_status = 'tested') AS tested_questions,
  COUNT(*) FILTER (WHERE validation_status = 'generated') AS generated_questions,
  COUNT(*) FILTER (WHERE is_exam_eligible) AS exam_eligible_questions,
  COUNT(*) FILTER (
    WHERE validation_status <> 'tested' AND is_exam_eligible
  ) AS non_tested_eligible_questions,
  COUNT(*) FILTER (
    WHERE validation_status = 'generated' AND is_exam_eligible
  ) AS generated_eligible_questions
FROM public.questions;

-- 2. Counts by course and validation status.
SELECT
  course_id,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE validation_status = 'tested') AS tested,
  COUNT(*) FILTER (WHERE validation_status = 'generated') AS generated,
  COUNT(*) FILTER (
    WHERE validation_status = 'tested'
      AND is_exam_eligible
      AND NOT practice_only
  ) AS strict_exam_pool
FROM public.questions
GROUP BY course_id
ORDER BY course_id;

-- 3. Counts by generation/insertion cohort (inferred from the preserved IDs).
SELECT
  CASE
    WHEN id LIKE 'core-%' THEN 'verified-core (core-*)'
    WHEN id LIKE 'topic-%' THEN 'topic-linked (topic-*)'
    WHEN id LIKE '%-bank-%' THEN 'pipeline-bank (*-bank-*)'
    ELSE 'original-seed (all other IDs)'
  END AS cohort,
  COUNT(*) AS rows
FROM public.questions
GROUP BY 1
ORDER BY 1;

-- 4. Mapping integrity.
SELECT
  (SELECT COUNT(*) FROM public.courses) AS courses,
  (SELECT COUNT(*) FROM public.course_topics) AS topics,
  (
    SELECT COUNT(*)
    FROM public.questions q
    LEFT JOIN public.courses c ON c.id = q.course_id
    WHERE c.id IS NULL
  ) AS questions_missing_course,
  (
    SELECT COUNT(*)
    FROM public.questions q
    WHERE q.mapping_status = 'mapped'
      AND q.topic_id IS NULL
  ) AS mapped_questions_missing_topic,
  (
    SELECT COUNT(*)
    FROM public.questions q
    JOIN public.course_topics t ON t.id = q.topic_id
    WHERE t.course_id <> q.course_id
  ) AS topic_course_mismatches,
  (
    SELECT COUNT(*)
    FROM public.questions
    WHERE mapping_status = 'unassigned'
      AND topic_id IS NOT NULL
  ) AS unassigned_questions_with_topic;

-- 5. Mapping status distribution.
SELECT
  mapping_status,
  validation_status,
  COUNT(*) AS rows,
  COUNT(*) FILTER (WHERE topic_id IS NOT NULL) AS rows_with_topic,
  COUNT(*) FILTER (WHERE is_exam_eligible) AS eligible
FROM public.questions
GROUP BY mapping_status, validation_status
ORDER BY mapping_status, validation_status;

-- 6. User-table count is intentionally reported separately to prove that a
-- fresh question-bank verification database contains no imported learners.
-- On a real production database this value may legitimately be non-zero;
-- the question-bank exporter never reads or exports this table's rows.
SELECT COUNT(*) AS user_rows_not_part_of_question_export
FROM public.users;
