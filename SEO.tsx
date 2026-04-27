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
  product?: {
    name: string;
    description: string;
    image: string;
    price: string;
    currency: string;
    availability: string;
    url: string;
  };
  faq?: Array<{
    question: string;
    answer: string;
  }>;
}

/**
 * SEO Component
 * Manages document head metadata and JSON-LD structured data dynamically.
 * Optimized for: Professional Wellness & Executive Fitness keywords.
 */
export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description = "Elite performance tracking and biometric architecture. Mehri delivers executive fitness via Mehri fitness tracker hardware .",
  view,
  article,
  product,
  faq
}) => {
  const brandName = "Mehri";
  const defaultTitle = `${brandName} | Executive Wellness & AI Fitness`;
  const finalTitle = title || defaultTitle;

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
          "name": "Mehri",
          "url": "https://mehrigroupofcompanies.com/",
          "logo": "https://i.ibb.co.com/xqxm5rCT/logo-mehri-no-bg.png",
          "contactPoint": {
            "@type": "ContactPoint",
            "email": "shamsullah.mehri@gmail.com",
            "contactType": "customer service"
          }
        },
        {
          "@type": "WebSite",
          "@id": "https://mehrigroupofcompanies.com/#website",
          "url": "https://mehrigroupofcompanies.com/",
          "name": "Mehri",
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
          "email": "shamsullah.mehri@gmail.com"
        },
        "publisher": { "@id": "https://mehrigroupofcompanies.com/#organization" },
        "datePublished": article.datePublished,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": article.url
        }
      });
    }

    // Add Product Schema if applicable
    if (product) {
      schemaData["@graph"].push({
        "@type": "Product",
        "name": product.name,
        "description": product.description,
        "image": product.image,
        "offers": {
          "@type": "Offer",
          "price": product.price,
          "priceCurrency": product.currency,
          "availability": product.availability === 'InStock' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "url": product.url
        },
        "brand": { "@id": "https://mehrigroupofcompanies.com/#organization" }
      });
    }

    // Add FAQ Schema if applicable
    if (faq && faq.length > 0) {
      schemaData["@graph"].push({
        "@type": "FAQPage",
        "mainEntity": faq.map(item => ({
          "@type": "Question",
          "name": item.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.answer
          }
        }))
      });
    }

    const script = document.createElement('script');
    script.id = 'mehri-json-ld';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemaData);
    document.head.appendChild(script);

  }, [finalTitle, description, view, article, product, faq]);

  return null;
};
