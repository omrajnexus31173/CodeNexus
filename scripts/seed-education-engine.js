/**
 * Code Nexus — Educational Content Engine Database Seeder
 * Updates all course_topics with the 14-section educational curriculum.
 * Safe & idempotent: preserves all existing user progress, enrollments, certificates, and scores.
 */

require('dotenv').config({ path: '.env' });
const { requireDatabaseUrl, databaseSslConfig } = require('./lib/database-url');
const { Pool } = require('pg');
const { masterTopics, masterUnits } = require('./curriculum/master-curriculum');

const pool = new Pool({
  connectionString: requireDatabaseUrl()
});

async function seedEducationEngine() {
  console.log('--- Code Nexus Educational Content Engine Seeder ---');
  console.log(`Total Master Topics to Seed/Update: ${masterTopics.length}`);

  // Ensure all curriculum units exist with correct titles/order BEFORE any
  // topic references them (FK: course_topics.unit_id -> course_units.id).
  // Idempotent: safe to re-run; existing units are refreshed in place.
  for (const unit of masterUnits) {
    await pool.query(
      `INSERT INTO course_units (id, course_id, title, order_index)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE
         SET course_id = EXCLUDED.course_id,
             title = EXCLUDED.title,
             order_index = EXCLUDED.order_index`,
      [unit.id, unit.course_id, unit.title, unit.order_index]
    );
  }
  console.log(`Units ensured: ${masterUnits.length}`);

  let updatedCount = 0;
  let insertedCount = 0;

  for (const topic of masterTopics) {
    const updateQuery = `
      UPDATE course_topics SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        learning_objectives = $3,
        prerequisites = $4,
        expected_outcomes = $5,
        formal_definition = $6,
        content_simple_english = $7,
        hinglish_explanation = $8,
        why_it_matters = $9,
        when_to_use = $10,
        syntax_guide = $11,
        code_example_1_title = $12,
        code_example_1_code = $13,
        code_example_1_explanation = $14,
        code_example_1_output = $15,
        code_example_2_title = $16,
        code_example_2_code = $17,
        code_example_2_explanation = $18,
        code_example_2_output = $19,
        code_example_3_title = $20,
        code_example_3_code = $21,
        code_example_3_explanation = $22,
        code_example_3_output = $23,
        code_walkthrough = $24,
        rules_and_restrictions = $25,
        common_mistakes = $26,
        comparison_table = $27,
        diagram_svg = $28,
        practical_applications = $29,
        quiz_questions = $30,
        key_takeaways = $31,
        quick_revision_notes = $32,
        assignment_prompt = $33,
        assignment_starter_code = $34,
        assignment_solution = $35,
        unit_id = $37,
        order_index = $38,
        validation_status = 'reviewed',
        engine_version = 'v2.0',
        last_reviewed_at = NOW()
      WHERE id = $36
      RETURNING id;
    `;

    const values = [
      topic.title,
      topic.description,
      JSON.stringify(topic.learning_objectives || []),
      JSON.stringify(topic.prerequisites || []),
      JSON.stringify(topic.expected_outcomes || []),
      topic.formal_definition || null,
      topic.content_simple_english || null,
      topic.hinglish_explanation || null,
      topic.why_it_matters || null,
      topic.when_to_use || null,
      JSON.stringify(topic.syntax_guide || {}),
      topic.code_example_1_title || null,
      topic.code_example_1_code || null,
      topic.code_example_1_explanation || null,
      topic.code_example_1_output || null,
      topic.code_example_2_title || null,
      topic.code_example_2_code || null,
      topic.code_example_2_explanation || null,
      topic.code_example_2_output || null,
      topic.code_example_3_title || null,
      topic.code_example_3_code || null,
      topic.code_example_3_explanation || null,
      topic.code_example_3_output || null,
      JSON.stringify(topic.code_walkthrough || {}),
      JSON.stringify(topic.rules_and_restrictions || []),
      JSON.stringify(topic.common_mistakes || []),
      JSON.stringify(topic.comparison_table || {}),
      topic.diagram_svg || null,
      JSON.stringify(topic.practical_applications || []),
      JSON.stringify(topic.quiz_questions || []),
      JSON.stringify(topic.key_takeaways || []),
      topic.quick_revision_notes || null,
      topic.assignment_prompt || null,
      topic.assignment_starter_code || null,
      topic.assignment_solution || null,
      topic.id,
      topic.unit_id,
      topic.order_index
    ];

    const res = await pool.query(updateQuery, values);
    if (res.rowCount > 0) {
      updatedCount++;
    } else {
      // Topic did not exist in DB yet (e.g. additional topic like js-variables-scope-coercion)
      const insertQuery = `
        INSERT INTO course_topics (
          id, course_id, unit_id, title, description, order_index,
          learning_objectives, prerequisites, expected_outcomes,
          formal_definition, content_simple_english, hinglish_explanation,
          why_it_matters, when_to_use, syntax_guide,
          code_example_1_title, code_example_1_code, code_example_1_explanation, code_example_1_output,
          code_example_2_title, code_example_2_code, code_example_2_explanation, code_example_2_output,
          code_example_3_title, code_example_3_code, code_example_3_explanation, code_example_3_output,
          code_walkthrough, rules_and_restrictions, common_mistakes,
          comparison_table, diagram_svg, practical_applications, quiz_questions,
          key_takeaways, quick_revision_notes, assignment_prompt,
          assignment_starter_code, assignment_solution,
          validation_status, engine_version, last_reviewed_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19,
          $20, $21, $22, $23,
          $24, $25, $26, $27,
          $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39,
          'reviewed', 'v2.0', NOW()
        )
        ON CONFLICT (id) DO NOTHING;
      `;

      const insertValues = [
        topic.id,
        topic.course_id,
        topic.unit_id || `${topic.course_id}-unit-1`,
        topic.title,
        topic.description,
        topic.order_index || 99,
        JSON.stringify(topic.learning_objectives || []),
        JSON.stringify(topic.prerequisites || []),
        JSON.stringify(topic.expected_outcomes || []),
        topic.formal_definition || null,
        topic.content_simple_english || null,
        topic.hinglish_explanation || null,
        topic.why_it_matters || null,
        topic.when_to_use || null,
        JSON.stringify(topic.syntax_guide || {}),
        topic.code_example_1_title || null,
        topic.code_example_1_code || null,
        topic.code_example_1_explanation || null,
        topic.code_example_1_output || null,
        topic.code_example_2_title || null,
        topic.code_example_2_code || null,
        topic.code_example_2_explanation || null,
        topic.code_example_2_output || null,
        topic.code_example_3_title || null,
        topic.code_example_3_code || null,
        topic.code_example_3_explanation || null,
        topic.code_example_3_output || null,
        JSON.stringify(topic.code_walkthrough || {}),
        JSON.stringify(topic.rules_and_restrictions || []),
        JSON.stringify(topic.common_mistakes || []),
        JSON.stringify(topic.comparison_table || {}),
        topic.diagram_svg || null,
        JSON.stringify(topic.practical_applications || []),
        JSON.stringify(topic.quiz_questions || []),
        JSON.stringify(topic.key_takeaways || []),
        topic.quick_revision_notes || null,
        topic.assignment_prompt || null,
        topic.assignment_starter_code || null,
        topic.assignment_solution || null
      ];

      await pool.query(insertQuery, insertValues);
      insertedCount++;
    }
  }

  console.log(`Successfully updated ${updatedCount} existing topics.`);
  if (insertedCount > 0) {
    console.log(`Inserted ${insertedCount} new supplementary topics.`);
  }

  // Verification audit
  const auditRes = await pool.query(`
    SELECT 
      COUNT(*) as total_topics,
      COUNT(formal_definition) as with_formal_def,
      COUNT(content_simple_english) as with_english,
      COUNT(hinglish_explanation) as with_hinglish,
      COUNT(code_example_1_code) as with_ex1,
      COUNT(code_example_2_code) as with_ex2,
      COUNT(code_example_3_code) as with_ex3,
      COUNT(diagram_svg) as with_diagrams,
      COUNT(CASE WHEN validation_status = 'reviewed' THEN 1 END) as reviewed_count
    FROM course_topics;
  `);

  console.log('\n--- Educational Engine DB Status Audit ---');
  console.table(auditRes.rows);

  await pool.end();
}

seedEducationEngine().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
