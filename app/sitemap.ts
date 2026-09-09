import type { MetadataRoute } from "next";
import { siteUrl } from "./site-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-09-07T00:00:00+02:00");
  return [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/tierkrankenversicherung/`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/private-krankenversicherung/`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/impressum/`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/erstinformation/`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/datenschutz/`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
