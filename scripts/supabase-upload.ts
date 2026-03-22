import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tmahfhkuvvjnphynpknu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BLOG_AUTHOR_USER_ID = process.env.BLOG_AUTHOR_USER_ID || '7288c2ef-17cb-46f0-93da-117cba136577';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const queueDir = path.join(process.cwd(), 'content/queue');
const publishedDir = path.join(process.cwd(), 'content/published');

async function uploadBlogs() {
  const files = fs.readdirSync(queueDir).filter(file => file.endsWith('.md'));

  if (files.length === 0) {
    console.log('No blogs in queue.');
    return;
  }

  for (const file of files) {
    const filePath = path.join(queueDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    console.log(`Processing ${file}...`);

    const htmlContent = await marked.parse(content);
    const wordCount = content.replace(/[#*`]/g, '').split(/\s+/).filter(Boolean).length;
    const readTime = `${Math.ceil(wordCount / 200)} MIN READ`;

    const blogData = {
      title: data.title,
      content: htmlContent,
      cover_image: data.image_url,
      seo_description: data.description,
      user_id: BLOG_AUTHOR_USER_ID,
      author_name: 'Mehri Group of Companies',
      category: data.category || 'Performance',
      read_time: readTime,
      created_at: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      likes_count: 0
    };

    const { error } = await supabase
      .from('blogs')
      .insert([blogData]);

    if (error) {
      console.error(`Error uploading ${file}:`, error.message);
    } else {
      console.log(`Successfully uploaded ${file}.`);
      fs.renameSync(filePath, path.join(publishedDir, file));
    }
  }
}

uploadBlogs().catch(err => {
  console.error('Upload script failed:', err);
  process.exit(1);
});
