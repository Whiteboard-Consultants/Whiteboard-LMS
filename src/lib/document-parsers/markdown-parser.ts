/**
 * Markdown Document Parser for Test Questions
 * 
 * Expected format:
 * # Test Title
 * Test description (optional)
 * 
 * ## Question 1
 * Question text here?
 * 
 * A) Option A
 * B) Option B
 * C) Option C
 * D) Option D
 * 
 * **Correct Answer:** A
 * 
 * **Explanation:** Detailed explanation...
 * 
 * Also supports:
 * - Bullet points: - A) Option A
 * - Bold formatting: - **A)** Option A
 * - **Correct Answer:** A (with ** markers)
 * - **Explanation:** (with ** markers)
 */

export interface ParsedQuestion {
  number: number;
  text: string;
  options: string[];
  correctAnswer: string | null;
  explanation: string;
  errors: string[];
}

export interface ParsedTest {
  title: string;
  description: string;
  questions: ParsedQuestion[];
  totalErrors: number;
}

/**
 * Clean markdown formatting from text
 */
function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove **bold**
    .replace(/\*(.+?)\*/g, '$1') // Remove *italic*
    .replace(/__(.+?)__/g, '$1') // Remove __bold__
    .replace(/_(.+?)_/g, '$1') // Remove _italic_
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove [link](url)
    .replace(/#+\s/g, '') // Remove heading markers
    .replace(/\|[\s\-:|]*\|/g, '') // Remove markdown table lines
    .replace(/\|/g, ' ') // Replace remaining pipes with spaces
    .replace(/^[-]{3,}$/gm, '') // Remove horizontal rules (---)
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
}

export function parseMarkdownDocument(content: string): ParsedTest {
  const lines = content.split('\n');
  
  // Extract title (first # heading)
  const titleMatch = content.match(/^# (.+)$/m);
  const title = titleMatch ? cleanMarkdown(titleMatch[1].trim()) : 'Untitled Test';
  
  // Extract description (text before first ## Question)
  const firstQuestionIndex = lines.findIndex(l => l.trim().match(/^## Question \d+/));
  const descriptionLines = firstQuestionIndex > 0 
    ? lines.slice(1, firstQuestionIndex).filter(l => l.trim() && !l.match(/^#/))
    : [];
  const description = cleanMarkdown(descriptionLines.map(l => l.trim()).join(' ').trim());
  
  // Split by question blocks
  const questionPattern = /## Question \d+/;
  const questionBlocks = content.split(questionPattern).slice(1); // Skip first empty split
  
  const questions: ParsedQuestion[] = [];
  let totalErrors = 0;
  
  questionBlocks.forEach((block, index) => {
    const question = parseQuestionBlock(block, index + 1);
    totalErrors += question.errors.length;
    questions.push(question);
  });
  
  return {
    title,
    description,
    questions,
    totalErrors
  };
}

function parseQuestionBlock(block: string, questionNumber: number): ParsedQuestion {
  const lines = block.split('\n').map(l => l.trim()).filter(l => l);
  const question: ParsedQuestion = {
    number: questionNumber,
    text: '',
    options: [],
    correctAnswer: null,
    explanation: '',
    errors: []
  };
  
  if (lines.length === 0) {
    question.errors.push('Empty question block');
    return question;
  }
  
  let currentIndex = 0;
  
  // Extract question text (first line or lines until options start)
  let questionTextLines = [];
  while (currentIndex < lines.length && !lines[currentIndex].match(/^[-*]?\s*\*?\*?[A-D]\)\*?\*?/)) {
    questionTextLines.push(lines[currentIndex]);
    currentIndex++;
  }
  
  question.text = questionTextLines.join(' ').trim();
  if (!question.text) {
    question.errors.push('Missing question text');
  }
  
  // Extract options (A, B, C, D) - handles: A) text, - A) text, - **A)** text
  const optionRegex = /^[-*]?\s*\*?\*?([A-D])\)\*?\*?\s*(.+)$/;
  const optionMap: { [key: string]: string } = {};
  
  while (currentIndex < lines.length && lines[currentIndex].match(optionRegex)) {
    const match = lines[currentIndex].match(optionRegex);
    if (match) {
      const optionLetter = match[1];
      const optionText = match[2].trim();
      optionMap[optionLetter] = optionText;
      question.options.push(optionText);
    }
    currentIndex++;
  }
  
  // Validate options
  if (question.options.length !== 4) {
    question.errors.push(`Expected 4 options, found ${question.options.length}`);
  }
  
  // Extract correct answer - handles: Correct Answer: A, **Correct Answer:** A
  let correctAnswerLine = lines.find(l => l.match(/^\*?\*?Correct\s*Answer:\*?\*?\s*[A-D]/i));
  if (correctAnswerLine) {
    const match = correctAnswerLine.match(/Correct\s*Answer:\*?\*?\s*([A-D])/i);
    if (match) {
      const answerLetter = match[1];
      // Validate that the answer refers to a valid option
      if (Object.keys(optionMap).includes(answerLetter)) {
        question.correctAnswer = answerLetter;
      } else {
        question.errors.push(`Correct answer '${answerLetter}' does not match available options`);
      }
    }
  } else {
    question.errors.push('Missing "Correct Answer:" line');
  }
  
  // Extract explanation - handles: Explanation: ..., **Explanation:** ...
  const explanationStartIndex = lines.findIndex(l => 
    l.match(/^\*?\*?Explanation:\*?\*?/i)
  );
  
  if (explanationStartIndex !== -1) {
    const explanationLines = lines.slice(explanationStartIndex + 1);
    // Remove empty lines at start
    while (explanationLines.length > 0 && !explanationLines[0]) {
      explanationLines.shift();
    }
    // Stop at separator or end
    const separatorIndex = explanationLines.findIndex(l => l === '---');
    const explanationText = explanationLines
      .slice(0, separatorIndex !== -1 ? separatorIndex : undefined)
      .filter(l => l && l !== '---')
      .join(' ')
      .trim();
    
    question.explanation = explanationText;
  }
  
  if (!question.explanation) {
    question.errors.push('Missing or empty explanation');
  }
  
  return question;
}

/**
 * Validate a parsed test before saving
 */
export function validateParsedTest(test: ParsedTest): string[] {
  const errors: string[] = [];
  
  if (!test.title) {
    errors.push('Test must have a title');
  }
  
  if (test.questions.length === 0) {
    errors.push('Test must contain at least one question');
  }
  
  test.questions.forEach(q => {
    if (q.errors.length > 0) {
      errors.push(`Question ${q.number}: ${q.errors.join(', ')}`);
    }
  });
  
  return errors;
}
