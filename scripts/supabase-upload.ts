import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tmahfhkuvvjnphynpknu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BLOG_AUTHOR_USER_ID = process.env.BLOG_AUTHOR_USER_ID || '7288c2ef-17cb-46f0-93da-117cba136577';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const QUEUE_DIR = './content/queue';
const PUBLISHED_DIR = './content/published';

async function uploadBlogs() {
  const files = fs.readdirSync(QUEUE_DIR).filter(file => file.endsWith('.md') && file !== '.gitkeep');

  if (files.length === 0) {
    console.log('No blogs in queue.');
    return;
  }

  for (const file of files) {
    const filePath = path.join(QUEUE_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(fileContent);

    const htmlContent = await marked.parse(content);

    // Estimate read time: ~200 words per minute
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200)) + ' min read';

    const blogData = {
      title: frontmatter.title,
      content: htmlContent,
      author_name: frontmatter.author || 'Mehri Group of Companies',
      cover_image: frontmatter.image_url,
      seo_description: frontmatter.description,
      user_id: BLOG_AUTHOR_USER_ID,
      read_time: readTime,
      category: frontmatter.category || 'Fitness',
      created_at: frontmatter.date ? new Date(frontmatter.date).toISOString() : new Date().toISOString()
    };

    console.log(`Uploading: ${frontmatter.title}`);

    const { error } = await supabase.from('blogs').insert(blogData);

    if (error) {
      console.error(`Error uploading ${file}:`, error.message);
    } else {
      console.log(`Successfully uploaded ${file}`);
      // Move to published
      const newPath = path.join(PUBLISHED_DIR, file);
      fs.renameSync(filePath, newPath);
    }
  }
}

uploadBlogs().catch(err => {
  console.error('Upload script failed:', err);
  process.exit(1);
});
