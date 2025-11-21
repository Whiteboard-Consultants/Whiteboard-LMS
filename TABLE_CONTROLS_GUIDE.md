# Rich Text Editor - Table Controls Guide

## Overview
The Rich Text Editor (RTE) now includes comprehensive table controls for creating, formatting, and managing tables with custom column widths, borders, and cell shading.

---

## 1. Inserting a Table

### Method 1: Using the Insert Button
1. Click the **Grid Icon (⊞)** in the toolbar
2. A default 3×3 table with header row will be inserted at cursor position

### Method 2: Custom Sized Table
You can modify the insert button to create tables of different sizes by clicking the button and then adjusting rows/columns.

---

## 2. Table Controls Panel

When your cursor is **inside a table**, a dynamic table control panel appears in the toolbar with the following options:

### A. Column Width Control
- **Input Field**: Numeric field (30-500 pixels)
- **How to Use**:
  1. Click a cell you want to resize
  2. Enter a width value (e.g., `150`)
  3. Press Enter or click outside
  4. The selected column will resize to the specified width

### B. Cell Background Color
- **Color Picker**: First color picker button
- **How to Use**:
  1. Select a cell or multiple cells
  2. Click the background color picker
  3. Choose your desired color
  4. The cell background will update instantly
- **Use Cases**:
  - Highlight important rows/columns
  - Create visual grouping
  - Distinguish different data types

### C. Border Color
- **Color Picker**: Second color picker button
- **How to Use**:
  1. Select a cell
  2. Click the border color picker
  3. Choose your border color
  4. Borders will update to the selected color
- **Default**: Gray (#cccccc)
- **Use Cases**:
  - Create colored borders for emphasis
  - Match brand colors
  - Improve visual separation between sections

### D. Add Row
- **Button**: `+Row`
- **Function**: Adds a new row below the current row
- **Use Cases**:
  - Expand table data
  - Add more entries
  - Insert rows in the middle of a table

### E. Add Column
- **Button**: `+Col`
- **Function**: Adds a new column to the right of the current column
- **Use Cases**:
  - Add new data fields
  - Extend table horizontally

### F. Delete Row
- **Button**: `-Row`
- **Function**: Removes the current row
- **Caution**: This action cannot be undone, use Undo if needed

### G. Delete Column
- **Button**: `-Col`
- **Function**: Removes the current column and all its data
- **Caution**: Data loss - use carefully

### H. Delete Table
- **Button**: `Delete Table`
- **Function**: Removes the entire table
- **Visual**: Red background for warning
- **Caution**: Cannot undo - use Undo button if accidentally clicked

---

## 3. CSS Styling Features

### Automatic Styling Applied
The editor includes professional table CSS with:

- **Header Row**: Gradient background (light to medium gray)
- **Alternating Rows**: White and light gray for better readability
- **Borders**: 1px solid borders around all cells with 2px outer border
- **Padding**: 0.75rem (12px) on all sides for comfortable reading
- **Hover Effect**: Light blue highlight when hovering over rows
- **Selected Cell**: Blue highlight with border emphasis
- **Box Shadow**: Subtle shadow on table for depth

### CSS Classes Applied
```css
/* Main table styling */
table {
  border: 2px solid #333;
  border-collapse: collapse;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Header styling */
th {
  background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
  font-weight: 700;
}

/* Cell styling */
td, th {
  border: 1px solid #999;
  padding: 0.75rem;
}

/* Alternating rows */
tr:nth-child(odd) { background-color: #ffffff; }
tr:nth-child(even) { background-color: #f3f4f6; }

/* Hover effect */
tr:hover { background-color: #e0f2fe; }
```

---

## 4. Practical Examples

### Example 1: Simple Data Table
```
| Feature | Price | Status |
|---------|-------|--------|
| Basic   | $9.99 | Active |
| Pro     | $29.99| Active |
| Elite   | $99.99| Coming |
```
**Steps**:
1. Insert table (3 columns, 4 rows with header)
2. Fill in the data
3. Select entire table, apply light blue background to header
4. Use +Row to add more pricing tiers

### Example 2: Comparison Table
```
| Criteria    | Option A | Option B | Option C |
|-------------|----------|----------|----------|
| Cost        | Low      | Medium   | High     |
| Performance | Good     | Better   | Best     |
```
**Steps**:
1. Insert table with 4 columns
2. Use different cell background colors to differentiate options
3. Apply colored borders for visual separation
4. Add rows as needed for more criteria

### Example 3: Course Curriculum
```
| Week | Topic | Duration | Difficulty |
|------|-------|----------|------------|
| 1    | Intro | 2 hours  | Beginner   |
| 2    | Core  | 4 hours  | Intermediate|
```
**Steps**:
1. Create table with week-by-week breakdown
2. Color code difficulty levels (green=beginner, orange=intermediate, red=advanced)
3. Use alternating row colors for readability
4. Add custom column widths: Week(60px), Topic(150px), Duration(100px), Difficulty(120px)

---

## 5. Advanced Tips

### Combining Styles
- **Bold Headers**: Select header row and press Ctrl+B (or use Bold button)
- **Colored + Bordered**: Apply background color AND change border color for maximum visual impact
- **Right-Click Context Menu**: Right-click in a cell for additional TipTap table options

### Responsive Widths
- Min column width: 30px (very narrow)
- Max column width: 500px (very wide)
- Recommended widths: 80-200px per column for readability

### Cell Content Options
- Tables support:
  - Plain text
  - Formatted text (bold, italic, underline)
  - Lists inside cells
  - Multiple paragraphs

### Performance
- Tables render efficiently even with 10+ rows and 5+ columns
- Resizing columns is smooth and responsive
- No lag when adding/removing rows or columns

---

## 6. Keyboard Shortcuts (TipTap Built-in)

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Move to next cell | Tab | Tab |
| Move to previous cell | Shift+Tab | Shift+Tab |
| Add row below | Cmd+Alt+↓ | Cmd+Alt+↓ |
| Add row above | Cmd+Alt+↑ | Cmd+Alt+↑ |

---

## 7. Troubleshooting

| Issue | Solution |
|-------|----------|
| Table not appearing | Ensure you clicked the Grid icon and waited for insertion |
| Controls hidden | Click inside the table to activate the control panel |
| Column width not changing | Make sure the number is between 30-500 pixels |
| Color picker not working | Try using hex color codes directly (e.g., #FF0000) |
| Can't delete table | Use the red "Delete Table" button in the control panel |

---

## 8. Best Practices

✅ **DO:**
- Use header rows for all data tables
- Apply alternating row colors for large tables
- Set consistent column widths for professional appearance
- Use borders and shading sparingly for emphasis
- Test table appearance before publishing

❌ **DON'T:**
- Create tables with too many columns (5+ is hard to read)
- Use bright neon colors for shading
- Mix multiple border styles
- Create tables for layout purposes
- Forget to add descriptive headers

---

## 9. Browser Compatibility

The table controls work in all modern browsers:
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ⚠️ Limited (click controls may be small)

---

## 10. Exporting Tables

When you save content with tables:
- **HTML Output**: Tables are saved as proper `<table>` HTML elements
- **Formatting**: All colors and borders are preserved as inline styles
- **Database**: Content is stored as HTML and rendered identically on retrieval

Example HTML output:
```html
<table style="border: 2px solid #333;">
  <tr>
    <th style="background-color: #f3f4f6;">Header</th>
  </tr>
  <tr>
    <td style="background-color: #e0f2fe;">Data</td>
  </tr>
</table>
```

---

**Last Updated**: November 21, 2025
**Version**: 1.0
