import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tmahfhkuvvjnphynpknu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const QUEUE_DIR = './content/queue';
const PUBLISHED_DIR = './content/published';

async function uploadBlogs() {
  const files = fs.readdirSync(QUEUE_DIR).filter(file => file.endsWith('.md'));

  if (files.length === 0) {
    console.log('No blogs in queue');
    return;
  }

  for (const file of files) {
    const filePath = path.join(QUEUE_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content: body } = matter(fileContent);

    const htmlContent = await marked.parse(body);
    const wordCount = body.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    const blogData = {
      title: frontmatter.title,
      content: htmlContent,
      cover_image: frontmatter.image_url,
      seo_description: frontmatter.description,
      author_name: 'Mehri group of companies',
      user_id: process.env.BLOG_AUTHOR_USER_ID || '7288c2ef-17cb-46f0-93da-117cba136577',
      read_time: `${readTime} MIN READ`,
      likes_count: 0,
      created_at: new Date(frontmatter.date || new Date()).toISOString()
    };

    const { error } = await supabase
      .from('blogs')
      .insert([blogData]);

    if (error) {
      console.error(`Error uploading ${file}:`, error.message);
    } else {
      console.log(`Successfully uploaded ${file}`);
      fs.renameSync(filePath, path.join(PUBLISHED_DIR, file));
    }
  }
}

uploadBlogs().catch(err => {
  console.error('Upload script failed:', err);
  process.exit(1);
});
