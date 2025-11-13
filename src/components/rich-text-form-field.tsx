'use client';

import { RichTextEditor } from './rich-text-editor';
import { FormControl, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';

interface RichTextFormFieldProps {
  field: any;
  label: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  height?: string;
  error?: string;
}

export function RichTextFormField({
  field,
  label,
  placeholder = 'Enter text...',
  description,
  disabled = false,
  height = '300px',
  error,
}: RichTextFormFieldProps) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <RichTextEditor
          content={field.value || ''}
          onChange={field.onChange}
          placeholder={placeholder}
          disabled={disabled}
          height={height}
        />
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
}
