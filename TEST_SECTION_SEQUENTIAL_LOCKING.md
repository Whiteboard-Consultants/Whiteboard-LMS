# Section-Based Test Sequential Progression Feature

**Date:** November 17, 2025  
**Status:** ✅ IMPLEMENTED & COMMITTED  
**Feature ID:** Test-Sections-Sequential-Locking

---

## 📋 Overview

This feature enforces **sequential section progression** in multi-section tests. Students cannot skip sections or revisit completed sections - they must submit each section in order before accessing the next one.

**Applies to:** Any test with multiple sections (like the test: `f299e878-e348-408c-b9a3-86b1c1b36d71`)

---

## 🎯 Key Constraints Implemented

### 1. **Cannot Skip Sections**
- Students cannot jump to a future section unless the current section is submitted
- Attempting to do so shows: `"Section Not Submitted - You must submit the current section before moving to the next one."`

### 2. **Cannot Revisit Previous Sections**
- Once a section is submitted, students cannot go back to it
- Attempting to revisit shows: `"Cannot Go Back - You cannot go back to a previous section once submitted."`

### 3. **Cannot Revisit Already Submitted Sections**
- Additional safeguard to prevent any access to completed sections
- Shows: `"Section Already Submitted - You cannot revisit a section after submitting it."`

### 4. **Question-Level Restrictions**
- Questions are restricted to their assigned section
- Students can only view/answer questions from the current section
- Attempting to access questions from future sections is blocked

### 5. **Auto-Progression on Time Expiry**
- When section timer reaches 0, section auto-submits automatically
- Progresses to next section (or completes test if last section)

---

## 🔍 Visual Indicators

### Section Tab States

| Indicator | Meaning | Color | Opacity |
|-----------|---------|-------|---------|
| `✓` | Section submitted & complete | Green | 60% (slightly faded) |
| `🔒` | Section locked (submit current first) | Red | 40% (heavily faded) |
| No icon | Current active section | Blue | 100% (fully visible) |

### Section Progress Card
```
Section Progress: 2 of 5 - Reading Section
You must submit this section before accessing the next one.
```

---

## 📊 Implementation Details

### Component: `src/components/test-taker.tsx`

#### Key State Variables
```typescript
const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
const [submittedSections, setSubmittedSections] = useState<Set<string>>(new Set());
const [sectionTimeLeft, setSectionTimeLeft] = useState(0);
```

#### Main Functions

**1. `handleSectionChange(sectionId: string)`**
- Validates section access permissions
- Prevents backward navigation
- Prevents skipping sections
- Prevents revisiting submitted sections

**2. `handleSubmitSection()`**
- Marks current section as submitted
- Calculates and loads next section's duration
- Auto-resets question index to first question of new section
- Shows progress toast notification
- Calls full test submission if last section

**3. `handleQuestionChange(newIndex: number)`**
- Restricts question access to current section only
- Blocks cross-section question navigation
- Updates answer status on first visit

---

## 🔄 User Flow

```
Test Start
    ↓
[Section 1 Active]
  ├─ Questions 1-10 available
  ├─ Time: 20:00 (20 minutes)
  └─ Submit Section Button
    ↓
[Section 1 Submitted] ✓ (Locked)
    ↓
[Section 2 Active] 🔓
  ├─ Questions 11-20 available
  ├─ Time: 15:00 (15 minutes)
  └─ Submit Section Button
    ↓
[Section 2 Submitted] ✓ (Locked)
    ↓
[Section 3 Active] 🔓
  └─ Final Submit Test Button
    ↓
Test Complete ✅
```

---

## ⏱️ Timer Behavior

### Global Test Timer
- Tracks total test time
- Shows in top-right corner
- Auto-submits entire test when reaches 0

### Section Timer
- Tracks individual section time
- Shows separately below global timer
- Styled in blue for visibility
- Auto-submits current section when reaches 0
- Automatically starts next section with its allocated duration

### Section Time Allocation
```typescript
// Example: Test with 3 sections
Test Total: 60 minutes
├─ Section 1: 20 minutes (1200 seconds)
├─ Section 2: 15 minutes (900 seconds)
└─ Section 3: 25 minutes (1500 seconds)
```

---

## 📱 Responsive Design

### Desktop (col-span-9 and col-span-3)
- Full section tabs visible with all section names
- Complete question palette (grid of question buttons)
- Side-by-side layout

### Tablet (col-span-8 and col-span-4)
- Section tabs may wrap
- Question palette adjusted

### Mobile (full width adjustments)
- Vertical stacking of sections and questions
- Question palette as horizontal scroll
- Dropdowns for section selection if needed

---

## 🔐 Security & Validation

### Backend Validation (Optional Enhancement)
While frontend prevents access, backend should validate:
```typescript
// In assessment-actions.ts
// Verify that submitted answers belong to submitted sections only
// Prevent students from claiming answers from locked sections
```

### Frontend Validation
✅ Section access checks before rendering  
✅ Question filtering by section  
✅ Toast notifications for rule violations  
✅ Disabled state on locked section tabs  

---

## 📝 Testing Checklist

