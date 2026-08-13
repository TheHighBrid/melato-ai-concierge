const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'embed', 'melato-concierge-widget.js'), 'utf8');
const context = {
  window: {},
  document: {
    currentScript: { dataset: { auto: 'false' } },
    readyState: 'complete'
  },
  SpeechSynthesisUtterance: function SpeechSynthesisUtterance(text) { this.text = text; }
};
vm.runInNewContext(source, context);

const { ask, draftEmail } = context.window.MelatoAI;

test('classifies common support requests', () => {
  assert.equal(ask('Where is my order?').intent, 'order');
  assert.equal(ask('I need to cancel my order').intent, 'returns');
  assert.equal(ask('The jacket is the wrong size').intent, 'returns');
  assert.equal(ask('How should I wash this?').intent, 'care');
});

test('matches whole terms instead of unrelated substrings', () => {
  assert.equal(ask('Tell me about your relationship with artists').intent, 'general');
  assert.equal(ask('Is this a small-batch designer brand?').intent, 'fit');
});

test('returns safe, actionable order guidance', () => {
  const result = ask('Track my package');
  assert.match(result.answer, /cannot access live Shopify order data/i);
  assert.equal(result.cta.href, 'mailto:orders@melato.ca');
});

test('drafts an intent-specific personalized email', () => {
  const draft = draftEmail('Can I exchange this?', 'Avery');
  assert.equal(draft.subject, 'Melato return request');
  assert.match(draft.body, /^Hi Avery,/);
  assert.match(draft.body, /Melato Client Care$/);
});

test('matches distinctive product names without flooding results with generic garments', () => {
  const exact = ask('Tell me about the Vision Moto Jacket');
  assert.match(exact.answer, /Pieces I heard in your question: Vision Moto Jacket\./);
  assert.doesNotMatch(exact.answer, /Divididos Velour Track Jacket/);

  const generic = ask('Recommend a jacket');
  assert.doesNotMatch(generic.answer, /Pieces I heard in your question/);
});

test('sanitizes customer names used in generated email greetings', () => {
  const draft = draftEmail('Where is my order?', 'Avery\r\nBcc: someone@example.com <script>');
  assert.match(draft.body, /^Hi Avery Bcc: someone@example\.com script,/);
  assert.doesNotMatch(draft.body, /[<>\r]/);
});
