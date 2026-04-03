
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const supabaseUrl = 'https://tmahfhkuvvjnphynpknu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const QUEUE_DIR = './content/queue';
const PUBLISHED_DIR = './content/published';
const DEFAULT_USER_ID = '7288c2ef-17cb-46f0-93da-117cba136577';

async function uploadBlogs() {
  const files = fs.readdirSync(QUEUE_DIR).filter(f => f.endsWith('.md') && f !== '.gitkeep');

  if (files.length === 0) {
    console.log('No blogs in queue.');
    return;
  }

  for (const file of files) {
    const filePath = path.join(QUEUE_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontMatter, content: body } = matter(fileContent);

    const htmlContent = await marked.parse(body);
    const wordCount = body.split(/\s+/).length;
    const readTime = `${Math.ceil(wordCount / 200)} MIN READ`;

    const blogData = {
      title: frontMatter.title,
      content: htmlContent,
      cover_image: frontMatter.image_url,
      seo_description: frontMatter.description,
      author_name: 'Mehri group of companies',
      read_time: readTime,
      category: frontMatter.category || 'Insights',
      user_id: process.env.BLOG_AUTHOR_USER_ID || DEFAULT_USER_ID,
      created_at: frontMatter.date ? new Date(frontMatter.date).toISOString() : new Date().toISOString(),
      likes_count: 0
    };

    console.log(`Uploading: ${frontMatter.title}...`);

    const { error } = await supabase.from('blogs').insert([blogData]);

    if (error) {
      console.error(`Error uploading ${file}:`, error.message);
    } else {
      console.log(`Successfully uploaded ${file}. Moving to published.`);
      fs.renameSync(filePath, path.join(PUBLISHED_DIR, file));
    }
  }
}

uploadBlogs().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
