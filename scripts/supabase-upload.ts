import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const supabaseUrl = process.env.SUPABASE_URL || 'https://tmahfhkuvvjnphynpknu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const queueDir = path.join(process.cwd(), 'content/queue');
const publishedDir = path.join(process.cwd(), 'content/published');

async function uploadBlogs() {
  const files = fs.readdirSync(queueDir).filter(file => file.endsWith('.md') && file !== '.gitkeep');

  for (const file of files) {
    const filePath = path.join(queueDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data, content: body } = matter(content);

    const htmlContent = await marked.parse(body);
    const readTime = Math.ceil(body.split(/\s+/).length / 200);

    const blogData = {
      title: data.title,
      content: htmlContent,
      cover_image: data.image_url,
      seo_description: data.description,
      author_name: 'Mehri group of companies',
      user_id: process.env.BLOG_AUTHOR_USER_ID || '7288c2ef-17cb-46f0-93da-117cba136577',
      read_time: readTime,
      created_at: data.date || new Date().toISOString(),
      likes_count: 0
    };

    const { error } = await supabase
      .from('blogs')
      .insert([blogData]);

    if (error) {
      console.error(`Error uploading ${file}:`, error.message);
    } else {
      console.log(`Successfully uploaded ${file}`);
      fs.renameSync(filePath, path.join(publishedDir, file));
    }
  }
}

uploadBlogs().catch(err => {
  console.error('Upload script failed:', err);
  process.exit(1);
});
