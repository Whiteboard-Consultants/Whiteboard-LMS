'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Edit2, Save, X } from 'lucide-react';
import { ParsedQuestion, ParsedTest } from '@/lib/document-parsers/markdown-parser';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DocumentPreviewProps {
  parsedTest: ParsedTest;
  onConfirm: (test: ParsedTest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DocumentPreview({
  parsedTest,
  onConfirm,
  onCancel,
  isLoading = false
}: DocumentPreviewProps) {
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Partial<ParsedQuestion>>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleEditQuestion = (question: ParsedQuestion) => {
    setEditingQuestion(question.number);
    setEditValues({ ...question });
  };

  const handleSaveEdit = () => {
    if (editingQuestion) {
      const questionIndex = parsedTest.questions.findIndex(
        q => q.number === editingQuestion
      );
      if (questionIndex >= 0) {
        // Update the question
        const updated = { ...parsedTest.questions[questionIndex], ...editValues };
        // Revalidate
        updated.errors = [];
        if (!updated.text) updated.errors.push('Question text is required');
        if (updated.options.length !== 4) updated.errors.push('Must have 4 options');
        if (!updated.correctAnswer) updated.errors.push('Correct answer is required');
        if (!updated.explanation) updated.errors.push('Explanation is required');
        
        parsedTest.questions[questionIndex] = updated;
        parsedTest.totalErrors = parsedTest.questions.reduce(
          (sum, q) => sum + q.errors.length,
          0
        );
      }
      setEditingQuestion(null);
      setEditValues({});
    }
  };

  const handleConfirm = () => {
    const stillHasErrors = parsedTest.questions.some(q => q.errors.length > 0);
    if (stillHasErrors) {
      setShowConfirmDialog(true);
    } else {
      onConfirm(parsedTest);
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Header */}
      <Card>
        <CardHeader>
          <CardTitle>{parsedTest.title}</CardTitle>
          {parsedTest.description && (
            <CardDescription>{parsedTest.description}</CardDescription>
          )}
        </CardHeader>
      </Card>

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Questions ({parsedTest.questions.length})
          </h3>
          {parsedTest.totalErrors > 0 && (
            <Badge variant="destructive" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {parsedTest.totalErrors} error{parsedTest.totalErrors !== 1 ? 's' : ''}
            </Badge>
          )}
          {parsedTest.totalErrors === 0 && (
            <Badge variant="outline" className="flex items-center gap-2 bg-green-50 text-green-700">
              <CheckCircle className="w-4 h-4" />
              All valid
            </Badge>
          )}
        </div>

        {parsedTest.questions.map((question) => (
          <Card key={question.number}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-base">
                      Question {question.number}
                    </CardTitle>
                    {question.errors.length > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {question.errors.length} error{question.errors.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  {editingQuestion === question.number ? (
                    <Input
                      value={editValues.text || ''}
                      onChange={(e) =>
                        setEditValues({ ...editValues, text: e.target.value })
                      }
                      className="mb-2"
                      placeholder="Question text"
                    />
                  ) : (
                    <p className="text-sm text-foreground mb-2">{question.text}</p>
                  )}
                </div>
                {editingQuestion !== question.number && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditQuestion(question)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>

            {editingQuestion === question.number ? (
              <CardContent className="space-y-4">
                {/* Edit Mode */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Options</label>
                  {['A', 'B', 'C', 'D'].map((letter, idx) => (
                    <div key={letter} className="flex items-center gap-2">
                      <span className="w-6 font-medium">{letter})</span>
                      <Input
                        value={editValues.options?.[idx] || ''}
                        onChange={(e) => {
                          const newOptions = [...(editValues.options || [])];
                          newOptions[idx] = e.target.value;
                          setEditValues({ ...editValues, options: newOptions });
                        }}
                        placeholder={`Option ${letter}`}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-sm font-medium">Correct Answer</label>
                  <Input
                    value={editValues.correctAnswer || ''}
                    onChange={(e) =>
                      setEditValues({
                        ...editValues,
                        correctAnswer: e.target.value.toUpperCase()
                      })
                    }
                    placeholder="A, B, C, or D"
                    maxLength={1}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Explanation</label>
                  <Textarea
                    value={editValues.explanation || ''}
                    onChange={(e) =>
                      setEditValues({ ...editValues, explanation: e.target.value })
                    }
                    placeholder="Explain why this answer is correct..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveEdit}
                    className="flex-1"
                    variant="default"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    onClick={() => setEditingQuestion(null)}
                    variant="outline"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            ) : (
              <CardContent className="space-y-2">
                {/* View Mode */}
                <div className="space-y-1">
                  {question.options.map((option, idx) => (
                    <div
                      key={idx}
                      className={`text-sm p-2 rounded ${
                        String.fromCharCode(65 + idx) === question.correctAnswer
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-slate-50'
                      }`}
                    >
                      <strong>{String.fromCharCode(65 + idx)})</strong> {option}
                      {String.fromCharCode(65 + idx) === question.correctAnswer && (
                        <Badge variant="outline" className="ml-2 bg-green-100">
                          Correct
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>

                {question.explanation && (
                  <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs text-slate-600 mb-1">
                      <strong>Explanation:</strong>
                    </p>
                    <p className="text-sm text-slate-700">{question.explanation}</p>
                  </div>
                )}

                {question.errors.length > 0 && (
                  <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                    <p className="text-xs text-red-700 font-medium mb-1">Errors:</p>
                    <ul className="text-xs text-red-600 space-y-1">
                      {question.errors.map((error, idx) => (
                        <li key={idx}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={handleConfirm}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Creating test...' : 'Create Test'}
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm with Errors?</AlertDialogTitle>
            <AlertDialogDescription>
              Some questions have errors. Are you sure you want to create the test anyway?
              You can edit questions after creation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onConfirm(parsedTest)}>
              Create Test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
