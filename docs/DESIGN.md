# SoCal Calibration Content Engine — Design Plan

**Version:** 1.0
**Date:** March 13, 2026
**Status:** Planning
**Prepared for:** Parham (SoCal Calibration)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [Architecture](#3-architecture)
4. [Content Matrix](#4-content-matrix)
5. [Article Generation Pipeline](#5-article-generation-pipeline)
6. [SEO Scoring Algorithm](#6-seo-scoring-algorithm)
7. [WordPress Integration](#7-wordpress-integration)
8. [Social Post Generation](#8-social-post-generation)
9. [Database Schema](#9-database-schema)
10. [Implementation Phases](#10-implementation-phases)
11. [Cost Estimates](#11-cost-estimates)
12. [Risk & Transition Strategy](#12-risk--transition-strategy)

---

## 1. Executive Summary

### Problem

SoCal Calibration currently pays $400–500/month for SEO services that produce 6 short articles (400–500 words) per month. The content volume is low, the articles are thin by modern SEO standards, and the business has no blog section on their WordPress site yet.

### Solution

Build a content engine that:

- Generates **30+ high-quality articles per month** (1,500–2,000 words each)
- Targets **long-tail calibration keywords** across Southern California locations
- Pushes articles as **WordPress drafts** via REST API for review-then-publish workflow
- Scores every article with a **deterministic SEO algorithm** (0–100)
- Generates **social media posts** automatically from each article
- Costs **~$3–5/month** in API fees vs. $400–500/month for the current vendor

### Transition Approach

Run the content engine **in parallel** with the existing vendor for 2–3 months. The engine targets **new keywords only** — no overlap with vendor work. Once performance is validated, phase out vendor content deliverables while keeping their off-page SEO (link building, GMB optimization).

---

## 2. Current State Analysis

### Website Platform

- **WordPress** with **Astra theme** and **Elementor** page builder
- **No blog section** currently exists
- **No SEO plugin** detected (no Yoast, RankMath, or AIOSEO)
- Google Analytics 4 and Google Ads tracking are active
- Basic schema.org markup (WebPage, Organization, BreadcrumbList)

### Existing Site Structure

**Service Pages (13):**

| Page | Target Keyword |
|------|---------------|
| Industrial Scale Calibration | industrial scale calibration |
| Multimeter Calibration | multimeter calibration |
| Pressure Gauge Calibration | pressure gauge calibration |
| Thermometer Calibration | thermometer calibration |
| Torque Wrench Calibration | torque wrench calibration |
| Digital Scale Calibration | digital scale calibration |
| Centrifuge Calibration | centrifuge calibration |
| Caliper Calibration | caliper calibration |
| Blood Pressure Monitor Calibration | blood pressure monitor calibration |
| Bench Scale Calibration | bench scale calibration |
| Dimensional & Mechanical Calibration | dimensional mechanical calibration |
| Medical & Biomedical Calibration | medical biomedical calibration |
| Electronic Test Equipment Calibration | electronic test equipment calibration |

**Location Pages (2):**

- Orange County, CA (+ Irvine sub-page)
- Los Angeles, CA

**Other Pages:** Home, About Us, FAQs, Contact Us

### Vendor Deliverables (360searchvertising)

- 4 SEO articles/month (400 words) — thin content
- 2 blog posts/month (500 words) — moderate
- 1 guest blog/month (1,000 words, DA 40+) — valuable for backlinks
- 10 GMB posts/month
- Directory/classified/community link submissions
- Analytics & reporting

### Gaps Identified

1. **No blog infrastructure** — WordPress has native blog support, just needs activation
2. **No SEO plugin** — need RankMath or Yoast for on-page optimization
3. **Thin location coverage** — only 2 location pages for all of SoCal
4. **No FAQ schema** — existing FAQ page doesn't use structured data
5. **Missing internal linking** — service pages don't cross-link effectively

---

## 3. Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Content Engine (Next.js)                   │
│                    Hosted on Vercel (free tier)               │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  Dashboard    │  │  API Routes  │  │  Background Jobs  │  │
│  │  (React UI)  │  │  (Next.js)   │  │  (Inngest)        │  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────────┘  │
│         │                 │                   │              │
│  ┌──────┴─────────────────┴───────────────────┴──────────┐  │
│  │                    Core Services                       │  │
│  │  ┌────────────┐  ┌──────────┐  ┌──────────────────┐   │  │
│  │  │  Article    │  │  SEO     │  │  Social Post     │   │  │
│  │  │  Generator  │  │  Scorer  │  │  Generator       │   │  │
│  │  └─────┬──────┘  └──────────┘  └──────────────────┘   │  │
│  │        │                                               │  │
│  │  ┌─────┴──────┐  ┌──────────────────────────────────┐  │  │
│  │  │  Gemini    │  │  WordPress REST API Client       │  │  │
│  │  │  LLM       │  │  (Push drafts to WP site)       │  │  │
│  │  └────────────┘  └──────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                              │                               │
│                     ┌────────┴────────┐                      │
│                     │    Supabase     │                      │
│                     │  (PostgreSQL)   │                      │
│                     └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘

External:
  ┌──────────────────────────┐
  │  socalcalibration.com    │
  │  (WordPress + Elementor) │
  │  ← Articles pushed as    │
  │    drafts via REST API   │
  └──────────────────────────┘
```

### Tech Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| Framework | Next.js 15 (App Router) | Full-stack, fast, free Vercel hosting |
| Database | Supabase (free tier) | PostgreSQL, auth, storage, generous free tier |
| LLM | Google Gemini 2.0 Flash | Best cost-to-quality for SEO content (~$0.10/article) |
| Background Jobs | Inngest | Event-driven, concurrency control, retries |
| CMS Integration | WordPress REST API | Push articles as drafts, zero manual copy-paste |
| Hosting | Vercel (free tier) | Zero cost for hobby project |
| UI Components | shadcn/ui + Tailwind | Fast to build, clean interface |

### Key Design Decisions

1. **Gemini 2.0 Flash as default LLM** — cheapest option with good quality. Provider is configurable (can switch to Claude/GPT later).
2. **WordPress integration via REST API** — articles pushed as drafts, reviewed in WordPress, published from WordPress. This preserves the existing site's SEO setup.
3. **No image generation in v1** — WordPress + Elementor handles images fine. Can add AI images later.
4. **Single-tenant** — this is for one business, no multi-org complexity.
5. **Deterministic SEO scoring** — ported from Realience, no LLM cost for scoring.

---

## 4. Content Matrix

### Pillars (High-Level Themes)

These are the top-level content categories for a calibration business:

| # | Pillar | Description | Article Focus |
|---|--------|-------------|---------------|
| 1 | **Calibration Services** | Service-specific guides | "What is [X] calibration?", "How [X] calibration works" |
| 2 | **Industry Compliance** | Standards, regulations, audits | ISO 17025, FDA, OSHA requirements |
| 3 | **Equipment Guides** | Buyer's guides, maintenance tips | "How to choose a [X]", "Maintaining your [X]" |
| 4 | **Industry Applications** | Vertical-specific content | Calibration needs by industry |

### Categories (Topic Areas)

| Pillar | Categories |
|--------|-----------|
| Calibration Services | Scale Calibration, Electrical Calibration, Pressure Calibration, Temperature Calibration, Dimensional Calibration, Medical Equipment Calibration, Torque Calibration |
| Industry Compliance | ISO 17025, FDA Compliance, OSHA Standards, NIST Traceability, Audit Preparation, Calibration Intervals |
| Equipment Guides | Multimeters, Pressure Gauges, Thermometers, Calipers, Torque Wrenches, Centrifuges, Scales & Balances |
| Industry Applications | Healthcare & Medical, Pharmaceutical, Manufacturing, Automotive, Food & Beverage, Aerospace, Energy & Utilities, Laboratories |

### Locations (Geographic Targets)

SoCal Calibration serves Southern California. Expand beyond the current 2 location pages:

| Region | Cities/Areas |
|--------|-------------|
| **Orange County** | Irvine, Anaheim, Santa Ana, Huntington Beach, Costa Mesa, Fullerton, Newport Beach, Mission Viejo |
| **Los Angeles County** | Los Angeles, Long Beach, Pasadena, Torrance, Burbank, Glendale, Downey, Pomona |
| **Inland Empire** | Riverside, San Bernardino, Ontario, Rancho Cucamonga, Corona, Fontana |
| **San Diego County** | San Diego, Chula Vista, Oceanside, Carlsbad, Escondido |
| **Ventura County** | Oxnard, Thousand Oaks, Ventura, Simi Valley |

### Content Matrix Example

Pillar × Category × Location produces highly targeted long-tail articles:

| Pillar | Category | Location | Article Title |
|--------|----------|----------|--------------|
| Calibration Services | Scale Calibration | Irvine, CA | "Industrial Scale Calibration Services in Irvine, CA" |
| Industry Compliance | FDA Compliance | San Diego | "FDA Calibration Requirements for San Diego Medical Facilities" |
| Equipment Guides | Multimeters | — (no location) | "How to Choose the Right Multimeter for Your Calibration Needs" |
| Industry Applications | Manufacturing | Riverside | "Equipment Calibration for Manufacturing Plants in Riverside, CA" |

### Estimated Content Volume

- 4 pillars × 7 avg categories × 25 locations = **700 unique article combinations**
- Plus ~50 location-independent guides = **~750 total articles**
- At 2 articles/day: **12+ months of unique content**

---

## 5. Article Generation Pipeline

### Two-Step Process

Following the proven Realience pattern: **content first, keywords second.**

```
┌──────────────────────────────────────────────────────────────┐
│                   ARTICLE GENERATION FLOW                     │
│                                                              │
│  1. FETCH CONTEXT                                            │
│     Pillar → Category → Location → Related Services          │
│                                                              │
│  2. CREATE ARTICLE RECORD (status: "generating")             │
│                                                              │
│  3. GENERATE CONTENT (Gemini 2.0 Flash)                      │
│     Input: pillar, category, location, service context       │
│     Output: title, body_html, meta_title, meta_description,  │
│             h2_structure, slug_candidates, faq, word_count   │
│                                                              │
│  4. EXTRACT KEYWORDS (separate LLM call)                     │
│     Input: generated article text                            │
│     Output: primary_keyword, seo_keywords, long_tail_keywords│
│     Rule: ONLY keywords that appear in the article text      │
│                                                              │
│  5. CALCULATE SEO SCORE (algorithmic, no LLM)                │
│     100-point scale across 7 categories                      │
│                                                              │
│  6. GENERATE JSON-LD                                         │
│     Article schema + FAQPage schema + BreadcrumbList         │
│                                                              │
│  7. UPDATE ARTICLE (status: "pending_review")                │
│                                                              │
│  8. OPTIONAL: Push to WordPress as draft                     │
└──────────────────────────────────────────────────────────────┘
```

### Article Prompt Strategy

The prompt will include:

- **Service expertise context**: What the calibration type involves, standards, equipment
- **Location context**: City name, region, nearby industries that need calibration
- **Internal linking targets**: URLs of existing service pages on socalcalibration.com (for natural internal links)
- **Tone**: Professional, authoritative, helpful — not salesy
- **Target length**: 1,500–2,000 words (significantly more than the vendor's 400-word articles)
- **Structure requirements**: H2/H3 hierarchy, FAQ section, clear CTAs

### Link Strategy

Pre-populate a table of internal link targets from the existing site:

| URL | Anchor Context |
|-----|---------------|
| /industrial-scale-calibration/ | industrial scale calibration services |
| /multimeter-calibration/ | multimeter calibration |
| /pressure-gauge-calibration/ | pressure gauge calibration |
| /thermometer-calibration/ | thermometer calibration |
| /contact-us/ | request a calibration quote |
| /about-us/ | about SoCal Calibration |
| /faqs/ | calibration FAQs |

The LLM is instructed to naturally link to 3–6 internal pages per article. This builds the internal linking structure that the current site is missing.

### Keyword Extraction (Step 2)

After content generation, a separate LLM call extracts keywords:

```
Input:  The full article HTML
Output: {
  primary_keyword: "pressure gauge calibration Irvine",
  seo_keywords: ["pressure gauge calibration", "NIST traceable", "calibration services Irvine", ...],
  long_tail_keywords: ["how often to calibrate pressure gauges", "pressure gauge calibration cost in Orange County", ...]
}

Critical Rule: ONLY include keywords that ACTUALLY APPEAR in the article text.
```

This two-step approach prevents the LLM from hallucinating keywords that don't exist in the content — a common failure mode when generating content and keywords simultaneously.

---

## 6. SEO Scoring Algorithm

Ported from the Realience platform. Deterministic (no LLM cost), scores 0–100 across 7 categories:

### Scoring Breakdown (100 points total)

| Category | Max Points | What It Measures |
|----------|-----------|-----------------|
| **Title** | 14 | Exists (8pts) + optimal length 50–60 chars (6pts) |
| **Meta Description** | 10 | Exists (5pts) + optimal length 150–160 chars (5pts) |
| **Keywords** | 18 | Primary keyword present (6pts) + density 0.5–3% (6pts) + distribution across article (6pts) |
| **Content** | 23 | Word count 2000+ (13pts) + heading count 5+ H2/H3 (10pts) |
| **Structure** | 13 | Slug quality (5pts) + has headings (4pts) + proper hierarchy H1→H2→H3 (4pts) |
| **Readability** | 12 | Avg sentence length 15–20 words (6pts) + paragraph length 3–5 sentences (6pts) |
| **Links** | 10 | Internal links 3–5 (3pts) + external links 1–5 (3pts) + total links 3+ (4pts) |

### Score Interpretation

| Score | Rating | Action |
|-------|--------|--------|
| 85–100 | Excellent | Publish immediately |
| 70–84 | Good | Minor tweaks recommended |
| 50–69 | Needs Work | Review and improve before publishing |
| 0–49 | Poor | Regenerate or heavily edit |

### Quality Gate

Articles scoring below **70** are flagged for review and not auto-pushed to WordPress. This prevents low-quality content from reaching the site.

---

## 7. WordPress Integration

### How It Works

WordPress has a built-in REST API. With an Application Password (available in WP 5.6+), the content engine can:

1. **Create posts as drafts** — appear in WordPress dashboard for review
2. **Set categories and tags** — map content matrix categories to WP categories
3. **Set meta fields** — if an SEO plugin (RankMath/Yoast) is installed, set meta title/description via their API
4. **Set featured images** — upload and attach (future: AI-generated images)

### Authentication Setup

1. In WordPress: Go to Users → Profile → Application Passwords
2. Generate a new Application Password for "Content Engine"
3. Store the credentials in the content engine's environment variables

### API Workflow

```
Content Engine                          WordPress
     │                                       │
     ├── POST /wp-json/wp/v2/posts ─────────►│  Create draft
     │   { title, content, status: "draft",  │
     │     categories, tags, meta }          │
     │                                       │
     │◄── 201 { id, link, status } ──────────┤  Returns post ID
     │                                       │
     │   (Parham reviews in WP dashboard)    │
     │                                       │
     ├── POST /wp-json/wp/v2/posts/{id} ────►│  Update if needed
     │   { meta: { _yoast_wpseo_title: ... }}│
     │                                       │
     │   (Parham clicks "Publish" in WP)     │
     └───────────────────────────────────────┘
```

### WordPress Prerequisites

Before the engine can push content, Parham needs to:

1. **Install an SEO plugin** — RankMath (free, recommended) or Yoast
2. **Enable the blog** — WordPress has built-in blog, just needs a "Blog" page created and set in Settings → Reading
3. **Create WP categories** matching the content matrix categories
4. **Generate an Application Password** for the content engine
5. **Install a JSON-LD/Schema plugin** (or use RankMath's built-in schema) for FAQ structured data

---

## 8. Social Post Generation

### Per Article: 3 Variants

Each article automatically generates 3 social post variants:

| Variant | Tone | Example |
|---------|------|---------|
| **Educational** | Informative, expert | "Did you know uncalibrated pressure gauges can cause 15% measurement errors? Here's what SoCal manufacturers need to know..." |
| **Practical** | Actionable, helpful | "Is your equipment due for calibration? Here are 3 signs it's time to recalibrate your industrial scales..." |
| **Promotional** | Service-focused | "Same-day calibration in Orange County — NIST-traceable, free pickup & delivery. Get a quote today..." |

### Specifications

- **Length**: 150–250 characters (optimal for LinkedIn/Facebook)
- **Hashtags**: 3–5 relevant tags (#Calibration #QualityControl #SoCalManufacturing)
- **CTA**: Short call-to-action linking to the article or contact page
- **Platform-aware**: Optimized for LinkedIn (B2B focus for calibration industry)

### Usage

Parham can copy these directly to social media or schedule them via any social media tool. Future enhancement: direct API integration with LinkedIn/Facebook.

---

## 9. Database Schema

### Supabase Tables

```sql
-- Content organization
content_pillars (id, name, description, is_active, display_order)
categories (id, pillar_id, name, slug, description, is_active, display_order)
locations (id, city, state, county, display_name, is_active)

-- Internal link targets (pre-populated from existing site)
internal_links (id, url, anchor_text, page_type, is_active)

-- Generated content
articles (
  id, pillar_id, category_id, location_id,
  status,  -- generating | pending_review | approved | published | rejected
  title, body_html, word_count, h2_structure, faq,
  meta_title, meta_description,
  primary_keyword, seo_keywords, long_tail_keywords,
  slug, seo_score, seo_breakdown,
  json_ld,
  wp_post_id,       -- WordPress post ID after push
  wp_post_url,      -- WordPress URL after publish
  published_at,
  created_at, updated_at
)

-- Social posts
social_posts (
  id, article_id,
  variant,    -- educational | practical | promotional
  platform,   -- linkedin | facebook | twitter
  content, hashtags, call_to_action,
  is_selected,
  created_at
)

-- Batch tracking
generation_batches (
  id, total_items, completed_items, failed_items,
  status,  -- in_progress | completed | failed
  created_at, completed_at
)

-- Generation settings
settings (
  id, key, value,
  -- wp_site_url, wp_username, wp_app_password,
  -- gemini_api_key, default_target_length, etc.
)
```

### Row-Level Security

Since this is single-tenant (one business), RLS is simpler. We still enable it for security best practice, but policies are straightforward "authenticated user can access all rows" checks.

---

## 10. Implementation Phases

### Phase 1: Foundation (Week 1)

**Goal:** Project setup, database, and core article generation working locally.

- [ ] Initialize Next.js 15 project with App Router
- [ ] Set up Tailwind CSS + shadcn/ui
- [ ] Configure Supabase project (free tier)
- [ ] Create database schema (migrations)
- [ ] Seed content matrix (pillars, categories, locations, internal links)
- [ ] Build Gemini LLM client wrapper (configurable provider)
- [ ] Implement article generation service (two-step: content + keywords)
- [ ] Implement SEO scoring algorithm (port from Realience)
- [ ] Build JSON-LD generator (Article + FAQPage schemas)
- [ ] Basic API routes: generate article, list articles, get article

**Deliverable:** Can generate a calibration article from the command line or API call and see its SEO score.

### Phase 2: Dashboard (Week 2)

**Goal:** Web UI for managing content generation and reviewing articles.

- [ ] Authentication with Supabase Auth (simple email/password)
- [ ] Dashboard home page (stats: articles generated, avg SEO score, pending review)
- [ ] Content matrix management (view/edit pillars, categories, locations)
- [ ] Single article generation page (select pillar + category + location → generate)
- [ ] Batch generation page (select multiple combinations → generate in bulk)
- [ ] Article list page (filter by status, pillar, category, location, SEO score)
- [ ] Article detail page (view content, SEO breakdown, edit, approve/reject)
- [ ] Set up Inngest for background job processing
- [ ] Batch generation with progress tracking

**Deliverable:** Parham can log in, generate articles, review them, and manage the content pipeline.

### Phase 3: WordPress Integration (Week 3)

**Goal:** Push approved articles to WordPress as drafts.

- [ ] WordPress REST API client (authentication, post creation, category mapping)
- [ ] Settings page for WordPress credentials (site URL, username, app password)
- [ ] "Push to WordPress" button on article detail page
- [ ] Auto-push on approval (optional setting)
- [ ] WP category sync (create/map content engine categories to WP categories)
- [ ] Meta field integration (RankMath or Yoast SEO fields)
- [ ] Status tracking (synced/not synced with WordPress)

**Prerequisite:** Parham installs RankMath on his WordPress site and creates an Application Password.

**Deliverable:** Approved articles appear as drafts in WordPress with SEO metadata. Parham reviews and publishes from WP.

### Phase 4: Social Posts + Polish (Week 4)

**Goal:** Social post generation, UX polish, and deployment.

- [ ] Social post generation service (3 variants per article)
- [ ] Social posts UI (view variants, copy to clipboard, mark as used)
- [ ] Deploy to Vercel
- [ ] Connect custom domain (optional: engine.socalcalibration.com or similar)
- [ ] Environment variable configuration (Gemini API key, Supabase, WordPress)
- [ ] Error handling and retry logic for LLM calls
- [ ] Rate limiting for Gemini API
- [ ] Basic analytics on dashboard (articles published this month, top SEO scores)

**Deliverable:** Production-ready content engine generating articles and social posts, pushing to WordPress.

### Phase 5: Automation (Week 5–6, Optional)

**Goal:** Reduce manual work with scheduling and autopilot features.

- [ ] Scheduled generation (generate N articles per day automatically)
- [ ] Content calendar view (see what's scheduled, what's published)
- [ ] Auto-push to WordPress on schedule
- [ ] Keyword overlap detection (flag if engine targets same keyword as existing page)
- [ ] Internal link analysis (identify articles that should cross-link)
- [ ] SEO trend dashboard (average scores over time, content coverage map)

**Deliverable:** Hands-off content pipeline — articles generated, scored, and pushed to WordPress on autopilot.

### Phase 6: Advanced Features (Future)

- [ ] AI image generation (article hero images via Gemini)
- [ ] Competitor keyword analysis
- [ ] Google Search Console integration (track actual ranking performance)
- [ ] Content refresh (identify old articles that need updating)
- [ ] A/B title testing
- [ ] LinkedIn API integration for direct social posting
- [ ] GMB post generation and scheduling

---

## 11. Cost Estimates

### Monthly Recurring Costs

| Service | Tier | Monthly Cost | Notes |
|---------|------|-------------|-------|
| Supabase | Free | $0 | 500MB DB, more than enough |
| Vercel | Hobby (free) | $0 | Sufficient for single-user dashboard |
| Gemini API | Pay-as-you-go | ~$3–5 | ~30 articles/month at ~$0.10–0.15 each |
| Inngest | Free | $0 | 5,000 runs/month free tier |
| Domain (optional) | — | ~$1 | If using custom subdomain |
| **Total** | | **~$3–6/month** | |

### Comparison with Current Vendor

| | 360searchvertising | Content Engine |
|---|---|---|
| Monthly cost | $400–500 | ~$5 |
| Articles/month | 6 (thin, 400–500 words) | 30+ (rich, 1,500–2,000 words) |
| SEO scoring | Unknown/manual | Algorithmic, real-time, 0–100 |
| Social posts | 15 (manual) | 90+ (3 per article, auto-generated) |
| Meta tags | Manual | Auto-generated |
| JSON-LD schemas | Not included | Auto-generated |
| Internal linking | Not included | Auto-generated |
| WordPress integration | Manual | Automated (push as drafts) |
| Turnaround | Days/weeks | Minutes |

### One-Time Costs

| Item | Cost | Notes |
|------|------|-------|
| Google Cloud account | $0 | $300 free credits for new accounts |
| Supabase account | $0 | Free tier setup |
| Vercel account | $0 | Free tier |
| RankMath plugin (WP) | $0 | Free version is sufficient |
| Development time | Your time | ~4–6 weeks for phases 1–4 |

---

## 12. Risk & Transition Strategy

### Parallel Running Period (Months 1–3)

```
Month 1–2: PARALLEL
├── 360search continues ALL deliverables (no changes)
├── Content engine generates articles on NEW keywords only
├── Keyword overlap check before every batch
├── Monitor Google Search Console for both content sources
└── Compare: SEO scores, traffic, impressions

Month 3: EVALUATE
├── If engine articles perform ≥ vendor articles:
│   └── Tell vendor: "We're handling blog content in-house now"
│   └── Keep vendor for: GMB optimization + link building only
│   └── Negotiate reduced rate ($150–200/month for off-page only)
├── If engine articles underperform:
│   └── Investigate: prompts? keyword targeting? content quality?
│   └── Iterate and extend parallel period
└── Never delete existing vendor-written content

Month 4+: CONTENT ENGINE OWNS ON-SITE CONTENT
├── Engine generates all articles, social posts, meta tags
├── Vendor handles GMB + link building + guest blogs (off-page)
└── Parham reviews and publishes from WordPress dashboard
```

### Critical Rules

1. **Never delete existing content** — even thin 400-word articles. They may have indexed value.
2. **Never target overlapping keywords** — check vendor's target keywords before generating. Avoid keyword cannibalization.
3. **Never change existing URLs** — breaks backlinks the vendor has built.
4. **Add, don't replace** — all engine content goes on NEW pages/URLs.
5. **Monitor rankings weekly** — if any existing page drops, investigate before generating more.

### WordPress Prerequisites Checklist

Before the content engine can push content, Parham must:

- [ ] Install **RankMath** SEO plugin (free) on WordPress
- [ ] Create a **"Blog"** page and set it as the Posts page in Settings → Reading
- [ ] Create **WordPress categories** matching the content matrix
- [ ] Generate an **Application Password** (Users → Profile → Application Passwords)
- [ ] Share WordPress admin URL and Application Password with you securely
- [ ] Verify the WordPress REST API is accessible (`/wp-json/wp/v2/posts` returns data)

### Rollback Plan

If anything goes wrong:

1. **Unpublish engine articles** in WordPress (revert to draft)
2. **Resume full vendor scope** immediately
3. **Investigate root cause** (keyword conflict? content quality? Google algorithm update?)
4. **Adjust and retry** with smaller batches

---

## Appendix A: Keyword Strategy — Initial Target List

### High-Intent Service Keywords (vendor likely already targets these — DO NOT overlap)

- calibration services southern california
- instrument calibration near me
- equipment calibration orange county
- calibration company los angeles

### Content Engine Target Keywords (long-tail, NEW)

**Location-Specific Service Pages:**
- multimeter calibration Irvine CA
- pressure gauge calibration Riverside
- torque wrench calibration San Diego
- industrial scale calibration Anaheim
- thermometer calibration Pasadena

**Compliance & Standards:**
- ISO 17025 calibration requirements California
- FDA calibration compliance medical devices
- NIST traceable calibration certificate
- calibration audit preparation checklist
- how often should equipment be calibrated

**Industry-Specific:**
- pharmaceutical equipment calibration southern california
- food manufacturing calibration requirements
- automotive calibration services orange county
- laboratory instrument calibration los angeles
- medical device calibration FDA compliance

**Buyer's Guides:**
- how to choose a calibration service provider
- in-house vs outsourced calibration pros and cons
- calibration cost guide for small businesses
- what is NIST traceable calibration

**"Near Me" Long-Tail:**
- calibration services near Irvine CA
- equipment calibration near Long Beach
- scale calibration company near Riverside CA

---

## Appendix B: File Structure (Planned)

```
socal-calibration-content-engine/
├── docs/
│   └── DESIGN.md                  # This document
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/                # Auth pages (login)
│   │   ├── (dashboard)/           # Protected dashboard pages
│   │   │   ├── page.tsx           # Dashboard home
│   │   │   ├── articles/          # Article list + detail
│   │   │   ├── generate/          # Generation UI
│   │   │   ├── matrix/            # Content matrix management
│   │   │   └── settings/          # Settings (WP creds, API keys)
│   │   └── api/                   # API routes
│   │       ├── articles/          # CRUD + generate + batch
│   │       ├── wordpress/         # WP sync endpoints
│   │       └── inngest/           # Inngest webhook handler
│   ├── lib/
│   │   ├── llm/                   # Gemini client, provider abstraction
│   │   ├── prompts/               # Article + keyword + social prompts
│   │   ├── seo/                   # SEO scoring algorithm
│   │   ├── services/              # Article generation, social generation
│   │   ├── wordpress/             # WP REST API client
│   │   └── db/                    # Supabase client + typed queries
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   └── ...                    # Feature-specific components
│   └── jobs/                      # Inngest job definitions
├── supabase/
│   ├── migrations/                # SQL migrations
│   └── seed.sql                   # Initial content matrix seed data
├── .env.example                   # Required environment variables
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## Appendix C: Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Gemini (Google AI)
GEMINI_API_KEY=xxx

# WordPress
WP_SITE_URL=https://socalcalibration.com
WP_USERNAME=xxx
WP_APP_PASSWORD=xxx

# Inngest
INNGEST_EVENT_KEY=xxx
INNGEST_SIGNING_KEY=xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
