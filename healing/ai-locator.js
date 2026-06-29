// The whole AI brain in one file. Three responsibilities:
//   1. Context engineering - shrink the page to just the locating signal.
//   2. The AI call        - strict-JSON prompt, biased toward robust selectors.
//   3. Govern             - confidence gate + validate on the real page.

require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const sanitizeHtml = require('sanitize-html');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const CONFIDENCE_THRESHOLD = 0.75;

// 1. CONTEXT ENGINEERING -------------------------------------------------
// We send the LLM only tags + the attributes a locator could actually use. Cheaper, faster,
// more accurate.
function cleanDom(html) {
  return sanitizeHtml(html, {
    allowedTags: false, // keep every tag - we need the structure
    allowedAttributes: {
      '*': ['id', 'class', 'name', 'type', 'role', 'aria-label',
            'placeholder', 'data-testid', 'href', 'value', 'title', 'alt'],
    },
    nonTextTags: ['script', 'style', 'noscript', 'svg'], // drop tag AND content
  }).replace(/\s+/g, ' ').slice(0, 15000); // collapse + cap = bounded token cost
}

// 2. THE AI CALL ---------------------------------------------------------
// We force a strict JSON shape and give the model permission to say "I'm not
// sure" via a low confidence
async function askLLMForLocator(cleanedDom, description, failedSelector) {
  const prompt = `You are a test-automation locator repair assistant.
A Playwright locator failed to find its element. Using the current page HTML below,
find the element that best matches the description and return a robust CSS selector.

Element description: "${description}"
Failed selector: "${failedSelector}"

Page HTML:
${cleanedDom}

Rules:
- Prefer selectors using id, data-testid, name, aria-label, or role over fragile ones.
- Return a selector that matches EXACTLY ONE element.
- If you cannot confidently identify the element, set confidence below 0.5.

Respond with ONLY this JSON, no markdown, no prose:
{"selector": "<css selector>", "confidence": <0.0-1.0>, "reasoning": "<one sentence>"}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6', // swap to claude-haiku-4-5-20251001 to cut cost
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .replace(/```json|```/g, '')
    .trim();

  return JSON.parse(text); // { selector, confidence, reasoning }
}

// 3. GOVERN --------------------------------------------------------------
// ask -> confidence gate -> validate. Returns a healed selector, or null if it fails
// and guesses are not allowed.
async function heal(page, failedSelector, description) {
  const cleaned = cleanDom(await page.content());

  let result;
  try {
    result = await askLLMForLocator(cleaned, description, failedSelector);
  } catch (e) {
    console.log(`[heal] LLM error for "${description}": ${e}`);
    return null;
  }

  // GATE: if the model isn't sure, we don't guess. A silent wrong heal is
  // worse than a clean failure because it hides a real bug.
  if (result.confidence < CONFIDENCE_THRESHOLD) {
    console.log(`[heal] REFUSED "${description}" - low confidence ${result.confidence}`);
    return null;
  }

  // VALIDATE: the LLM proposes, our code verifies. The selector must resolve
  // to exactly one element on the actual page before we trust it.
  if ((await page.locator(result.selector).count()) !== 1) {
    console.log(`[heal] REJECTED "${result.selector}" - did not resolve to exactly one element`);
    return null;
  }

  console.log(`[heal] HEALED "${failedSelector}" -> "${result.selector}" ` +
              `(confidence ${result.confidence}: ${result.reasoning})`);
  return result.selector;
}

module.exports = { heal, cleanDom, askLLMForLocator };
