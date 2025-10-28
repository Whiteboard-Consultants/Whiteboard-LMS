/**
 * FAQ Editor Component with TipTap Rich Text
 * Used in both create and edit pages
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Undo2, Redo2 } from 'lucide-react'
import type { FAQ, FAQCategory } from '@/types/faq'

interface FAQEditorProps {
  initialFAQ?: FAQ
  categoryId?: string
  onSave?: (faq: FAQ) => void
}

export function FAQEditor({ initialFAQ, categoryId: initialCategoryId, onSave }: FAQEditorProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<FAQCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [success, setSuccess] = useState<string>()

  const [formData, setFormData] = useState({
    question: initialFAQ?.question || '',
    excerpt: initialFAQ?.excerpt || '',
    category_id: initialFAQ?.category_id || initialCategoryId || '',
    is_published: initialFAQ?.is_published || false,
    display_order: initialFAQ?.display_order || 0,
    change_reason: '',
  })

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
    ],
    content: initialFAQ?.answer || '<p>Enter FAQ answer here...</p>',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[300px]',
      },
    },
  })

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/faqs/categories')
        const data = await res.json()
        if (data.success) {
          setCategories(data.data)
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err)
      }
    }

    fetchCategories()
  }, [])

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)
      setError(undefined)
      setSuccess(undefined)

      try {
        if (!formData.question.trim()) {
          throw new Error('Question is required')
        }
        if (!formData.category_id) {
          throw new Error('Category is required')
        }
        if (!editor || !editor.getText().trim()) {
          throw new Error('Answer is required')
        }

        const answer = editor.getJSON()

        const url = initialFAQ ? `/api/admin/faqs/${initialFAQ.id}` : '/api/admin/faqs'
        const method = initialFAQ ? 'PUT' : 'POST'

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: formData.question,
            answer: JSON.stringify(answer),
            excerpt: formData.excerpt,
            category_id: formData.category_id,
            is_published: formData.is_published,
            display_order: formData.display_order,
            change_reason: formData.change_reason,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Failed to save FAQ')
        }

        setSuccess(`FAQ ${initialFAQ ? 'updated' : 'created'} successfully!`)

        if (onSave) {
          onSave(data.data)
        } else {
          setTimeout(() => {
            router.push('/admin/faqs')
          }, 1500)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    },
    [formData, editor, initialFAQ, onSave, router]
  )

  if (!editor) {
    return <div>Loading editor...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">{error}</div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {success}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
          <select
            value={formData.category_id}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                category_id: e.target.value,
              }))
            }
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Display Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
          <input
            type="number"
            value={formData.display_order}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                display_order: parseInt(e.target.value),
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Question */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Question *</label>
        <input
          type="text"
          value={formData.question}
          onChange={e =>
            setFormData(prev => ({
              ...prev,
              question: e.target.value,
            }))
          }
          required
          placeholder="Enter FAQ question"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Excerpt (for SEO)
        </label>
        <textarea
          value={formData.excerpt}
          onChange={e =>
            setFormData(prev => ({
              ...prev,
              excerpt: e.target.value,
            }))
          }
          placeholder="Short summary for search engines (max 160 chars)"
          maxLength={160}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">
          {formData.excerpt.length}/160 characters
        </p>
      </div>

      {/* Answer Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Answer *</label>

        {/* Toolbar */}
        <div className="border border-gray-300 rounded-t-lg bg-gray-50 p-2 flex items-center gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`p-2 rounded ${
              editor.isActive('bold') ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'
            }`}
            title="Bold"
          >
            <Bold size={18} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`p-2 rounded ${
              editor.isActive('italic') ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'
            }`}
            title="Italic"
          >
            <Italic size={18} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded ${
              editor.isActive('heading', { level: 1 })
                ? 'bg-blue-600 text-white'
                : 'bg-white hover:bg-gray-100'
            }`}
            title="Heading 1"
          >
            <Heading1 size={18} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-blue-600 text-white'
                : 'bg-white hover:bg-gray-100'
            }`}
            title="Heading 2"
          >
            <Heading2 size={18} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded ${
              editor.isActive('bulletList') ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'
            }`}
            title="Bullet List"
          >
            <List size={18} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded ${
              editor.isActive('orderedList') ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'
            }`}
            title="Ordered List"
          >
            <ListOrdered size={18} />
          </button>

          <div className="border-l border-gray-300 mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="p-2 rounded bg-white hover:bg-gray-100 disabled:opacity-50"
            title="Undo"
          >
            <Undo2 size={18} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="p-2 rounded bg-white hover:bg-gray-100 disabled:opacity-50"
            title="Redo"
          >
            <Redo2 size={18} />
          </button>
        </div>

        {/* Editor */}
        <EditorContent editor={editor} />
      </div>

      {/* Change Reason (for updates) */}
      {initialFAQ && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Changes
          </label>
          <textarea
            value={formData.change_reason}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                change_reason: e.target.value,
              }))
            }
            placeholder="Optional: describe why you're making these changes"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Publishing */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_published"
          checked={formData.is_published}
          onChange={e =>
            setFormData(prev => ({
              ...prev,
              is_published: e.target.checked,
            }))
          }
          className="w-4 h-4"
        />
        <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
          Publish this FAQ (make visible to public)
        </label>
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center gap-4 pt-6 border-t">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? 'Saving...' : initialFAQ ? 'Update FAQ' : 'Create FAQ'}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
