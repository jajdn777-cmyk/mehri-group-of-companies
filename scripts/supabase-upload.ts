import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const supabaseUrl = 'https://tmahfhkuvvjnphynpknu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const QUEUE_DIR = './content/queue';
const PUBLISHED_DIR = './content/published';

async function uploadBlogs() {
  const files = fs.readdirSync(QUEUE_DIR).filter(file => file.endsWith('.md'));

  if (files.length === 0) {
    console.log('No blogs found in queue');
    return;
  }

  for (const file of files) {
    const filePath = path.join(QUEUE_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    const htmlContent = await marked(content);

    const blogData = {
      title: data.title,
      content: htmlContent,
      cover_image: data.image_url,
      seo_description: data.description,
      user_id: process.env.BLOG_AUTHOR_USER_ID || '7288c2ef-17cb-46f0-93da-117cba136577',
      author_name: 'Mehri Group of Companies',
      created_at: data.date ? new Date(data.date).toISOString() : new Date().toISOString()
    };

    const { error } = await supabase
      .from('blogs')
      .insert([blogData]);

    if (error) {
      console.error(`Error uploading ${file}:`, error.message);
    } else {
      console.log(`Successfully uploaded ${file}`);
      const publishedPath = path.join(PUBLISHED_DIR, file);
      fs.renameSync(filePath, publishedPath);
      console.log(`Moved ${file} to ${PUBLISHED_DIR}`);
    }
  }
}

uploadBlogs().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
