import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tmahfhkuvvjnphynpknu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BLOG_AUTHOR_USER_ID = process.env.BLOG_AUTHOR_USER_ID || '7288c2ef-17cb-46f0-93da-117cba136577';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const QUEUE_DIR = './content/queue';
const PUBLISHED_DIR = './content/published';

async function uploadBlogs() {
  const files = fs.readdirSync(QUEUE_DIR).filter(file => file.endsWith('.md'));

  if (files.length === 0) {
    console.log('No blogs in queue.');
    return;
  }

  for (const file of files) {
    const filePath = path.join(QUEUE_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontMatter, content: body } = matter(fileContent);

    const htmlContent = await marked.parse(body);
    const wordCount = body.split(/\s+/).filter(Boolean).length;
    const readTime = `${Math.ceil(wordCount / 200)} MIN READ`;

    const blogData = {
      user_id: BLOG_AUTHOR_USER_ID,
      title: frontMatter.title,
      content: htmlContent,
      author_name: 'Mehri group of companies',
      cover_image: frontMatter.image_url,
      read_time: readTime,
      category: frontMatter.category || 'Performance',
      seo_description: frontMatter.description,
      created_at: frontMatter.date ? new Date(frontMatter.date).toISOString() : new Date().toISOString()
    };

    console.log(`Uploading: ${frontMatter.title}...`);

    const { data, error } = await supabase
      .from('blogs')
      .insert([blogData])
      .select();

    if (error) {
      console.error(`Error uploading ${file}:`, error.message);
    } else {
      console.log(`Successfully uploaded: ${frontMatter.title}`);

      // Move to published
      const destPath = path.join(PUBLISHED_DIR, file);
      fs.renameSync(filePath, destPath);
      console.log(`Moved ${file} to ${PUBLISHED_DIR}`);
    }
  }
}

uploadBlogs().catch(err => {
  console.error('Upload script failed:', err);
  process.exit(1);
});
