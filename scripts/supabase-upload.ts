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
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is not set.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const QUEUE_DIR = path.join(process.cwd(), 'content/queue');
const PUBLISHED_DIR = path.join(process.cwd(), 'content/published');

async function uploadBlogs() {
  const files = fs.readdirSync(QUEUE_DIR).filter(file => file.endsWith('.md'));

  if (files.length === 0) {
    console.log('No blogs found in queue.');
    return;
  }

  for (const file of files) {
    const filePath = path.join(QUEUE_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontMatter, content: markdownBody } = matter(fileContent);

    const htmlContent = marked.parse(markdownBody);

    const blogData = {
      title: frontMatter.title,
      content: htmlContent,
      author_name: 'Mehri Group of Companies',
      user_id: process.env.BLOG_AUTHOR_USER_ID || '7288c2ef-17cb-46f0-93da-117cba136577',
      cover_image: frontMatter.image_url,
      seo_description: frontMatter.description,
      category: frontMatter.category || 'Fitness & Tech',
      created_at: frontMatter.date ? new Date(frontMatter.date).toISOString() : new Date().toISOString(),
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
      const newPath = path.join(PUBLISHED_DIR, file);
      fs.renameSync(filePath, newPath);
      console.log(`Moved ${file} to published/`);
    }
  }
}

uploadBlogs().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
