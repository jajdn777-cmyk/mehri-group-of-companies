
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { createClient } from '@supabase/supabase-js';

const QUEUE_DIR = './content/queue';
const PUBLISHED_DIR = './content/published';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tmahfhkuvvjnphynpknu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BLOG_AUTHOR_USER_ID = process.env.BLOG_AUTHOR_USER_ID || '7288c2ef-17cb-46f0-93da-117cba136577';
const BLOG_AUTHOR_NAME = 'Mehri Group of Companies';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is required.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function uploadBlogs() {
  const files = fs.readdirSync(QUEUE_DIR).filter(file => file.endsWith('.md') && file !== '.gitkeep');

  if (files.length === 0) {
    console.log('No blogs in queue.');
    return;
  }

  console.log(`Processing ${files.length} blogs...`);

  for (const file of files) {
    const filePath = path.join(QUEUE_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content: body } = matter(fileContent);
    const htmlContent = await marked.parse(body);

    const blogData = {
      title: frontmatter.title,
      content: htmlContent,
      cover_image: frontmatter.image_url,
      seo_description: frontmatter.description,
      user_id: BLOG_AUTHOR_USER_ID,
      author_name: BLOG_AUTHOR_NAME,
      read_time: `${Math.ceil(body.split(/\s+/).length / 200)} min`,
      created_at: frontmatter.date ? new Date(frontmatter.date).toISOString() : new Date().toISOString(),
      category: frontmatter.category || 'General'
    };

    console.log(`Uploading: ${blogData.title}...`);

    const { error } = await supabase.from('blogs').insert(blogData);

    if (error) {
      console.error(`Failed to upload ${file}:`, error.message);
      continue;
    }

    // Move to published
    const destPath = path.join(PUBLISHED_DIR, file);
    fs.renameSync(filePath, destPath);
    console.log(`Successfully published and moved: ${file}`);
  }
}

uploadBlogs().catch(err => {
  console.error('Upload script failed:', err);
  process.exit(1);
});
