import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const supabaseUrl = process.env.SUPABASE_URL || 'https://tmahfhkuvvjnphynpknu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const queueDir = './content/queue';
const publishedDir = './content/published';

async function uploadBlogs() {
  const files = fs.readdirSync(queueDir).filter(file => file.endsWith('.md') && file !== '.gitkeep');

  if (files.length === 0) {
    console.log('No blogs in queue.');
    return;
  }

  for (const file of files) {
    const filePath = path.join(queueDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontMatter, content: body } = matter(fileContent);

    const htmlContent = await marked.parse(body);
    const readTime = Math.ceil(body.split(/\s+/).length / 200);

    const blogData = {
      title: frontMatter.title,
      content: htmlContent,
      cover_image: frontMatter.image_url,
      seo_description: frontMatter.description,
      user_id: process.env.BLOG_AUTHOR_USER_ID || '7288c2ef-17cb-46f0-93da-117cba136577',
      author_name: 'Mehri group of companies',
      read_time: readTime,
      created_at: frontMatter.date || new Date().toISOString(),
    };

    console.log(`Uploading: ${frontMatter.title}...`);

    const { error } = await supabase
      .from('blogs')
      .insert([blogData]);

    if (error) {
      console.error(`Error uploading ${file}:`, error.message);
    } else {
      console.log(`Successfully uploaded ${file}. Moving to published...`);
      const publishedPath = path.join(publishedDir, file);
      fs.renameSync(filePath, publishedPath);
    }
  }
}

uploadBlogs().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
