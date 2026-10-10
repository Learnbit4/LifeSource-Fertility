import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/donors", "/become-a-donor", "/book", "/contact", "/terms"].map((p) => ({ url: `${SITE.url}${p}`, lastModified: new Date() }));
}
