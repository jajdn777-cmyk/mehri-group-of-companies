import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tmahfhkuvvjnphynpknu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BLOG_AUTHOR_USER_ID = process.env.BLOG_AUTHOR_USER_ID || '7288c2ef-17cb-46f0-93da-117cba136577';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const queueDir = path.join(process.cwd(), 'content/queue');
const publishedDir = path.join(process.cwd(), 'content/published');

async function uploadBlogs() {
  const files = fs.readdirSync(queueDir).filter(file => file.endsWith('.md'));

  if (files.length === 0) {
    console.log('No blogs found in queue.');
    return;
  }

  for (const file of files) {
    const filePath = path.join(queueDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    const htmlContent = await marked.parse(content);

    const blogData = {
      title: data.title,
      content: htmlContent,
      cover_image: data.image_url,
      seo_description: data.description,
      user_id: BLOG_AUTHOR_USER_ID,
      author_name: 'Mehri Group of Companies',
      created_at: data.date || new Date().toISOString()
    };

    console.log(`Uploading: ${data.title}...`);

    const { error } = await supabase
      .from('blogs')
      .insert([blogData]);

    if (error) {
      console.error(`Error uploading ${file}:`, error.message);
    } else {
      console.log(`Successfully uploaded ${file}. Moving to published...`);
      const destPath = path.join(publishedDir, file);
      fs.renameSync(filePath, destPath);
    }
  }
}

uploadBlogs().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
