
import { getCollection } from 'astro:content';

async function debug() {
  const posts = await getCollection('blog');
  console.log('--- BLOG POSTS ---');
  posts.forEach(post => {
    console.log(`ID: ${post.id}`);
    console.log(`Title: ${post.data.title}`);
    console.log(`PubDate: ${post.data.pubDate}`);
    console.log(`Path: ${post.filePath}`);
    console.log('---');
  });
}

debug();
