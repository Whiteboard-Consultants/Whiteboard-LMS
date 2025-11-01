/**
 * Admin FAQ Management Dashboard
 * /admin/faqs - Main FAQ management page
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit2, Trash2, Eye, EyeOff, History } from 'lucide-react'
import { format } from 'date-fns'
import type { FAQsManagementData } from '@/types/faq'

interface FAQListState {
  faqs: FAQsManagementData[]
  loading: boolean
  error?: string
  categoryFilter?: string
  statusFilter: 'all' | 'published' | 'draft'
}

export default function AdminFAQsPage() {
  const router = useRouter()
  const [state, setState] = useState<FAQListState>({
    faqs: [],
    loading: true,
    statusFilter: 'all',
  })

  // Fetch FAQs
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const res = await fetch('/api/admin/faqs')
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch FAQs')
        }

        setState(prev => ({
          ...prev,
          faqs: data.data,
          loading: false,
        }))
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown error',
          loading: false,
        }))
      }
    }

    fetchFAQs()
  }, [])

  // Filter FAQs
  const filteredFAQs = state.faqs.filter(faq => {
    if (state.statusFilter === 'published' && !faq.is_published) return false
    if (state.statusFilter === 'draft' && faq.is_published) return false
    if (state.categoryFilter && faq.category_name !== state.categoryFilter) return false
    return true
  })

  // Get unique categories
  const categorySet = new Set(state.faqs.map(f => f.category_name))
  const categories = Array.from(categorySet)

  const handleDeleteFAQ = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return

    try {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete FAQ')
      }

      setState(prev => ({
        ...prev,
        faqs: prev.faqs.filter(f => f.id !== id),
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete FAQ',
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">FAQ Management</h1>
            <p className="text-gray-600 mt-1">Create and manage frequently asked questions</p>
          </div>
          <Link
            href="/admin/faqs/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            New FAQ
          </Link>
        </div>

        {/* Error Message */}
        {state.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{state.error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex items-center gap-4 flex-wrap">
          <select
            value={state.statusFilter}
            onChange={e =>
              setState(prev => ({
                ...prev,
                statusFilter: e.target.value as FAQListState['statusFilter'],
              }))
            }
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={state.categoryFilter || ''}
            onChange={e =>
              setState(prev => ({
                ...prev,
                categoryFilter: e.target.value || undefined,
              }))
            }
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <div className="ml-auto text-sm text-gray-600">
            {filteredFAQs.length} FAQ{filteredFAQs.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Loading State */}
        {state.loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading FAQs...</p>
          </div>
        ) : filteredFAQs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No FAQs found</p>
          </div>
        ) : (
          /* FAQs Table */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Question
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Helpfulness
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFAQs.map(faq => (
                  <tr key={faq.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {faq.question}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{faq.category_name}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          faq.is_published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {faq.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{faq.view_count || 0}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {faq.helpful_count || 0}👍 / {faq.unhelpful_count || 0}👎
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {format(new Date(faq.updated_at), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/faqs/${faq.id}/edit`}
                          className="p-2 hover:bg-gray-200 rounded"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <Link
                          href={`/admin/faqs/${faq.id}/history`}
                          className="p-2 hover:bg-gray-200 rounded"
                          title="View History"
                        >
                          <History size={16} />
                        </Link>
                        <button
                          onClick={() => handleDeleteFAQ(faq.id)}
                          className="p-2 hover:bg-red-100 text-red-600 rounded"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Statistics Footer */}
        <div className="mt-8 grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total FAQs</p>
            <p className="text-2xl font-bold text-gray-900">{state.faqs.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Published</p>
            <p className="text-2xl font-bold text-green-600">
              {state.faqs.filter(f => f.is_published).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Draft</p>
            <p className="text-2xl font-bold text-gray-600">
              {state.faqs.filter(f => !f.is_published).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Views</p>
            <p className="text-2xl font-bold text-blue-600">
              {state.faqs.reduce((sum, f) => sum + (f.view_count || 0), 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
