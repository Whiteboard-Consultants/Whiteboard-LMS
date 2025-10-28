// Example usage file - you can integrate this into your existing courses page

"use client";

import { useState } from "react";
import { CourseList } from "@/components/course-list";
import { CourseCategoryFilter } from "@/components/course-category-filter";
import { type CategoryKey } from "@/lib/course-categories";

export default function CoursesPageExample() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('All Programs');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Explore Our Programs</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Choose from our comprehensive range of educational services
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <CourseCategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          showIcons={false}
        />
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md mx-auto block px-4 py-2 border rounded-md"
        />
      </div>

      {/* Course List */}
      <CourseList
        searchTerm={searchTerm}
        category={selectedCategory}
      />
    </div>
  );
}

// How to integrate into your existing courses page:
/*
1. Import the CategoryKey type:
   import { type CategoryKey } from "@/lib/course-categories";

2. Update your state:
   const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('All Programs');

3. Use the updated CourseCategoryFilter:
   <CourseCategoryFilter
     selectedCategory={selectedCategory}
     onSelectCategory={setSelectedCategory}
     showIcons={true}
   />

4. Pass the category to CourseList:
   <CourseList
     category={selectedCategory}
     searchTerm={searchTerm}
   />
*/