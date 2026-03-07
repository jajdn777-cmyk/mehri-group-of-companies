import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tmahfhkuvvjnphynpknu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is required in the environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const QUEUE_DIR = './content/queue';
const PUBLISHED_DIR = './content/published';
const AUTHOR_NAME = 'Mehri Group of Companies';
// Hardcoded admin user ID found in memory or typical for this setup
const ADMIN_USER_ID = process.env.BLOG_AUTHOR_USER_ID || '7288c2ef-17cb-46f0-93da-117cba136577';

async function uploadBlogs() {
  const files = fs.readdirSync(QUEUE_DIR).filter(f => f.endsWith('.md') && f !== '.gitkeep');

  if (files.length === 0) {
    console.log('No blogs in queue.');
    return;
  }

  for (const file of files) {
    const filePath = path.join(QUEUE_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content: markdownContent } = matter(content);
    const htmlContent = marked.parse(markdownContent);

    console.log(`Uploading: ${file}...`);

    const { error } = await supabase.from('blogs').insert([{
      user_id: ADMIN_USER_ID,
      title: frontmatter.title,
      content: htmlContent,
      author_name: AUTHOR_NAME,
      cover_image: frontmatter.image_url,
      seo_description: frontmatter.description,
      category: frontmatter.category || 'Insights',
      created_at: frontmatter.date ? new Date(frontmatter.date).toISOString() : new Date().toISOString()
    }]);

    if (error) {
      console.error(`Failed to upload ${file}:`, error.message);
    } else {
      console.log(`Successfully uploaded: ${file}`);
      const publishedPath = path.join(PUBLISHED_DIR, file);
      fs.renameSync(filePath, publishedPath);
      console.log(`Moved ${file} to published folder.`);
    }
  }
}

uploadBlogs().catch(err => {
  console.error('An unexpected error occurred:', err);
  process.exit(1);
});
