import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://tmahfhkuvvjnphynpknu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const QUEUE_DIR = path.join(process.cwd(), 'content/queue');
const PUBLISHED_DIR = path.join(process.cwd(), 'content/published');

async function uploadBlogs() {
  if (!fs.existsSync(QUEUE_DIR)) {
    console.log('No queue directory found.');
    return;
  }

  const files = fs.readdirSync(QUEUE_DIR).filter(f => f.endsWith('.md'));

  if (files.length === 0) {
    console.log('No blogs in queue.');
    return;
  }

  for (const file of files) {
    if (file === '.gitkeep') continue;

    const filePath = path.join(QUEUE_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const { data, content: body } = matter(content);

    // marked can be sync or async depending on version, here we use sync if possible
    const htmlContent = marked.parse(body);

    const blogPost = {
      title: data.title,
      content: htmlContent,
      category: data.category || 'Article',
      author_name: 'Mehri group of companies',
      user_id: '7288c2ef-17cb-46f0-93da-117cba136577',
      cover_image: data.image_url || data.cover_image,
      created_at: data.date || new Date().toISOString(),
      likes_count: 0
    };

    console.log(`Uploading: ${blogPost.title}`);

    const { error } = await supabase
      .from('blogs')
      .insert([blogPost]);

    if (error) {
      console.error(`Error uploading ${file}:`, error);
    } else {
      console.log(`Successfully uploaded ${file}`);
      if (!fs.existsSync(PUBLISHED_DIR)) {
        fs.mkdirSync(PUBLISHED_DIR, { recursive: true });
      }
      fs.renameSync(filePath, path.join(PUBLISHED_DIR, file));
    }
  }
}

uploadBlogs().catch(err => {
  console.error('Upload script failed:', err);
  process.exit(1);
});
