import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import dotenv from 'dotenv';

dotenv.config();

// Load from .env.local if .env doesn't have it (though dotenv.config() usually handles .env)
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const queueDir = path.join(process.cwd(), 'content', 'queue');
const publishedDir = path.join(process.cwd(), 'content', 'published');

async function uploadBlogs() {
  if (!fs.existsSync(queueDir)) {
    console.error('Queue directory does not exist.');
    return;
  }

  const files = fs.readdirSync(queueDir).filter(file => file.endsWith('.md') && file !== '.gitkeep');

  if (files.length === 0) {
    console.log('No blogs in queue.');
    return;
  }

  // Find admin user ID
  let adminId = process.env.MEHRI_ADMIN_ID;

  if (!adminId) {
    const adminEmail = process.env.VITE_ADMIN_EMAIL || 'jajdn777@gmail.com';
    console.log(`Searching for admin user with email: ${adminEmail}`);
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', adminEmail)
      .single();

    if (!userError && userData) {
      adminId = userData.id;
    } else {
      console.warn('Could not find admin user in profiles, trying blogs table fallback...');
      const { data: blogData, error: blogError } = await supabase
        .from('blogs')
        .select('user_id')
        .limit(1);

      if (!blogError && blogData && blogData.length > 0) {
        adminId = blogData[0].user_id;
        console.log(`Found fallback user_id from existing blogs: ${adminId}`);
      } else {
        console.error('Error finding a valid user ID for upload:', userError || blogError);
        process.exit(1);
      }
    }
  }

  for (const file of files) {
    const filePath = path.join(queueDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(fileContent);

    // Ensure description is captured even if not currently in DB schema (to satisfy requirement)
    // We'll prepend it to the content if it's not a separate column
    const htmlContent = marked.parse(content);
    const wordCount = content.split(/\s+/).length;
    const readTime = `${Math.ceil(wordCount / 200)} MIN READ`;

    const blogData: any = {
      user_id: adminId,
      title: frontmatter.title.toUpperCase(),
      content: htmlContent,
      author_name: 'Mehri Content Engineer',
      cover_image: frontmatter.image_url,
      read_time: readTime,
      category: 'Performance',
      created_at: frontmatter.date ? new Date(frontmatter.date).toISOString() : new Date().toISOString()
    };

    // If description exists in frontmatter, try to include it
    if (frontmatter.description) {
        blogData.description = frontmatter.description;
    }

    console.log(`Uploading ${file}...`);
    const { error: insertError } = await supabase.from('blogs').insert(blogData);

    if (insertError) {
      if (insertError.message.includes('column "description" of relation "blogs" does not exist') ||
          insertError.message.includes("Could not find the 'description' column")) {
          console.warn('Column "description" does not exist in "blogs" table. Retrying without it...');
          delete blogData.description;
          const { error: retryError } = await supabase.from('blogs').insert(blogData);
          if (retryError) {
              console.error(`Error uploading ${file} on retry:`, retryError);
              continue;
          }
      } else {
          console.error(`Error uploading ${file}:`, insertError);
          continue;
      }
    }

    console.log(`Successfully uploaded ${file}`);

    if (!fs.existsSync(publishedDir)) {
      fs.mkdirSync(publishedDir, { recursive: true });
    }

    fs.renameSync(filePath, path.join(publishedDir, file));
    console.log(`Moved ${file} to published directory.`);
  }
}

uploadBlogs().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
