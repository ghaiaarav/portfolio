import fs from "fs";
import path from "path";
import matter from "gray-matter";

const contentDir = path.join(process.cwd(), "content");

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  content: string;
}

export function getBlogPosts(): BlogPost[] {
  const blogDir = path.join(contentDir, "blog");
  if (!fs.existsSync(blogDir)) return [];

  return fs
    .readdirSync(blogDir)
    .filter((f) => f.endsWith(".mdx"))
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(blogDir, filename), "utf-8");
      const { data, content } = matter(raw);
      return {
        slug,
        title: (data.title as string) ?? slug,
        date: String(data.date ?? ""),
        tags: (data.tags as string[]) ?? [],
        content,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getBlogPost(slug: string): BlogPost | null {
  const posts = getBlogPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}
