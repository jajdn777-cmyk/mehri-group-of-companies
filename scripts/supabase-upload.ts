
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://tmahfhkuvvjnphynpknu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const QUEUE_DIR = path.join(process.cwd(), 'content/queue');
const PUBLISHED_DIR = path.join(process.cwd(), 'content/published');

async function uploadBlogs() {
  const files = fs.readdirSync(QUEUE_DIR).filter(file => file.endsWith('.md') && file !== '.gitkeep');

  if (files.length === 0) {
    console.log('No blogs in queue.');
    return;
  }

  console.log(`Found ${files.length} blogs to upload...`);

  for (const file of files) {
    const filePath = path.join(QUEUE_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content: body } = matter(content);

    const htmlContent = marked(body);

    const blogData = {
      title: frontmatter.title || 'Untitled Post',
      content: htmlContent,
      author_name: frontmatter.author || 'Mehri Group of Companies',
      category: frontmatter.category || 'Insights',
      cover_image: frontmatter.image_url || null,
      created_at: frontmatter.date ? new Date(frontmatter.date).toISOString() : new Date().toISOString(),
      user_id: process.env.BLOG_AUTHOR_USER_ID || '7288c2ef-17cb-46f0-93da-117cba136577'
    };

    console.log(`Uploading: ${blogData.title}...`);

    const { data, error } = await supabase
      .from('blogs')
      .insert([blogData])
      .select();

    if (error) {
      console.error(`Error uploading ${file}:`, error.message);
    } else {
      console.log(`Successfully uploaded: ${file}`);
      // Move to published
      const destPath = path.join(PUBLISHED_DIR, file);
      fs.renameSync(filePath, destPath);
      console.log(`Moved ${file} to published/`);
    }
  }
}

uploadBlogs().catch(err => {
  console.error('Upload script failed:', err);
  process.exit(1);
});
