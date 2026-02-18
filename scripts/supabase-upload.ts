
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { config } from 'dotenv';

config({ path: '.env' });
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables.');
  console.error('URL:', supabaseUrl);
  console.error('Key:', supabaseServiceKey ? 'PRESENT' : 'MISSING');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function uploadBlogs() {
  const queueDir = path.join(process.cwd(), 'content/queue');
  const publishedDir = path.join(process.cwd(), 'content/published');

  if (!fs.existsSync(queueDir)) {
      console.error('Queue directory does not exist.');
      return;
  }

  const files = fs.readdirSync(queueDir).filter(f => f.endsWith('.md') && f !== '.gitkeep');

  if (files.length === 0) {
    console.log('No blogs found in queue.');
    return;
  }

  // Find admin user ID
  const adminEmail = process.env.VITE_ADMIN_EMAIL || 'jajdn777@gmail.com';
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', adminEmail)
    .single();

  if (userError || !userData) {
    console.error('Could not find admin user:', userError?.message || 'User not found');
    process.exit(1);
  }

  const userId = userData.id;

  for (const file of files) {
    const filePath = path.join(queueDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content } = matter(fileContent);

    const title = frontmatter.title || 'Untitled';
    const author = frontmatter.author || 'Mehri group of companies';
    const coverImage = frontmatter.image_url || null;
    const category = frontmatter.category || 'Insight';

    // Convert Markdown to HTML for the reader
    const contentHtml = await marked.parse(content);

    // Calculate read time from original content
    const wordCount = content.split(/\s+/).length;
    const readTime = `${Math.ceil(wordCount / 200)} MIN READ`;

    const { data, error } = await supabase.from('blogs').insert({
      user_id: userId,
      title: title.toUpperCase(),
      content: contentHtml,
      author_name: author,
      cover_image: coverImage,
      read_time: readTime,
      category: category,
      created_at: frontmatter.date ? new Date(frontmatter.date).toISOString() : new Date().toISOString()
    }).select().single();

    if (error) {
      console.error(`Error uploading ${file}:`, error.message);
      if (error.message.includes('likes')) {
          console.log('Retrying without likes column...');
          // Already removed likes in this version
      }
    } else {
      console.log(`Successfully uploaded: ${title}`);
      // Move to published
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
