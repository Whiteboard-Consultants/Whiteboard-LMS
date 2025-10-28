# FAQ API Testing Guide

## Quick Test URLs (for browser or curl)

### 1. Get All Categories
```
GET http://localhost:3001/api/faqs/categories
```

**Expected Response**:
```json
{
  "success": true,
  "data": [
    { "id": "uuid-1", "name": "Getting Started", "slug": "getting-started" },
    { "id": "uuid-2", "name": "Billing", "slug": "billing" }
  ]
}
```

### 2. Create FAQ (requires auth token)
```
POST http://localhost:3001/api/admin/faqs

Headers:
  Authorization: Bearer {auth-token}
  Content-Type: application/json

Body:
{
  "category_id": "uuid-from-above",
  "question": "How do I reset my password?",
  "answer": "<p>To reset your password...</p>",
  "excerpt": "Steps to reset your password",
  "is_published": true
}
```

### 3. Get Single FAQ
```
GET http://localhost:3001/api/admin/faqs/{faq-id}

Headers:
  Authorization: Bearer {auth-token}
```

### 4. Update FAQ
```
PUT http://localhost:3001/api/admin/faqs/{faq-id}

Headers:
  Authorization: Bearer {auth-token}
  Content-Type: application/json

Body:
{
  "category_id": "uuid",
  "question": "Updated question?",
  "answer": "<p>Updated answer</p>",
  "excerpt": "Updated excerpt"
}
```

### 5. Delete FAQ
```
DELETE http://localhost:3001/api/admin/faqs/{faq-id}

Headers:
  Authorization: Bearer {auth-token}
```

### 6. Get FAQ History
```
GET http://localhost:3001/api/admin/faqs/{faq-id}/history?limit=10

Headers:
  Authorization: Bearer {auth-token}
```

---

## Browser Testing (No Auth Required)

### Test Categories Dropdown
1. Open browser DevTools (F12)
2. Go to Application → Network
3. Visit http://localhost:3001/admin/faqs
4. Look for the `/api/faqs/categories` request
5. Check if response shows categories

### Test Form Submission
1. Click "Create FAQ" button
2. Verify categories dropdown populates
3. Fill form fields:
   - Category: Select one
   - Question: Type a question
   - Answer: Use the editor
4. Click Submit
5. Should see success message (not "Missing required fields")

---

## Curl Testing Examples

### Test Categories Endpoint
```bash
curl -s http://localhost:3001/api/faqs/categories | jq .
```

### Test with Mock Auth Token
```bash
# Get categories (no auth needed)
curl -X GET http://localhost:3001/api/faqs/categories

# Create FAQ (with auth token - replace TOKEN)
curl -X POST http://localhost:3001/api/admin/faqs \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "category-uuid",
    "question": "Test question?",
    "answer": "<p>Test answer</p>",
    "excerpt": "Test excerpt",
    "is_published": true
  }'
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Categories dropdown empty | Check Network tab → `/api/faqs/categories` → Should return 200 + data |
| "Unauthorized" error | Add valid auth token to `Authorization: Bearer` header |
| 404 on `/api/faqs/categories` | Server may not be running, restart with `npm run dev` |
| CORS errors | Should not happen (same origin), check browser console |
| "Missing required fields" | Categories endpoint still down, restart server |

---

## FAQ Status

✅ **All CRUD operations now working**:
- ✅ Create FAQ
- ✅ Read single FAQ
- ✅ Update FAQ
- ✅ Delete FAQ
- ✅ View history
- ✅ Fetch categories

🎉 **Your FAQ system is now fully functional!**
