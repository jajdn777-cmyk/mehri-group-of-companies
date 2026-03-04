import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const SUPABASE_URL = 'https://tmahfhkuvvjnphynpknu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const QUEUE_DIR = './content/queue';
const PUBLISHED_DIR = './content/published';

// Default user ID for author if not provided
const DEFAULT_USER_ID = process.env.BLOG_AUTHOR_USER_ID || '7288c2ef-17cb-46f0-93da-117cba136577';

async function uploadBlogs() {
  if (!fs.existsSync(QUEUE_DIR)) {
    console.log('Queue directory does not exist.');
    return;
  }

  const files = fs.readdirSync(QUEUE_DIR).filter(f => f.endsWith('.md') && !f.startsWith('.'));

  if (files.length === 0) {
    console.log('No blogs in queue.');
    return;
  }

  for (const file of files) {
    const filePath = path.join(QUEUE_DIR, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const { data: frontmatter, content: body } = matter(content);

      // Convert body to HTML since the BlogList component uses dangerouslySetInnerHTML
      const htmlContent = marked(body);

      // Calculate read time
      const wordCount = body.split(/\s+/).filter(Boolean).length;
      const readTime = `${Math.ceil(wordCount / 200)} MIN READ`;

      const blogData = {
        title: frontmatter.title || 'Untitled Post',
        content: htmlContent,
        author_name: frontmatter.author || 'Mehri Group of Companies',
        cover_image: frontmatter.image_url || null,
        category: frontmatter.category || 'Insights',
        read_time: readTime,
        user_id: DEFAULT_USER_ID,
        created_at: frontmatter.date ? new Date(frontmatter.date).toISOString() : new Date().toISOString()
      };

      console.log(`Uploading: ${blogData.title}...`);

      const { error } = await supabase.from('blogs').insert(blogData);

      if (error) {
        console.error(`Error uploading ${file}:`, error.message);
      } else {
        console.log(`Successfully uploaded ${file}.`);
        if (!fs.existsSync(PUBLISHED_DIR)) {
          fs.mkdirSync(PUBLISHED_DIR, { recursive: true });
        }
        fs.renameSync(filePath, path.join(PUBLISHED_DIR, file));
      }
    } catch (err: any) {
      console.error(`Failed to process ${file}:`, err.message);
    }
  }
}

uploadBlogs().catch(err => {
  console.error('Upload script failed:', err);
  process.exit(1);
});
