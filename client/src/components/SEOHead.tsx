import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  breadcrumbs?: Array<{ name: string; item: string }>;
}

export function SEOHead({
  title,
  description,
  canonicalPath = "",
  breadcrumbs = [],
}: SEOHeadProps) {
  useEffect(() => {
    // 1. Update Document Title
    const fullTitle = title.includes("Disha") ? title : `${title} — Disha Hospitality & Safety Companion`;
    document.title = fullTitle;

    // 2. Update Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", description);

    // 3. Update OG Title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", fullTitle);

    // 4. Update OG Description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", description);

    // 5. Update Canonical URL
    const baseUrl = "https://disha.hospitality.ai";
    const canonicalUrl = `${baseUrl}${canonicalPath}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonicalUrl);

    // 6. Inject Breadcrumb Structured Data if provided
    let scriptTag = document.getElementById("seo-breadcrumbs-schema") as HTMLScriptElement | null;
    if (breadcrumbs.length > 0) {
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.id = "seo-breadcrumbs-schema";
        scriptTag.type = "application/ld+json";
        document.head.appendChild(scriptTag);
      }
      const schemaData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((b, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": b.name,
          "item": b.item.startsWith("http") ? b.item : `${baseUrl}${b.item}`,
        })),
      };
      scriptTag.textContent = JSON.stringify(schemaData);
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [title, description, canonicalPath, breadcrumbs]);

  return null;
}
