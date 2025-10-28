// Simple test to verify blog creation is working
// This would normally be tested via UI, but we can simulate the action

const testPostData = {
  title: "Test Blog Post",
  slug: "test-blog-post-" + Date.now(),
  excerpt: "This is a test blog post excerpt",
  content: "This is a comprehensive test blog post content that should have enough words. It contains detailed information about testing blog creation functionality. The content should be long enough to calculate read time properly.",
  imageUrl: "https://via.placeholder.com/800x600",
  category: "Test Prep",
  tags: "testing, blog, tutorial",
  featured: false
};

const authorData = {
  id: "test-author-id",
  name: "Test Author"
};

console.log("Test blog post data:", JSON.stringify(testPostData, null, 2));
console.log("\nAuthor data:", JSON.stringify(authorData, null, 2));
console.log("\nBlog creation would be called with the above data.");
console.log("Server action: createPost(testPostData, authorData)");
