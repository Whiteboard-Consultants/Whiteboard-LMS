'use server';

import { parseMarkdownDocument, validateParsedTest } from '@/lib/document-parsers/markdown-parser';

export async function parseDocumentAction(fileContent: string, fileName: string) {
  try {
    console.log('📄 parseDocumentAction called:', { fileName, contentLength: fileContent.length });
    
    // Determine file type
    const fileType = fileName.split('.').pop()?.toLowerCase();
    console.log('📄 Detected file type:', { fileType, fileName });
    
    if (!fileType || (fileType !== 'md' && fileType !== 'txt')) {
      const error = `Only Markdown (.md) and text (.txt) files are supported. Received: ${fileType || 'unknown'}`;
      console.error('❌ Invalid file type:', error);
      return {
        success: false,
        error
      };
    }
    
    // Validate file content is not empty
    if (!fileContent || fileContent.trim().length === 0) {
      const error = 'File is empty. Please provide a file with test content.';
      console.error('❌ Empty file:', error);
      return {
        success: false,
        error
      };
    }
    
    console.log('✅ File type validated, parsing document...');
    
    // Parse the document
    const parsedTest = parseMarkdownDocument(fileContent);
    
    // Validate
    const validationErrors = validateParsedTest(parsedTest);
    
    console.log('✅ Document parsed:', { 
      title: parsedTest.title, 
      questionsCount: parsedTest.questions.length,
      validationErrors: validationErrors.length 
    });
    
    if (validationErrors.length > 0) {
      console.warn('⚠️ Validation errors found:', validationErrors);
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
    console.error('❌ Parse document error:', error);
    return {
      success: false,
      error: error.message || 'Failed to parse document'
    };
  }
}
