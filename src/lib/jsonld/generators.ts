/**
 * JSON-LD Structured Data Generator
 * Generates Article, FAQPage, and BreadcrumbList schemas.
 */

export interface JsonLdInput {
  article: {
    title: string;
    meta_description: string;
    body_html: string;
    word_count: number;
    seo_keywords: string[];
    faq?: Array<{ question: string; answer: string }>;
  };
  location?: { city: string; state: string } | null;
  category: string;
  slug?: string | null;
  publishedAt?: string | null;
  author?: {
    name: string;
    title?: string;
    bio?: string;
    imageUrl?: string;
    profileUrl?: string;
  };
}

interface JsonLdSchema {
  '@context': string;
  '@type': string;
  [key: string]: unknown;
}

export interface JsonLdOutput {
  article: JsonLdSchema;
  faq: JsonLdSchema | null;
  breadcrumb: JsonLdSchema;
}

const ORG = {
  name: 'SoCal Calibration',
  url: 'https://socalcalibration.com',
  logo: 'https://socalcalibration.com/wp-content/uploads/2024/socal-calibration-logo.png',
};

export function generateArticleJsonLd(input: JsonLdInput): JsonLdOutput {
  const now = new Date().toISOString();
  const publishDate = input.publishedAt || now;
  const articleUrl = input.slug ? `${ORG.url}/blog/${input.slug}` : ORG.url;

  // Article schema
  const article: JsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.article.title,
    description: input.article.meta_description,
    wordCount: input.article.word_count,
    keywords: input.article.seo_keywords.join(', '),
    datePublished: publishDate,
    dateModified: now,
    url: articleUrl,
    author: input.author
      ? {
          '@type': 'Person',
          name: input.author.name,
          ...(input.author.title && { jobTitle: input.author.title }),
          ...(input.author.bio && { description: input.author.bio }),
          ...(input.author.imageUrl && { image: input.author.imageUrl }),
          ...(input.author.profileUrl && { url: input.author.profileUrl }),
          worksFor: {
            '@type': 'Organization',
            name: ORG.name,
            url: ORG.url,
          },
        }
      : {
          '@type': 'Organization',
          name: ORG.name,
          url: ORG.url,
        },
    publisher: {
      '@type': 'Organization',
      name: ORG.name,
      url: ORG.url,
      logo: {
        '@type': 'ImageObject',
        url: ORG.logo,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
  };

  // FAQ schema (only if FAQ items exist)
  let faq: JsonLdSchema | null = null;
  if (input.article.faq && input.article.faq.length > 0) {
    faq = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: input.article.faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    };
  }

  // Breadcrumb schema
  const breadcrumbItems = [
    { name: 'Home', url: ORG.url },
    { name: 'Blog', url: `${ORG.url}/blog` },
    { name: input.category, url: `${ORG.url}/blog/category/${slugify(input.category)}` },
  ];
  if (input.slug) {
    breadcrumbItems.push({ name: input.article.title, url: articleUrl });
  }

  const breadcrumb: JsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return { article, faq, breadcrumb };
}

export function generateJsonLdScript(jsonLd: JsonLdOutput): string {
  const scripts = [
    `<script type="application/ld+json">${JSON.stringify(jsonLd.article)}</script>`,
  ];
  if (jsonLd.faq) {
    scripts.push(
      `<script type="application/ld+json">${JSON.stringify(jsonLd.faq)}</script>`
    );
  }
  scripts.push(
    `<script type="application/ld+json">${JSON.stringify(jsonLd.breadcrumb)}</script>`
  );
  return scripts.join('\n');
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
