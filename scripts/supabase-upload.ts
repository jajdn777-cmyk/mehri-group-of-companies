import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://tmahfhkuvvjnphynpknu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_USER_ID = '7288c2ef-17cb-46f0-93da-117cba136577';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function uploadBlogs() {
  const queueDir = path.join(process.cwd(), 'content/queue');
  const publishedDir = path.join(process.cwd(), 'content/published');

  if (!fs.existsSync(queueDir)) {
    console.error('Queue directory does not exist');
    return;
  }

  const files = fs.readdirSync(queueDir).filter(file => file.endsWith('.md') && file !== '.gitkeep');

  if (files.length === 0) {
    console.log('No blogs in queue.');
    return;
  }

  for (const file of files) {
    const filePath = path.join(queueDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    const htmlContent = await marked(content);

    const blogPost = {
      title: data.title,
      content: htmlContent,
      author_name: 'Mehri group of companies',
      created_at: data.date || new Date().toISOString(),
      category: data.category || 'Insights',
      cover_image: data.image_url || null,
      likes_count: 0,
      user_id: ADMIN_USER_ID
    };

    console.log(`Uploading: ${data.title}`);

    const { error } = await supabase.from('blogs').insert([blogPost]);

    if (error) {
      console.error(`Error uploading ${file}:`, error);
    } else {
      console.log(`Successfully uploaded ${file}`);
      if (!fs.existsSync(publishedDir)) {
        fs.mkdirSync(publishedDir, { recursive: true });
      }
      const newPath = path.join(publishedDir, file);
      fs.renameSync(filePath, newPath);
    }
  }
}

uploadBlogs().catch(err => {
  console.error('Upload script failed:', err);
  process.exit(1);
});
