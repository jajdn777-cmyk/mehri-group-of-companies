import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://tmahfhkuvvjnphynpknu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const QUEUE_DIR = './content/queue';
const PUBLISHED_DIR = './content/published';

async function uploadBlogs() {
  if (!fs.existsSync(QUEUE_DIR)) {
    console.log('Queue directory does not exist.');
    return;
  }

  const files = fs.readdirSync(QUEUE_DIR).filter(f => f.endsWith('.md'));

  if (files.length === 0) {
    console.log('No blogs in queue.');
    return;
  }

  for (const file of files) {
    const filePath = path.join(QUEUE_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data, content: body } = matter(content);

    const htmlContent = await marked.parse(body);

    const blogPost = {
      title: data.title,
      content: htmlContent,
      author_name: 'Mehri group of companies',
      user_id: '7288c2ef-17cb-46f0-93da-117cba136577',
      category: data.category || 'Article',
      cover_image: data.image_url,
      likes_count: Math.floor(Math.random() * 50) + 10, // Add some initial engagement
      created_at: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    };

    console.log(`Uploading ${file}...`);
    const { error } = await supabase.from('blogs').insert([blogPost]);

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

uploadBlogs().catch(console.error);
