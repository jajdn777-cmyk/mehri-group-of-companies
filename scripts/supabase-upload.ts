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
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const queueDir = './content/queue';
const publishedDir = './content/published';

async function uploadBlogs() {
  if (!fs.existsSync(queueDir)) {
    console.log('Queue directory does not exist.');
    return;
  }

  const files = fs.readdirSync(queueDir).filter(file => file.endsWith('.md'));

  if (files.length === 0) {
    console.log('No blogs in queue.');
    return;
  }

  for (const file of files) {
    const filePath = path.join(queueDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content: body } = matter(content);

    // Ensure marked returns a string
    const htmlContent = await marked.parse(body);

    const blogData = {
      user_id: '7288c2ef-17cb-46f0-93da-117cba136577',
      title: frontmatter.title,
      content: htmlContent,
      author_name: 'Mehri group of companies',
      cover_image: frontmatter.image_url || frontmatter.cover_image || '',
      category: frontmatter.category || 'Article',
      created_at: frontmatter.date || new Date().toISOString(),
      likes_count: 0
    };

    console.log(`Uploading ${file}...`);

    const { error } = await supabase
      .from('blogs')
      .insert([blogData]);

    if (error) {
      console.error(`Error uploading ${file}:`, error);
    } else {
      console.log(`Successfully uploaded ${file}`);

      if (!fs.existsSync(publishedDir)) {
        fs.mkdirSync(publishedDir, { recursive: true });
      }
      fs.renameSync(filePath, path.join(publishedDir, file));
    }
  }
}

uploadBlogs().catch(err => {
  console.error('Upload script failed:', err);
  process.exit(1);
});
