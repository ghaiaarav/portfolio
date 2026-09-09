import McMenuScreen from "@/components/mc/McMenuScreen";
import { getBlogPosts } from "@/lib/content";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Record Screen" };

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <McMenuScreen title="Record Screen" doneHref="/options">
      <div className="mc-menu-content mc-menu-content--center">
        <div className="bookshelf">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="book-spine" prefetch>
              {post.title}
            </Link>
          ))}
        </div>
        {posts.length === 0 && <p>No posts yet.</p>}
      </div>
    </McMenuScreen>
  );
}
