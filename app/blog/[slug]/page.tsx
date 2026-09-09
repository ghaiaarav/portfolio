import McMenuScreen from "@/components/mc/McMenuScreen";
import WrittenBook from "@/components/WrittenBook";
import { getBlogPost, getBlogPosts } from "@/lib/content";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Post not found" };
  return { title: post.title };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <McMenuScreen title={post.title} doneHref="/blog">
      <div className="mc-menu-content">
        <p style={{ color: "#aaa", marginBottom: "1rem" }}>{post.date}</p>
        <WrittenBook content={post.content} />
      </div>
    </McMenuScreen>
  );
}
