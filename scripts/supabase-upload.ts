import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tmahfhkuvvjnphynpknu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BLOG_AUTHOR_USER_ID = process.env.BLOG_AUTHOR_USER_ID || '7288c2ef-17cb-46f0-93da-117cba136577';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const QUEUE_DIR = path.join(process.cwd(), 'content', 'queue');
const PUBLISHED_DIR = path.join(process.cwd(), 'content', 'published');

async function uploadBlogs() {
  const files = fs.readdirSync(QUEUE_DIR).filter(f => f.endsWith('.md'));

  for (const file of files) {
    const filePath = path.join(QUEUE_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data: frontMatter, content: markdownBody } = matter(content);
    const htmlBody = await marked.parse(markdownBody);

    console.log(`Uploading ${file}...`);

    const { data, error } = await supabase.from('blogs').insert({
      user_id: BLOG_AUTHOR_USER_ID,
      title: frontMatter.title,
      content: htmlBody,
      author_name: 'Mehri Group of Companies',
      cover_image: frontMatter.image_url,
      seo_description: frontMatter.description,
      category: frontMatter.category || 'Fitness',
      read_time: frontMatter.read_time || '5 min',
      created_at: new Date(frontMatter.date || new Date()).toISOString()
    }).select().single();

    if (error) {
      console.error(`Error uploading ${file}:`, error.message);
    } else {
      console.log(`Successfully uploaded ${file}. Moving to published...`);
      fs.renameSync(filePath, path.join(PUBLISHED_DIR, file));
    }
  }
}

uploadBlogs().catch(console.error);
