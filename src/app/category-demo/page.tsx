"use client";

import { useState } from "react";
import { CourseCategoryFilter } from "@/components/course-category-filter";
import { type CategoryKey } from "@/lib/course-categories";

export default function CategoryDemo() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('All Programs');

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Updated Course Categories</h1>
          <p className="text-lg text-muted-foreground">
            New design: No icons, larger fonts, light themed backgrounds
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Category Filter</h2>
          <CourseCategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Selected Category:</h3>
          <p className="text-2xl font-bold text-primary">{selectedCategory}</p>
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Changes Made:</h3>
          <ul className="space-y-2 text-sm">
            <li>✅ Removed "Communication" category - kept only "Language Skills"</li>
            <li>✅ Removed all icons from category buttons</li>
            <li>✅ Increased font size from text-sm to text-base with font-semibold</li>
            <li>✅ Unified background color: #E2E8F0 for all unselected tabs</li>
            <li>✅ Added primary blue hover state for better interaction feedback</li>
            <li>✅ Selected state uses theme primary color with proper contrast</li>
            <li>✅ Enhanced transitions and improved spacing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}