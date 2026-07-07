import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tmahfhkuvvjnphynpknu.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const QUEUE_DIR = './content/queue';
const PUBLISHED_DIR = './content/published';

async function uploadBlogs() {
  const files = fs.readdirSync(QUEUE_DIR).filter(file => file.endsWith('.md'));

  for (const file of files) {
    console.log(`Processing ${file}...`);
    const filePath = path.join(QUEUE_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    const htmlContent = marked(content);

    // Simple read time calculation
    const wordCount = content.split(/\s+/).length;
    const readTime = `${Math.ceil(wordCount / 200)} MIN READ`;

    const blogData = {
      title: data.title,
      content: htmlContent,
      cover_image: data.image_url,
      seo_description: data.description,
      author_name: 'Mehri Group of Companies',
      user_id: '7288c2ef-17cb-46f0-93da-117cba136577', // Default admin ID from memory
      created_at: new Date(data.date).toISOString(),
    };

    const { error } = await supabase.from('blogs').insert([blogData]);

    if (error) {
      console.error(`Error uploading ${file}:`, error.message);
    } else {
      console.log(`Successfully uploaded ${file}`);
      const newPath = path.join(PUBLISHED_DIR, file);
      fs.renameSync(filePath, newPath);
      console.log(`Moved ${file} to ${PUBLISHED_DIR}`);
    }
  }
}

uploadBlogs().catch(err => {
  console.error('Upload failed:', err);
  process.exit(1);
});
