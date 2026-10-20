'use strict';
/**
 * Expansion topic builder.
 * Converts a compact, hand-authored topic specification into the full
 * 14-section curriculum object shape used by master-curriculum.js.
 * Every textual field value still comes from the per-topic spec — the builder
 * only assembles structure; it does not invent lesson prose.
 */
const {
  createPointerMemorySvg,
  createMemoryLayoutSvg,
  createSqlJoinSvg,
  createEventLoopSvg,
  createControlFlowSvg,
  createBoxModelSvg,
} = require('../diagrams');

function buildDiagram(spec) {
  const d = spec.diag || {};
  switch (d.kind) {
    case 'memory':
      return createMemoryLayoutSvg(d.vars || [{ name: 'value', addr: '0x1000', val: '42', type: 'int', size: '4 bytes' }], d.note || '');
    case 'pointer':
      return createPointerMemorySvg(d.varName || 'x', d.val || '42', d.varAddr || '0x1000', d.ptrName || 'p', d.ptrAddr || '0x1008');
    case 'join':
      return createSqlJoinSvg(
        d.joinType || 'RELATIONAL MODEL',
        d.left || { name: 'orders', rows: ['1 | cust 10', '2 | cust 11'] },
        d.right || { name: 'customers', rows: ['10 | Asha', '11 | Ravi'] },
        d.result || { name: 'Result', rows: ['1 | Asha', '2 | Ravi'] }
      );
    case 'event':
      return createEventLoopSvg();
    case 'box':
      return createBoxModelSvg();
    case 'flow':
    default:
      return createControlFlowSvg(
        d.start || 'Start',
        d.condition || 'Condition true?',
        d.trueAction || 'Apply the concept',
        d.falseAction || 'Handle the other case',
        d.end || 'End'
      );
  }
}

function makeTopic(s) {
  if (!s.ex || s.ex.length !== 3) throw new Error(`Topic ${s.id}: exactly 3 examples required`);
  const topic = {
    id: s.id,
    course_id: s.course_id,
    unit_id: s.unit_id,
    order_index: s.order_index,
    title: s.title,
    description: s.desc,
    learning_objectives: s.obj,
    prerequisites: s.pre,
    expected_outcomes: s.outcomes,
    formal_definition: s.def,
    content_simple_english: s.simple,
    hinglish_explanation: s.hing,
    why_it_matters: s.why,
    when_to_use: s.when,
    syntax_guide: {
      template: s.syntax,
      components: (s.comp || []).map(([name, role]) => ({ name, role, required: true })),
    },
    code_example_1_title: s.ex[0].t, code_example_1_code: s.ex[0].code, code_example_1_output: s.ex[0].out, code_example_1_explanation: s.ex[0].why,
    code_example_2_title: s.ex[1].t, code_example_2_code: s.ex[1].code, code_example_2_output: s.ex[1].out, code_example_2_explanation: s.ex[1].why,
    code_example_3_title: s.ex[2].t, code_example_3_code: s.ex[2].code, code_example_3_output: s.ex[2].out, code_example_3_explanation: s.ex[2].why,
    code_walkthrough: {
      // walkEx lets a spec state explicitly which numbered example its
      // line-by-line steps describe (1-based). The audit found several
      // walkthroughs written against example 2/3 while the builder silently
      // displayed example 1, making every line reference wrong.
      code: s.walkCode || s.ex[(s.walkEx || 1) - 1].code,
      steps: s.walk.map(([line, explanation, state]) => ({ line, explanation, state: state || '' })),
      output: s.walkOut || s.ex[(s.walkEx || 1) - 1].out,
      output_reasoning: s.walkWhy,
    },
    rules_and_restrictions: s.rules,
    common_mistakes: s.mistakes.map((m) => ({
      title: m.t,
      incorrect_code: m.bad,
      // Many teaching mistakes are logic/API-misuse errors with no single
      // compiler/runtime message. Say that explicitly for this mistake
      // instead of repeating one generic string across the curriculum.
      error_message: m.err || `No single error message is guaranteed for “${m.t}”; the observable failure is the incorrect behaviour explained here.`,
      explanation: m.why,
      corrected_code: m.fix,
      debug_tip: m.tip || m.why,
    })),
    comparison_table: {
      title: s.cmp[0],
      concept_a: s.cmp[1][1] || '',
      concept_b: s.cmp[1][2] || '',
      headers: s.cmp[1],
      rows: s.cmp[2],
    },
    diagram_svg: buildDiagram(s),
    practical_applications: s.apps,
    quiz_questions: s.quizzes.map((q, i) => ({
      id: i + 1,
      type: 'multiple-choice',
      question: q.q,
      options: q.options,
      correct_index: q.correct,
      explanation: q.why,
    })),
    key_takeaways: s.take,
    quick_revision_notes: s.rev,
    assignment_prompt: s.assign.p,
    assignment_starter_code: s.assign.s,
    assignment_solution: s.assign.sol,
  };
  return topic;
}

function makeTopics(specs) {
  return specs.map(makeTopic);
}

module.exports = { makeTopic, makeTopics };
