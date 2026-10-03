/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface GrammarRule {
  pattern: RegExp;
  template: (matches: RegExpMatchArray) => string;
}

// Ordered grammar templates for common sign sequences
const GRAMMAR_RULES: GrammarRule[] = [
  // I + WANT + WATER -> "I want water."
  {
    pattern: /^I WANT WATER$/i,
    template: () => 'I want water.'
  },
  // I + NEED + HELP / I + HELP -> "I need help."
  {
    pattern: /^I (?:NEED )?HELP$/i,
    template: () => 'I need help.'
  },
  // YOU + HELP + ME / YOU + HELP + I -> "Can you help me?"
  {
    pattern: /^YOU HELP (?:ME|I)$/i,
    template: () => 'Can you help me?'
  },
  // PLEASE + HELP -> "Please help me."
  {
    pattern: /^PLEASE HELP(?: ME)?$/i,
    template: () => 'Please help me.'
  },
  // HELLO
  {
    pattern: /^HELLO$/i,
    template: () => 'Hello!'
  },
  // HELLO + YOU
  {
    pattern: /^HELLO YOU$/i,
    template: () => 'Hello to you!'
  },
  // THANK YOU
  {
    pattern: /^THANK YOU$/i,
    template: () => 'Thank you very much.'
  },
  // THANK YOU + YOU / THANK YOU + HELP
  {
    pattern: /^THANK YOU HELP$/i,
    template: () => 'Thank you for your help.'
  },
  // SORRY
  {
    pattern: /^SORRY$/i,
    template: () => 'I am sorry.'
  },
  // SORRY + BAD
  {
    pattern: /^SORRY BAD$/i,
    template: () => 'I am sorry for the mistake.'
  },
  // I + WANT + FOOD
  {
    pattern: /^I WANT FOOD$/i,
    template: () => 'I want food.'
  },
  // MORE + WATER / MORE + FOOD
  {
    pattern: /^MORE (WATER|FOOD)$/i,
    template: (m) => `I would like more ${m[1].toLowerCase()}, please.`
  },
  // I + WANT + MORE
  {
    pattern: /^I WANT MORE$/i,
    template: () => 'I want more, please.'
  },
  // GOOD + YOU
  {
    pattern: /^GOOD YOU$/i,
    template: () => 'It is good to see you.'
  },
  // YOU + GOOD
  {
    pattern: /^YOU GOOD$/i,
    template: () => 'You are doing good.'
  },
  // STOP + GO
  {
    pattern: /^STOP GO$/i,
    template: () => 'Stop and go.'
  },
  // COME
  {
    pattern: /^COME$/i,
    template: () => 'Please come here.'
  },
  // GO
  {
    pattern: /^GO$/i,
    template: () => 'You may go now.'
  },
  // STOP
  {
    pattern: /^STOP$/i,
    template: () => 'Please stop.'
  },
  // YES / NO
  {
    pattern: /^YES$/i,
    template: () => 'Yes.'
  },
  {
    pattern: /^NO$/i,
    template: () => 'No, thank you.'
  },
  // YES + PLEASE
  {
    pattern: /^YES PLEASE$/i,
    template: () => 'Yes, please.'
  },
  // NO + THANK YOU
  {
    pattern: /^NO THANK YOU$/i,
    template: () => 'No, thank you.'
  },
  // YOU + COME
  {
    pattern: /^YOU COME$/i,
    template: () => 'Please come over here.'
  },
  // I + GO
  {
    pattern: /^I GO$/i,
    template: () => 'I need to go now.'
  },
  // HELP + PLEASE
  {
    pattern: /^HELP PLEASE$/i,
    template: () => 'Help, please!'
  }
];

/**
 * Converts a sequence of recognized signs into a natural English sentence using rule-based grammar
 */
export function generateSentenceFromSigns(signs: string[]): string {
  if (!signs || signs.length === 0) {
    return '';
  }

  // Filter out any blank signs
  const cleanedSigns = signs.map(s => s.trim().toUpperCase()).filter(Boolean);
  if (cleanedSigns.length === 0) return '';

  const rawKey = cleanedSigns.join(' ');

  // 1. Check direct grammar patterns
  for (const rule of GRAMMAR_RULES) {
    const match = rawKey.match(rule.pattern);
    if (match) {
      return rule.template(match);
    }
  }

  // 2. Algorithmic fallback rule layer
  // Apply grammatical smoothing for arbitrary combinations
  const words: string[] = [];

  for (let i = 0; i < cleanedSigns.length; i++) {
    const curr = cleanedSigns[i];
    const prev = i > 0 ? cleanedSigns[i - 1] : null;
    const next = i < cleanedSigns.length - 1 ? cleanedSigns[i + 1] : null;

    if (curr === 'I') {
      // If at end of transitive sentence (e.g. "YOU HELP I"), convert to "me"
      if (prev && ['HELP', 'WANT', 'LIKE', 'SEE', 'TELL'].includes(prev)) {
        words.push('me');
      } else {
        words.push('I');
      }
    } else if (curr === 'YOU') {
      words.push('you');
    } else if (curr === 'WANT') {
      words.push('want');
    } else if (curr === 'HELP') {
      if (prev === 'YOU') {
        // "you help" -> "can you help"
        if (words.length > 0 && words[words.length - 1] === 'you') {
          words[words.length - 1] = 'can you';
          words.push('help');
        } else {
          words.push('help');
        }
      } else {
        words.push('help');
      }
    } else if (curr === 'THANK YOU') {
      words.push('thank you');
    } else {
      words.push(curr.toLowerCase());
    }
  }

  // Capitalize first letter and append proper punctuation
  let sentence = words.join(' ');
  if (sentence.length > 0) {
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
    const isQuestion = sentence.toLowerCase().startsWith('can you') ||
                       sentence.toLowerCase().startsWith('what') ||
                       sentence.toLowerCase().startsWith('where');
    if (!sentence.endsWith('.') && !sentence.endsWith('!') && !sentence.endsWith('?')) {
      sentence += isQuestion ? '?' : '.';
    }
  }

  return sentence;
}

/**
 * Optional Gemini AI Rephraser for hyper-natural phrasing and context
 */
export async function polishSentenceWithAI(signs: string[], baseSentence: string): Promise<string> {
  try {
    const prompt = `Convert this sequence of American Sign Language (ASL) glosses into a single natural, clear English spoken sentence.
Sign Sequence: ${signs.join(' -> ')}
Baseline literal translation: "${baseSentence}"

Respond with ONLY the polished English sentence, nothing else. Do not add quotes or markdown.`;

    // Attempt client-side or server proxy
    const response = await fetch('/api/polish-sentence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, signs, baseSentence })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.polished && typeof data.polished === 'string') {
        return data.polished.trim().replace(/^["']|["']$/g, '');
      }
    }
  } catch (err) {
    console.warn('AI polish unavailable, using rule-based translation:', err);
  }

  return baseSentence;
}
