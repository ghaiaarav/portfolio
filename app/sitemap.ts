import { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  const posts = getBlogPosts();

  const routes = [
    "",
    "/projects",
    "/experience",
    "/options",
    "/options/about",
    "/options/accessibility",
    "/options/contact",
    "/options/gallery",
    "/options/statistics",
    "/options/resource-packs",
    "/activities",
    ...(posts.length ? ["/blog"] : []),
    "/logs",
    "/honors",
  ];

  return [
    ...routes.map((route) => ({
      url: `${base}${route}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: route === "" ? 1 : 0.8,
    })),
    ...posts.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
