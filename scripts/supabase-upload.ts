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

const QUEUE_DIR = './content/queue';
const PUBLISHED_DIR = './content/published';
const AUTHOR_ID = process.env.BLOG_AUTHOR_USER_ID || '7288c2ef-17cb-46f0-93da-117cba136577';

async function uploadBlogs() {
  const files = fs.readdirSync(QUEUE_DIR).filter(f => f.endsWith('.md'));

  if (files.length === 0) {
    console.log('No blogs in queue.');
    return;
  }

  for (const file of files) {
    const filePath = path.join(QUEUE_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content: body } = matter(content);

    const htmlContent = await marked.parse(body);
    const wordCount = body.split(/\s+/).length;
    const readTime = `${Math.ceil(wordCount / 200)} MIN READ`;

    const blogData = {
      title: frontmatter.title,
      content: htmlContent,
      cover_image: frontmatter.image_url,
      seo_description: frontmatter.description,
      user_id: AUTHOR_ID,
      author_name: 'Mehri group of companies',
      created_at: new Date(frontmatter.date || new Date()).toISOString(),
      likes_count: 0
    };

    console.log(`Uploading: ${frontmatter.title}`);
    const { error } = await supabase.from('blogs').insert([blogData]);

    if (error) {
      console.error(`Error uploading ${file}:`, error.message);
    } else {
      console.log(`Successfully uploaded: ${file}`);
      fs.renameSync(filePath, path.join(PUBLISHED_DIR, file));
    }
  }
}

uploadBlogs().catch(err => {
  console.error('Upload script failed:', err);
  process.exit(1);
});
