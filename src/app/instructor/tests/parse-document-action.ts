'use server';

import { parseMarkdownDocument, validateParsedTest } from '@/lib/document-parsers/markdown-parser';

export async function parseDocumentAction(fileContent: string, fileName: string) {
  try {
    // Determine file type
    const fileType = fileName.split('.').pop()?.toLowerCase();
    
    if (fileType !== 'md' && fileType !== 'txt') {
      return {
        success: false,
        error: 'Only Markdown (.md) and text (.txt) files are supported currently'
      };
    }
    
    // Parse the document
    const parsedTest = parseMarkdownDocument(fileContent);
    
    // Validate
    const validationErrors = validateParsedTest(parsedTest);
    
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: validationErrors[0],
        allErrors: validationErrors,
        parsedTest // Return partial data for preview
      };
    }
    
    return {
      success: true,
      parsedTest,
      message: `Successfully parsed ${parsedTest.questions.length} questions`
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to parse document'
    };
  }
}
