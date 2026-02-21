
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://tmahfhkuvvjnphynpknu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_USER_ID = process.env.ADMIN_USER_ID || '7288c2ef-17cb-46f0-93da-117cba136577';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const QUEUE_DIR = path.join(process.cwd(), 'content/queue');
const PUBLISHED_DIR = path.join(process.cwd(), 'content/published');

async function uploadBlogs() {
  const files = fs.readdirSync(QUEUE_DIR).filter(file => file.endsWith('.md'));

  if (files.length === 0) {
    console.log('No blogs in queue to upload.');
    return;
  }

  console.log(`Found ${files.length} blogs in queue.`);

  for (const file of files) {
    const filePath = path.join(QUEUE_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content: markdownBody } = matter(fileContent);

    const htmlContent = marked.parse(markdownBody);

    const blogData = {
      title: frontmatter.title || 'Untitled Blog',
      content: htmlContent,
      author_name: frontmatter.author || 'Mehri group of companies',
      cover_image: frontmatter.image_url || frontmatter.cover_image || null,
      category: frontmatter.category || 'Insights',
      created_at: frontmatter.date ? new Date(frontmatter.date).toISOString() : new Date().toISOString(),
      likes_count: 0,
      user_id: ADMIN_USER_ID
    };

    console.log(`Uploading: ${blogData.title}...`);

    const { error } = await supabase
      .from('blogs')
      .insert([blogData]);

    if (error) {
      console.error(`Failed to upload ${file}:`, error.message);
    } else {
      console.log(`Successfully uploaded ${file}. Moving to published...`);
      const destPath = path.join(PUBLISHED_DIR, file);
      fs.renameSync(filePath, destPath);
    }
  }
}

uploadBlogs().catch(err => {
  console.error('Upload script failed:', err);
  process.exit(1);
});
