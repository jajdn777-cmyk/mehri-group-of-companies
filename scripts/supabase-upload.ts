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

const QUEUE_DIR = './content/queue';
const PUBLISHED_DIR = './content/published';
const DEFAULT_USER_ID = '7288c2ef-17cb-46f0-93da-117cba136577';
const AUTHOR_NAME = 'Mehri Group of Companies';

async function uploadBlogs() {
  const files = fs.readdirSync(QUEUE_DIR).filter(file => file.endsWith('.md') && file !== '.gitkeep');

  if (files.length === 0) {
    console.log('No blogs in queue.');
    return;
  }

  for (const file of files) {
    const filePath = path.join(QUEUE_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data: frontMatter, content: markdownBody } = matter(fileContent);

    const htmlContent = marked.parse(markdownBody);

    // Calculate read time
    const wordCount = markdownBody.split(/\s+/).length;
    const readTimeMinutes = Math.ceil(wordCount / 200);
    const readTimeStr = `${readTimeMinutes} MIN READ`;

    const blogData = {
      title: frontMatter.title,
      content: htmlContent,
      cover_image: frontMatter.image_url,
      seo_description: frontMatter.description,
      user_id: process.env.BLOG_AUTHOR_USER_ID || DEFAULT_USER_ID,
      author_name: AUTHOR_NAME,
      read_time: readTimeStr,
      created_at: frontMatter.date || new Date().toISOString()
    };

    console.log(`Uploading: ${frontMatter.title}...`);

    const { error } = await supabase
      .from('blogs')
      .insert([blogData]);

    if (error) {
      console.error(`Error uploading ${file}:`, error.message);
    } else {
      console.log(`Successfully uploaded ${file}.`);
      // Move to published
      const publishedPath = path.join(PUBLISHED_DIR, file);
      fs.renameSync(filePath, publishedPath);
      console.log(`Moved ${file} to ${PUBLISHED_DIR}.`);
    }
  }
}

uploadBlogs().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
