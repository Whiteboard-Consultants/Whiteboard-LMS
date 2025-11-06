import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateTOEFLPost() {
  try {
    console.log("🚀 Updating TOEFL blog post...");

    const { data, error } = await supabase
      .from("posts")
      .update({ author_name: "Whiteboard Consultants" })
      .eq("slug", "12-week-toefl-ibt-intensive-course-strategy")
      .select();

    if (error) {
      console.error("❌ Error updating post:", error);
      process.exit(1);
    }

    if (data && data.length > 0) {
      console.log("✅ TOEFL post updated successfully!");
      console.log(`📝 Post Title: ${data[0].title}`);
      console.log(`👤 Author: ${data[0].author_name}`);
    } else {
      console.log("⚠️  No post found with that slug");
    }
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

updateTOEFLPost();