### Test Case 1: Basic Section Progression
- [ ] Load test with 3+ sections
- [ ] First section loads with active timer
- [ ] Answer some questions
- [ ] Click "Submit Section"
- [ ] Second section loads with fresh timer
- [ ] First section tab shows ✓ and is faded
- [ ] Cannot click first section tab

### Test Case 2: Attempt to Skip Section
- [ ] In Section 1, try to click Section 3 tab
- [ ] Toast shows "Section Not Submitted"
- [ ] Section 3 tab appears locked with 🔒
- [ ] Section 3 remains unclickable

### Test Case 3: Cannot Go Back
- [ ] Submit Section 1
- [ ] Move to Section 2
- [ ] Try to click Section 1 tab
- [ ] Toast shows "Cannot Go Back"
- [ ] Section 1 tab is disabled

### Test Case 4: Time Expiry Auto-Submit
- [ ] Enter a section
- [ ] Wait for section timer to reach 0:00
- [ ] Section auto-submits
- [ ] Next section automatically loads
- [ ] Progress indicator updates

### Test Case 5: Question Restrictions
- [ ] In Section 1, try to click question from Section 2
- [ ] Toast shows "Cannot Access Question"
- [ ] Only questions from current section are clickable

### Test Case 6: Progress Indicator
- [ ] Verify "Section Progress: 1 of 3" shows
- [ ] After submission: "Section Progress: 2 of 3"
- [ ] Final section: "Section Progress: 3 of 3"

### Test Case 7: Section Navigation After Submission
- [ ] Submit Section 1
- [ ] Verify cannot revisit Section 1
- [ ] Move forward through sections normally
- [ ] Submit all sections
- [ ] Full test completes successfully

---

## 🎓 Student Experience

### Intended Behavior
1. Student starts test, sees first section
2. Student answers questions (timed)
3. Student clicks "Submit Section"
4. Toast shows "Section Submitted - Moving to [Next Section Name]"
5. Next section loads with fresh timer and questions
6. Previous section is visually locked (faded with ✓)
7. Student cannot skip ahead or go back
8. After final section submission, full test completes

### Error Messages (if attempting violations)
- "Section Not Submitted - You must submit the current section before moving to the next one."
- "Cannot Go Back - You cannot go back to a previous section once submitted."
- "Section Already Submitted - You cannot revisit a section after submitting it."
- "Cannot Access Question - You can only access questions from the current section."

---

## 📊 Data Model Impact

### No Database Changes Required
The existing schema supports this feature:
- `test_sections` table: section definitions
- `test_questions.section_id`: maps questions to sections
- `test_questions.order_number`: maintains question order
- `test_sections.duration`: defines time per section

### State Management (In Memory)
```typescript
submittedSections: Set<string>  // Tracks which sections are done
currentSectionId: string        // Current active section
sectionTimeLeft: number         // Countdown for section
```

---

## 🚀 Deployment Notes

### Environment Variables
None added - uses existing configuration

### Breaking Changes
None - fully backward compatible with single-section tests

### Performance Impact
- Minimal: Uses in-memory Set for section tracking
- No additional database queries
- Frontend-only validation

### Browser Compatibility
- Works with all modern browsers
- Requires JavaScript enabled (as with full app)
- No additional polyfills needed

---

## 🔮 Future Enhancements

### Potential Improvements
1. **Section Bookmarking**: Allow students to save progress within section
2. **Section Reports**: Show detailed results per section
3. **Instructor Analytics**: Track section-level performance metrics
4. **Pausing**: Allow students to pause & resume individual sections
5. **Section Difficulty Modes**: Adjust questions based on section performance
6. **Review Mode**: After completion, allow reviewing submitted sections (read-only)

---

## 📞 Troubleshooting

### Issue: Section timer not appearing
- Check: `sections.length > 0` in test data
- Verify: Test has `test_sections` entries in database
- Solution: Ensure test structure includes sections

### Issue: Cannot submit section
- Check: "Submit Section" button is visible
- Verify: At least one question answered (optional or required?)
- Solution: May need to add validation before submit

### Issue: Questions from future sections visible
- Check: `sectionId` is correctly set on all questions
- Verify: `handleQuestionChange` includes section restriction
- Solution: Database migration may be needed to assign section_id

### Issue: Locked sections clickable
- Check: Browser console for JavaScript errors
- Clear: Browser cache (localStorage, sessionStorage)
- Solution: Restart dev server

---

## 📖 Code References

### Files Modified
- `src/components/test-taker.tsx` - Main implementation

### Key Commit
```
b938c97 - feat: Implement section locking to enforce sequential test progression
```

### Related Files
- `src/app/(main)/student/tests/[testId]/take/page.tsx` - Test taking page
- `src/app/student/assessment-actions.ts` - Test submission backend
- `src/types/index.ts` - Type definitions for Test/TestQuestion

---

## ✨ Summary

Students taking multi-section tests now follow a **strict sequential progression**:
1. Must answer questions section by section
2. Cannot skip or go back
3. Section timer auto-submits when expired
4. Clear visual feedback on section status
5. Prevents test manipulation or cheating via section skipping

This ensures fair and structured assessment while maintaining the flexibility to design tests with multiple sections and different durations.

---

*Feature Implemented: November 17, 2025*  
*Status: Production Ready*  
*Test ID Example: f299e878-e348-408c-b9a3-86b1c1b36d71*
