# Blog TextStyle Mark Fix

## Issue
When creating a blog post, the rich text editor threw an error:
```
There is no mark type named 'textStyle'. Maybe you forgot to add the extension?
```

The error occurred when trying to change font size in the editor toolbar at:
```
editor.chain().focus().setMark('textStyle', { fontSize }).run();
```

## Root Cause
The TipTap editor was attempting to use the `textStyle` mark type, which is provided by the `@tiptap/extension-text-style` extension. However, this extension was not imported or added to the editor's extensions array.

The editor only had:
- StarterKit (basic formatting)
- ConfiguredImage (custom image handling)

But was missing:
- TextStyle extension (required for setting text properties like font size)

## Solution
Added the TextStyle extension to the rich text editor:

### 1. Import the TextStyle Extension
```tsx
import { TextStyle } from '@tiptap/extension-text-style';
```

### 2. Add to Editor Extensions
```tsx
const editor = useEditor({
  immediatelyRender: false,
  extensions: [
    StarterKit.configure({...}),
    TextStyle,  // ← Added this line
    ConfiguredImage,
  ],
  // ... rest of config
});
```

## Changes Made
**File:** `src/components/rich-text-editor.tsx`

1. **Line 7:** Added import for TextStyle
   ```tsx
   import { TextStyle } from '@tiptap/extension-text-style';
   ```

2. **Line 398:** Added TextStyle to extensions array
   ```tsx
   extensions: [
     StarterKit.configure({...}),
     TextStyle,
     ConfiguredImage,
   ]
   ```

## Testing
✅ Blog creation form now loads without errors
✅ Font size selector works properly
✅ All toolbar buttons functional
✅ No TypeScript errors

## How It Works
The TextStyle extension allows marks to carry styling attributes (like fontSize) that can be applied to text ranges. This enables:
- Font size changes (Tiny, Small, Normal, Large, Huge, etc.)
- Future color/styling options
- Complex text formatting

## Related Files
- `src/app/(main)/admin/blog/new/page.tsx` - Blog creation page
- `src/components/admin/blog/post-form.tsx` - Blog post form component

## Status
✅ **FIXED** - Blog creation with rich text editor now fully functional
