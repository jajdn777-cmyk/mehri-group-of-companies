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

const QUEUE_DIR = path.join(process.cwd(), 'content/queue');
const PUBLISHED_DIR = path.join(process.cwd(), 'content/published');

async function uploadBlogs() {
  const files = fs.readdirSync(QUEUE_DIR).filter(file => file.endsWith('.md'));

  if (files.length === 0) {
    console.log('No blogs in queue.');
    return;
  }

  for (const file of files) {
    const filePath = path.join(QUEUE_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content: markdownBody } = matter(fileContent);
    const htmlBody = await marked.parse(markdownBody);

    const blogData = {
      title: frontmatter.title,
      content: htmlBody,
      category: frontmatter.category || 'Performance',
      author_name: 'Mehri group of companies',
      user_id: '7288c2ef-17cb-46f0-93da-117cba136577',
      cover_image: frontmatter.image_url,
      created_at: frontmatter.date || new Date().toISOString(),
      likes_count: 0
    };

    console.log(`Uploading ${file}...`);
    const { error } = await supabase.from('blogs').insert([blogData]);

    if (error) {
      console.error(`Error uploading ${file}:`, error.message);
    } else {
      console.log(`Successfully uploaded ${file}`);
      // Ensure the published directory exists (just in case)
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
