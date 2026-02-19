import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  view?: string;
  article?: {
    title: string;
    description: string;
    image?: string;
    author: string;
    datePublished: string;
    url: string;
  };
}

/**
 * SEO Component
 * Manages document head metadata and JSON-LD structured data dynamically.
 * Optimized for: Professional Wellness & Executive Fitness keywords.
 */
export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description = "Elite performance tracking and biometric architecture. Mehri Group delivers executive fitness via Mehri fitness tracker hardware and Alma AI coaching.",
  view,
  article
}) => {
  const brandName = "Mehri Group of Companies";
  const defaultTitle = `${brandName} | Executive Wellness & AI Fitness`;
  const finalTitle = title ? `${title} | ${brandName}` : defaultTitle;

  useEffect(() => {
    // 1. Update Document Metadata
    document.title = finalTitle;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute('content', description);

    // 2. OpenGraph / Social Tags
    const updateTag = (selector: string, attr: string, content: string) => {
      let tag = document.querySelector(selector);
      if (!tag) {
        const parts = selector.split('[');
        const name = parts[1].split('=')[1].replace(/["'\]]/g, '');
        tag = document.createElement('meta');
        tag.setAttribute(selector.includes('property') ? 'property' : 'name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute(attr, content);
    };

    const imageToUse = article?.image || "https://i.ibb.co.com/xqxm5rCT/logo-mehri-no-bg.png";

    updateTag('meta[property="og:title"]', 'content', finalTitle);
    updateTag('meta[property="og:description"]', 'content', description);
    updateTag('meta[property="og:image"]', 'content', imageToUse);
    updateTag('meta[name="twitter:title"]', 'content', finalTitle);
    updateTag('meta[name="twitter:description"]', 'content', description);

    // 3. JSON-LD Structured Data Injection
    const existingScript = document.getElementById('mehri-json-ld');
    if (existingScript) existingScript.remove();

    const schemaData: any = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": "https://mehrigroupofcompanies.com/#organization",
          "name": "Mehri Group of Companies",
          "url": "https://mehrigroupofcompanies.com/",
          "logo": "https://i.ibb.co.com/xqxm5rCT/logo-mehri-no-bg.png",
          "contactPoint": {
            "@type": "ContactPoint",
            "email": "jajdn777@gmail.com",
            "contactType": "customer service"
          }
        },
        {
          "@type": "WebSite",
          "@id": "https://mehrigroupofcompanies.com/#website",
          "url": "https://mehrigroupofcompanies.com/",
          "name": "Mehri Group",
          "publisher": { "@id": "https://mehrigroupofcompanies.com/#organization" }
        }
      ]
    };

    // Add Article Schema if applicable
    if (article) {
      schemaData["@graph"].push({
        "@type": "BlogPosting",
        "headline": article.title,
        "description": article.description,
        "image": article.image,
        "author": {
          "@type": "Person",
          "name": article.author,
          "email": "jajdn777@gmail.com"
        },
        "publisher": { "@id": "https://mehrigroupofcompanies.com/#organization" },
        "datePublished": article.datePublished,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": article.url
        }
      });
    }

    const script = document.createElement('script');
    script.id = 'mehri-json-ld';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemaData);
    document.head.appendChild(script);

  }, [finalTitle, description, view, article]);

  return null;
};
