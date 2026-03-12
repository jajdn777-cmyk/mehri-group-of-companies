import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const QUEUE_DIR = path.join(__dirname, '../content/queue');
const PUBLISHED_DIR = path.join(__dirname, '../content/published');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tmahfhkuvvjnphynpknu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BLOG_AUTHOR_USER_ID = process.env.BLOG_AUTHOR_USER_ID || '7288c2ef-17cb-46f0-93da-117cba136577';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is not set.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function uploadBlogs() {
  if (!fs.existsSync(QUEUE_DIR)) {
    console.log('Queue directory does not exist.');
    return;
  }

  const files = fs.readdirSync(QUEUE_DIR).filter(file => file.endsWith('.md'));

  if (files.length === 0) {
    console.log('No blogs found in queue.');
    return;
  }

  for (const file of files) {
    const filePath = path.join(QUEUE_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    const htmlContent = marked.parse(content);

    const blogData = {
      title: data.title,
      content: htmlContent,
      cover_image: data.image_url,
      seo_description: data.description,
      user_id: BLOG_AUTHOR_USER_ID,
      author_name: 'Mehri Group of Companies',
      created_at: data.date ? new Date(data.date).toISOString() : new Date().toISOString()
    };

    console.log(`Uploading: ${data.title}...`);

    const { error } = await supabase
      .from('blogs')
      .insert([blogData]);

    if (error) {
      console.error(`Error uploading ${file}:`, error.message);
      continue;
    }

    console.log(`Successfully uploaded: ${file}`);

    // Move to published
    if (!fs.existsSync(PUBLISHED_DIR)) {
      fs.mkdirSync(PUBLISHED_DIR, { recursive: true });
    }
    fs.renameSync(filePath, path.join(PUBLISHED_DIR, file));
    console.log(`Moved ${file} to published folder.`);
  }
}

uploadBlogs().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
