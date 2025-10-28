
'use client';

import type { CourseCategory, CourseCategoryData } from "@/types";
import { COURSE_CATEGORIES, getAllCategories, getCategoryInfo, type CategoryKey } from "@/lib/course-categories";

interface CourseCategoryFilterProps {
    categories?: CourseCategoryData[];
    selectedCategory: CategoryKey;
    onSelectCategory: (category: CategoryKey) => void;
    showIcons?: boolean;
}

export function CourseCategoryFilter({ categories, selectedCategory, onSelectCategory, showIcons = false }: CourseCategoryFilterProps) {
    const allCategories = getAllCategories();
    
    return (
        <div className="flex items-center justify-center flex-wrap gap-3 p-2">
            {allCategories.map((category) => {
                const info = getCategoryInfo(category);
                const isSelected = selectedCategory === category;
                
                return (
                    <button
                        key={category}
                        onClick={() => onSelectCategory(category)}
                        className={`px-6 py-3 text-base font-semibold rounded-lg whitespace-nowrap transition-all duration-200 border-2 ${
                            isSelected 
                                ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                                : 'bg-[#E2E8F0] hover:bg-primary hover:text-primary-foreground text-gray-700 border-gray-300 hover:border-primary'
                        }`}
                    >
                        {info.name}
                    </button>
                );
            })}
        </div>
    );
}
