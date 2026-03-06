'use client';

import { useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { parseDocumentAction } from '@/app/instructor/tests/parse-document-action';
import { DocumentPreview } from '@/components/document-preview';
import { ParsedTest } from '@/lib/document-parsers/markdown-parser';

interface DocumentUploadProps {
  onTestParsed: (test: ParsedTest) => void;
  onCancel: () => void;
}

export function DocumentUpload({ onTestParsed, onCancel }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedTest, setParsedTest] = useState<ParsedTest | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleParse = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const content = await file.text();
      const result = await parseDocumentAction(content, file.name);

      if (result.success) {
        setParsedTest(result.parsedTest!);
      } else {
        setError(result.error || 'Failed to parse document');
        if (result.parsedTest) {
          setParsedTest(result.parsedTest);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to read file');
    } finally {
      setIsLoading(false);
    }
  };

  // Show preview if test was parsed
  if (parsedTest) {
    return (
      <DocumentPreview
        parsedTest={parsedTest}
        onConfirm={onTestParsed}
        onCancel={onCancel}
        isLoading={isLoading}
      />
    );
  }

  // Show upload form
  return (
    <div className="space-y-6">
      {/* Template Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-base text-blue-900">📝 Document Format</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>
            Upload a Markdown (.md) or text (.txt) file with the following format:
          </p>
          <pre className="bg-white p-3 rounded border border-blue-200 text-xs overflow-x-auto">
{`# Test Title
Test description (optional)

## Question 1
What is 2+2?

A) 3
B) 4
C) 5
D) 6

Correct Answer: B

Explanation: 2+2=4 because...

---

## Question 2
...`}
          </pre>
          <p className="text-xs">
            <strong>Required:</strong> Question text, 4 options (A-D), correct answer, and explanation
          </p>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
          <CardDescription>
            Upload your test questions in Markdown format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Input */}
          <div className="flex flex-col items-center justify-center w-full">
            <label
              htmlFor="file-input"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-slate-500">Markdown (.md) or Text (.txt)</p>
              </div>
              <input
                id="file-input"
                type="file"
                className="hidden"
                accept=".md,.txt"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Selected File */}
          {file && (
            <div className="p-3 rounded bg-green-50 border border-green-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">{file.name}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded bg-red-50 border border-red-200 flex gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleParse}
              disabled={!file || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Parsing...' : 'Parse Document'}
            </Button>
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Download Template */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Need a template?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-3">
            Download a sample markdown file to see the expected format:
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadTemplate()}
          >
            Download Template
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function downloadTemplate() {
  const template = `# Quantitative Aptitude - Basic Math

A series of basic mathematics questions to test your arithmetic skills.

## Question 1
What is 2 + 2?

A) 3
B) 4
C) 5
D) 6

Correct Answer: B

Explanation: When you add 2 and 2 together, the result is 4. This is basic arithmetic. 2 + 2 = 4.

---

## Question 2
What is 5 × 6?

A) 25
B) 30
C) 35
D) 40

Correct Answer: B

Explanation: Multiplication of 5 and 6 equals 30. You can verify this by adding 6 five times: 6 + 6 + 6 + 6 + 6 = 30.

---

## Question 3
What is 100 ÷ 5?

A) 15
B) 20
C) 25
D) 30

Correct Answer: B

Explanation: Division is the opposite of multiplication. 100 divided by 5 equals 20. We can verify: 20 × 5 = 100.
`;

  const element = document.createElement('a');
  element.setAttribute(
    'href',
    'data:text/plain;charset=utf-8,' + encodeURIComponent(template)
  );
  element.setAttribute('download', 'test-template.md');
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
