import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://tmahfhkuvvjnphynpknu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const QUEUE_DIR = path.join(process.cwd(), 'content', 'queue');
const PUBLISHED_DIR = path.join(process.cwd(), 'content', 'published');

// Default user_id for the admin/Mehri group
const DEFAULT_USER_ID = '7288c2ef-17cb-46f0-93da-117cba136577';

async function uploadBlogs() {
  if (!fs.existsSync(QUEUE_DIR)) {
    console.error('Queue directory does not exist');
    return;
  }

  const files = fs.readdirSync(QUEUE_DIR).filter(file => file.endsWith('.md'));

  if (files.length === 0) {
    console.log('No blogs in queue');
    return;
  }

  for (const file of files) {
    if (file === '.gitkeep') continue;

    const filePath = path.join(QUEUE_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    // Convert markdown to HTML
    const htmlContent = await marked.parse(content);

    const blogPost = {
      user_id: DEFAULT_USER_ID,
      title: (data.title || file.replace('.md', '')).toUpperCase(),
      content: htmlContent,
      author_name: 'Mehri group of companies',
      created_at: data.date || new Date().toISOString(),
      cover_image: data.image_url || null,
    };

    console.log(`Uploading ${file}...`);

    const { error } = await supabase.from('blogs').insert([blogPost]);

    if (error) {
      console.error(`Error uploading ${file}:`, error.message);
    } else {
      console.log(`Successfully uploaded ${file}`);

      if (!fs.existsSync(PUBLISHED_DIR)) {
        fs.mkdirSync(PUBLISHED_DIR, { recursive: true });
      }

      const newPath = path.join(PUBLISHED_DIR, file);
      fs.renameSync(filePath, newPath);
      console.log(`Moved ${file} to published/`);
    }
  }
}

uploadBlogs().catch(err => {
  console.error('Upload script failed:', err);
  process.exit(1);
});
