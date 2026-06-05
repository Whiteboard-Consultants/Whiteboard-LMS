'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormLabel } from '@/components/ui/form';
import { Plus, Trash2 } from 'lucide-react';

export type FaqFieldValue = { question: string; answer: string };

interface BlogFaqFieldsProps {
  value: FaqFieldValue[];
  onChange: (value: FaqFieldValue[]) => void;
  disabled?: boolean;
}

export function BlogFaqFields({ value, onChange, disabled }: BlogFaqFieldsProps) {
  const items = value.length > 0 ? value : [{ question: '', answer: '' }];

  const updateItem = (index: number, field: keyof FaqFieldValue, text: string) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: text };
    onChange(next);
  };

  const addItem = () => onChange([...items, { question: '', answer: '' }]);

  const removeItem = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    onChange(next.length > 0 ? next : [{ question: '', answer: '' }]);
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div>
        <FormLabel className="text-base">FAQ Section (for AI citations & SEO)</FormLabel>
        <p className="text-sm text-muted-foreground mt-1">
          Add question-and-answer pairs shown on the post and used in FAQ schema. Leave blank to skip.
        </p>
      </div>
      {items.map((item, index) => (
        <div key={index} className="space-y-3 rounded-md border bg-muted/20 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">FAQ {index + 1}</span>
            {items.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                disabled={disabled}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Input
            placeholder="Question"
            value={item.question}
            onChange={(e) => updateItem(index, 'question', e.target.value)}
            disabled={disabled}
          />
          <Textarea
            placeholder="Answer"
            value={item.answer}
            onChange={(e) => updateItem(index, 'answer', e.target.value)}
            disabled={disabled}
            rows={3}
          />
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addItem} disabled={disabled}>
        <Plus className="h-4 w-4 mr-2" />
        Add FAQ
      </Button>
    </div>
  );
}
