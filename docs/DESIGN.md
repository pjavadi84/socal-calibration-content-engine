# SoCal Calibration Content Engine — Design Plan

**Version:** 2.0
**Date:** March 17, 2026
**Status:** Planning
**Prepared for:** Parham (SoCal Calibration)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [Architecture](#3-architecture)
4. [Content Matrix](#4-content-matrix)
5. [Knowledge Base & RAG Strategy](#5-knowledge-base--rag-strategy)
6. [Article Generation Pipeline](#6-article-generation-pipeline)
7. [SEO Scoring Algorithm](#7-seo-scoring-algorithm)
8. [WordPress Integration](#8-wordpress-integration)
9. [Social Post Generation](#9-social-post-generation)
10. [Database Schema](#10-database-schema)
11. [Implementation Phases](#11-implementation-phases)
12. [Cost Estimates](#12-cost-estimates)
13. [Risk & Transition Strategy](#13-risk--transition-strategy)

---

## 1. Executive Summary

### Problem

SoCal Calibration currently pays $400–500/month for SEO services that produce 6 short articles (400–500 words) per month. The content volume is low, the articles are thin by modern SEO standards, and the business has no blog section on their WordPress site yet.

### Solution

Build a content engine that:

- Generates **8–12 high-quality articles per month initially**, ramping to **20–30 over 6 months** (1,500–2,000 words each)
- Grounds every article in **real standards, regulations, and equipment specifications** via a curated knowledge base (RAG)
- Targets **long-tail calibration keywords** across Southern California locations
- Pushes articles as **WordPress drafts** via REST API for review-then-publish workflow
- Scores every article with a **deterministic SEO algorithm** (0–100) including fact density
- Generates **social media posts** automatically from each article
- Costs **~$3–5/month** in API fees

### Content Velocity Strategy

New blogs publishing 30+ articles/month immediately risk triggering Google's scaled content abuse detection (Firefly system). The engine ramps gradually:

| Period | Max Articles/Month | Rationale |
|--------|-------------------|-----------|
| Month 1–2 | 12 | Establish domain trust, index initial content |
| Month 3–4 | 20 | Ramp after initial indexing signals are positive |
| Month 5+ | 30 | Full velocity once blog authority is established |

### Transition Approach

Run the content engine **in parallel** with the existing vendor for 2–3 months. The engine replaces only the vendor's **content deliverables** (articles and blog posts). The vendor retains **all off-page SEO work** — link building, GMB optimization, guest blogs, directory submissions. These off-page activities account for ~52% of local ranking factors (GBP optimization ~32%, reviews ~20%) vs. blog content at ~10%.

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
6. **No first-hand experience signals** — content lacks practitioner observations that Google's Dec 2025 Core Update rewards

---

## 3. Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                    Content Engine (Next.js)                        │
│                    Hosted on Vercel (free tier)                    │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │  Dashboard    │  │  API Routes  │  │  Background Jobs       │  │
│  │  (React UI)  │  │  (Next.js)   │  │  (Inngest)             │  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬────────────────┘  │
│         │                 │                   │                   │
│  ┌──────┴─────────────────┴───────────────────┴───────────────┐  │
│  │                    Core Services                            │  │
│  │  ┌────────────┐  ┌──────────┐  ┌──────────────────────┐    │  │
│  │  │  Article    │  │  SEO     │  │  Social Post         │    │  │
│  │  │  Generator  │  │  Scorer  │  │  Generator           │    │  │
│  │  └─────┬──────┘  └──────────┘  └──────────────────────┘    │  │
│  │        │                                                    │  │
│  │  ┌─────┴──────┐  ┌──────────────┐  ┌────────────────────┐  │  │
│  │  │  Gemini    │  │  Knowledge   │  │  WordPress REST    │  │  │
│  │  │  LLM       │  │  Base (RAG)  │  │  API Client        │  │  │
│  │  └────────────┘  └──────┬───────┘  └────────────────────┘  │  │
│  │                         │                                   │  │
│  └─────────────────────────┼───────────────────────────────────┘  │
│                            │                                      │
│                   ┌────────┴────────┐                             │
│                   │  knowledge-base/ │                             │
│                   │  (Markdown files)│                             │
│                   └─────────────────┘                             │
│                            │                                      │
│                   ┌────────┴────────┐                             │
│                   │    Supabase     │                             │
│                   │  (PostgreSQL)   │                             │
│                   └─────────────────┘                             │
└──────────────────────────────────────────────────────────────────┘

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
| Knowledge Base | Markdown files + keyword retrieval | Simple RAG — ~25 files, no vector DB needed |
| Background Jobs | Inngest | Event-driven, concurrency control, retries |
| CMS Integration | WordPress REST API | Push articles as drafts, zero manual copy-paste |
| Hosting | Vercel (free tier) | Zero cost for hobby project |
| UI Components | shadcn/ui + Tailwind | Fast to build, clean interface |

### Key Design Decisions

1. **Gemini 2.0 Flash as default LLM** — cheapest option with good quality. Provider is configurable (can switch to Claude/GPT later).
2. **WordPress integration via REST API** — articles pushed as drafts, reviewed in WordPress, published from WordPress. This preserves the existing site's SEO setup.
3. **Knowledge base as flat Markdown files** — ~25 curated files with YAML frontmatter for tagging. Simple keyword matching retrieves relevant context for each article. No vector database needed at this scale.
4. **Single-tenant** — this is for one business, no multi-org complexity.
5. **Deterministic SEO scoring** — ported from Realience, no LLM cost for scoring. Includes fact density scoring.
6. **Content velocity ramping** — 8–12 articles/month initially, scaling to 30 over 6 months to avoid Google's scaled content abuse detection.

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
- At 8–12 articles/month initially: **5+ years of unique content**

---

## 5. Knowledge Base & RAG Strategy

### Why RAG?

Without grounding, AI-generated calibration articles risk:
- **Generic content** — reads like every other AI calibration article on the internet
- **Missing specificity** — no real standard clause numbers, tolerance values, or equipment specs
- **No first-hand experience signals** — Google's Dec 2025 Core Update specifically rewards practitioner experience

The knowledge base solves the first two problems directly. Practitioner review placeholders address the third.

### Knowledge Base Structure

```
knowledge-base/
├── standards/
│   ├── iso-17025-2017.md         # ISO 17025 calibration standard
│   ├── nist-traceability.md       # NIST traceability chain & requirements
│   ├── fda-21-cfr-820-72.md      # FDA medical device calibration
│   ├── ansi-z540-3.md            # ANSI Z540.3 & 2% false accept risk
│   ├── ilac-g24-intervals.md     # Calibration interval methodology
│   └── osha-calibration-reqs.md  # OSHA safety equipment requirements
├── equipment/
│   ├── pressure-gauges.md        # ASME B40.100, accuracy grades, brands
│   ├── industrial-scales.md      # NIST HB 44, NTEP, tolerance classes
│   ├── multimeters.md            # CAT ratings, accuracy specs, brands
│   ├── torque-wrenches.md        # ISO 6789, types, calibration methods
│   ├── thermometers.md           # ASTM specs, sensor types, ranges
│   └── calipers-micrometers.md   # Dimensional measurement tolerances
├── industries/
│   ├── pharmaceutical.md         # cGMP, USP 1058, pharma calibration
│   ├── aerospace.md              # AS9100, NADCAP, pyrometry
│   ├── food-manufacturing.md     # FSMA, HACCP, temperature monitoring
│   └── medical-devices.md        # ISO 13485, FDA QSR, biomedical
└── regional/
    ├── socal-industries.md       # Major employers by city/county
    └── california-regulations.md # CA-specific measurement regulations
```

### File Format

Each knowledge base file uses YAML frontmatter for retrieval matching:

```yaml
---
title: "ISO/IEC 17025:2017"
tags: [iso-17025, accreditation, laboratory, measurement-uncertainty]
pillars: [industry-compliance, calibration-services]
categories: [iso-17025, audit-preparation, calibration-intervals]
equipment_types: []
industries: [all]
last_reviewed: "2026-03-17"
review_interval_months: 12
sources:
  - "ISO/IEC 17025:2017 standard"
  - "A2LA R104"
---
```

### Retrieval System

Simple keyword-based retrieval (~25 files, no vector DB needed):

1. `retrieveKnowledge(pillar, category, location?)` matches files by frontmatter tags
2. Files are scored by relevance: pillar match (+3), category match (+5), tag overlap (+2), equipment type (+4), industry (+3), regional bonus (+2)
3. Top-scoring files are concatenated into a context string (max ~4,000 tokens)
4. Context is injected into the article prompt as `TECHNICAL REFERENCE MATERIAL`

### Practitioner Review Step

Every generated article includes 2–3 HTML comment placeholders:
```html
<!-- PRACTITIONER_NOTE: [suggestion for what Parham should add here] -->
```

These mark spots where first-hand experience would strengthen the article — specific client stories, regional observations, common issues encountered during calibration. Parham reviews these before publishing.

### Knowledge Freshness

Semi-automated freshness checker (`/api/knowledge/freshness`):
- Reads `last_reviewed` frontmatter from each file
- Flags files not reviewed within their `review_interval_months`
- Dashboard displays stale files for manual review
- Standards updates (ISO revisions, new FDA guidance) require manual KB file updates

---

## 6. Article Generation Pipeline

### Two-Step Process with RAG

Following the proven Realience pattern: **knowledge retrieval → content first → keywords second.**

```
┌──────────────────────────────────────────────────────────────┐
│                   ARTICLE GENERATION FLOW                     │
│                                                              │
│  1. CHECK VELOCITY LIMIT                                     │
│     Monthly article count < tier limit?                      │
│                                                              │
│  2. FETCH CONTEXT                                            │
│     Pillar → Category → Location → Related Services          │
│                                                              │
│  2.5. RETRIEVE KNOWLEDGE CONTEXT (RAG)                       │
│     Match knowledge-base files by pillar/category/equipment  │
│     Return relevant standards, specs, regulations (~4K tokens)│
│                                                              │
│  3. CREATE ARTICLE RECORD (status: "generating")             │
│                                                              │
│  4. GENERATE CONTENT (Gemini 2.0 Flash)                      │
│     Input: pillar, category, location, knowledge context     │
│     Output: title, body_html, meta_title, meta_description,  │
│             h2_structure, slug_candidates, faq, word_count   │
│     Includes: practitioner review placeholders               │
│                                                              │
│  5. EXTRACT KEYWORDS (separate LLM call)                     │
│     Input: generated article text                            │
│     Output: primary_keyword, seo_keywords, long_tail_keywords│
│     Rule: ONLY keywords that appear in the article text      │
│                                                              │
│  6. CALCULATE SEO SCORE (algorithmic, no LLM)                │
│     100-point scale across 8 categories (incl. fact density) │
│                                                              │
│  7. GENERATE JSON-LD                                         │
│     Article schema + FAQPage schema + BreadcrumbList         │
│                                                              │
│  8. UPDATE ARTICLE (status: "pending_review")                │
│     Store knowledge_sources, fact_density_score               │
│                                                              │
│  9. PRACTITIONER REVIEW                                      │
│     Parham replaces <!-- PRACTITIONER_NOTE --> comments       │
│     with real observations, then approves                    │
│                                                              │
│  10. OPTIONAL: Push to WordPress as draft                    │
└──────────────────────────────────────────────────────────────┘
```

### Article Prompt Strategy

The prompt will include:

- **Technical reference material**: Retrieved from the knowledge base — real standards, clause numbers, tolerance values, equipment specs
- **Citation requirements**: Must cite ≥3 specific standards with clause numbers, include ≥2 real numerical values
- **Service expertise context**: What the calibration type involves, standards, equipment
- **Location context**: City name, region, nearby industries that need calibration
- **Internal linking targets**: URLs of existing service pages on socalcalibration.com (for natural internal links)
- **Practitioner placeholders**: HTML comments marking where first-hand experience should be added
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

### Keyword Extraction (Step 5)

After content generation, a separate LLM call extracts keywords:

```
Input:  The full article HTML
Output: {
  primary_keyword: "pressure gauge calibration Irvine",
  seo_keywords: ["pressure gauge calibration", "NIST traceable", "ASME B40.100", ...],
  long_tail_keywords: ["how often to calibrate pressure gauges per ISO 17025", ...]
}

Critical Rule: ONLY include keywords that ACTUALLY APPEAR in the article text.
```

This two-step approach prevents the LLM from hallucinating keywords that don't exist in the content — a common failure mode when generating content and keywords simultaneously.

---

## 7. SEO Scoring Algorithm

Ported from the Realience platform. Deterministic (no LLM cost), scores 0–100 across 8 categories:

### Scoring Breakdown (100 points total)

| Category | Max Points | What It Measures |
|----------|-----------|-----------------|
| **Title** | 14 | Exists (8pts) + optimal length 50–60 chars (6pts) |
| **Meta Description** | 10 | Exists (5pts) + optimal length 150–160 chars (5pts) |
| **Keywords** | 15 | Primary keyword present (5pts) + density 0.5–3% (5pts) + distribution across article (5pts) |
| **Content** | 16 | Word count 2000+ (9pts) + heading count 5+ H2/H3 (7pts) |
| **Structure** | 13 | Slug quality (5pts) + has headings (4pts) + proper hierarchy H1→H2→H3 (4pts) |
| **Readability** | 12 | Avg sentence length 15–20 words (6pts) + paragraph length 3–5 sentences (6pts) |
| **Links** | 8 | Internal links 3–5 (3pts) + external links 1–5 (2pts) + total links 3+ (3pts) |
| **Fact Density** | 12 | Standards/regulation citations (4pts) + numerical data points (4pts) + named specifics (4pts) |

### Fact Density Scoring (New)

The Fact Density category rewards articles grounded in real technical data:

- **Citations (0–4 pts)**: References to standards (ISO 17025, 21 CFR 820, ANSI Z540.3, ASME B40.100, etc.). Detects via regex pattern matching against known standard formats.
- **Numerical Data Points (0–4 pts)**: Tolerances, percentages, intervals with units (±0.1%, 12 months, ±1°C, 4:1 TUR, etc.).
- **Named Specifics (0–4 pts)**: Clause numbers (Clause 6.4, Section 820.72(a)), regulation sections, specific equipment models.

This category directly incentivizes the RAG-grounded content that differentiates articles from generic AI output.

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

## 8. WordPress Integration

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
     │   (Replaces PRACTITIONER_NOTE comments)│
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

## 9. Social Post Generation

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

## 10. Database Schema

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
  fact_density_score,          -- NEW: separate fact density score (0-12)
  fact_density_breakdown,      -- NEW: JSONB breakdown (citations, numericals, specifics)
  knowledge_sources,           -- NEW: TEXT[] of KB files used for this article
  practitioner_notes_added,    -- NEW: BOOLEAN, true after Parham adds notes
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

## 11. Implementation Phases

### Phase 1: Foundation (Week 1)

**Goal:** Project setup, database, core article generation, and knowledge base working locally.

- [x] Initialize Next.js 15 project with App Router
- [x] Set up Tailwind CSS + shadcn/ui
- [x] Configure Supabase project (free tier)
- [x] Create database schema (migrations)
- [x] Seed content matrix (pillars, categories, locations, internal links)
- [x] Build Gemini LLM client wrapper (configurable provider)
- [x] Implement article generation service (two-step: content + keywords)
- [x] Implement SEO scoring algorithm (port from Realience)
- [x] Build JSON-LD generator (Article + FAQPage schemas)
- [x] Basic API routes: generate article, list articles, get article
- [x] Create knowledge base files (standards, equipment, industries, regional)
- [x] Build knowledge retrieval module (keyword-based RAG)
- [x] Add fact density scoring to SEO algorithm
- [x] Integrate knowledge context into article generation pipeline
- [x] Add content velocity controls (monthly article limits)
- [x] Add practitioner review placeholder generation
- [x] Database migration for new columns (fact_density_score, knowledge_sources)
- [x] Knowledge freshness checker API

**Deliverable:** Can generate a RAG-grounded calibration article from the command line or API call and see its SEO score including fact density.

### Phase 2: Dashboard (Week 2)

**Goal:** Web UI for managing content generation and reviewing articles.

- [ ] Authentication with Supabase Auth (simple email/password)
- [ ] Dashboard home page (stats: articles generated, avg SEO score, pending review, fact density avg)
- [ ] Content matrix management (view/edit pillars, categories, locations)
- [ ] Single article generation page (select pillar + category + location → generate)
- [ ] Batch generation page (select multiple combinations → generate in bulk)
- [ ] Article list page (filter by status, pillar, category, location, SEO score)
- [ ] Article detail page (view content, SEO breakdown, fact density, knowledge sources, edit, approve/reject)
- [ ] Knowledge freshness dashboard (view stale KB files)
- [x] Set up Inngest for background job processing
- [x] Batch generation with progress tracking

**Deliverable:** Parham can log in, generate articles, review them (including practitioner notes), and manage the content pipeline.

### Phase 3: WordPress Integration (Week 3)

**Goal:** Push approved articles to WordPress as drafts.

- [x] WordPress REST API client (authentication, post creation, category mapping)
- [ ] Settings page for WordPress credentials (site URL, username, app password)
- [ ] "Push to WordPress" button on article detail page
- [ ] Auto-push on approval (optional setting)
- [x] WP category sync (create/map content engine categories to WP categories)
- [x] Meta field integration (RankMath or Yoast SEO fields)
- [ ] Status tracking (synced/not synced with WordPress)

**Prerequisite:** Parham installs RankMath on his WordPress site and creates an Application Password.

**Deliverable:** Approved articles appear as drafts in WordPress with SEO metadata. Parham reviews and publishes from WP.

### Phase 4: Social Posts + Polish (Week 4)

**Goal:** Social post generation, UX polish, and deployment.

- [x] Social post generation service (3 variants per article)
- [ ] Social posts UI (view variants, copy to clipboard, mark as used)
- [ ] Deploy to Vercel
- [ ] Connect custom domain (optional: engine.socalcalibration.com or similar)
- [x] Environment variable configuration (Gemini API key, Supabase, WordPress)
- [ ] Error handling and retry logic for LLM calls
- [ ] Rate limiting for Gemini API
- [ ] Basic analytics on dashboard (articles published this month, top SEO scores)

**Deliverable:** Production-ready content engine generating articles and social posts, pushing to WordPress.

### Phase 5: Automation + Knowledge Maintenance (Week 5–6, Optional)

**Goal:** Reduce manual work with scheduling, autopilot, and knowledge base maintenance.

- [ ] Scheduled generation (generate N articles per day automatically, respecting velocity limits)
- [ ] Content calendar view (see what's scheduled, what's published)
- [ ] Auto-push to WordPress on schedule
- [ ] Keyword overlap detection (flag if engine targets same keyword as existing page)
- [ ] Internal link analysis (identify articles that should cross-link)
- [ ] SEO trend dashboard (average scores over time, content coverage map)
- [ ] Semi-automated knowledge freshness alerts (email/Slack when KB files are stale)
- [ ] Knowledge base update workflow (flag standards that may have been revised)

**Content Velocity Ramping Schedule:**

| Month | Max Articles | Cumulative | Blog Size |
|-------|-------------|------------|-----------|
| 1 | 12 | 12 | Establishing |
| 2 | 12 | 24 | Building trust |
| 3 | 20 | 44 | Ramp if GSC signals positive |
| 4 | 20 | 64 | Steady growth |
| 5 | 30 | 94 | Full velocity |
| 6 | 30 | 124 | Mature blog |

**Deliverable:** Hands-off content pipeline — articles generated, scored, and pushed to WordPress on autopilot with proper velocity ramping.

### Phase 6: Advanced Features (Future)

- [ ] AI image generation (article hero images via Gemini)
- [ ] Competitor keyword analysis
- [ ] Google Search Console integration (track actual ranking performance)
- [ ] Content refresh (identify old articles that need updating)
- [ ] A/B title testing
- [ ] LinkedIn API integration for direct social posting
- [ ] GMB post generation and scheduling
- [ ] LLM-powered knowledge freshness checks (search for standard updates, produce diff summary)

---

## 12. Cost Estimates

### Monthly Recurring Costs

| Service | Tier | Monthly Cost | Notes |
|---------|------|-------------|-------|
| Supabase | Free | $0 | 500MB DB, more than enough |
| Vercel | Hobby (free) | $0 | Sufficient for single-user dashboard |
| Gemini API | Pay-as-you-go | ~$1–3 | ~12 articles/month initially at ~$0.10–0.15 each |
| Inngest | Free | $0 | 5,000 runs/month free tier |
| Domain (optional) | — | ~$1 | If using custom subdomain |
| **Total** | | **~$1–4/month** | |

### Comparison with Current Vendor

| | 360searchvertising | Content Engine | Recommended Hybrid |
|---|---|---|---|
| Monthly cost | $400–500 | ~$3 | ~$150–200 + $3 |
| On-page content | 6 articles (thin, 400–500 words) | 8–30 articles (rich, 1,500–2,000 words, RAG-grounded) | Engine handles all content |
| Off-page SEO | GMB, links, guest blogs, directories | Not included | **Vendor retains all off-page** |
| SEO scoring | Unknown/manual | Algorithmic, real-time, 0–100 + fact density | Engine |
| Social posts | 15 (manual) | 24–90 (3 per article, auto-generated) | Engine |
| Meta tags | Manual | Auto-generated | Engine |
| JSON-LD schemas | Not included | Auto-generated | Engine |
| Internal linking | Not included | Auto-generated | Engine |
| WordPress integration | Manual | Automated (push as drafts) | Engine |
| Knowledge grounding | N/A | Standards, regulations, equipment specs | Engine |
| Turnaround | Days/weeks | Minutes | Engine |

### One-Time Costs

| Item | Cost | Notes |
|------|------|-------|
| Google Cloud account | $0 | $300 free credits for new accounts |
| Supabase account | $0 | Free tier setup |
| Vercel account | $0 | Free tier |
| RankMath plugin (WP) | $0 | Free version is sufficient |
| Development time | Your time | ~4–6 weeks for phases 1–4 |

---

## 13. Risk & Transition Strategy

### Content Velocity Risk

**Risk:** Publishing 30+ AI articles/month on a brand-new blog triggers Google's scaled content abuse detection (Firefly system). New domains/blogs without established authority are especially vulnerable.

**Mitigation:**
- Start at 8–12 articles/month (Month 1–2)
- Ramp to 20/month only after GSC shows positive indexing signals (Month 3–4)
- Full velocity (30/month) only after blog has 40+ indexed pages with positive engagement (Month 5+)
- Each article includes practitioner review placeholders — Parham's real-world notes add unique human signals
- RAG grounding ensures factual specificity that distinguishes content from generic AI output

### Local SEO Factor Allocation

**Risk:** Blog content accounts for ~10% of local ranking factors. Dropping the vendor entirely loses the ~52% from off-page activities (GBP ~32%, reviews ~20%).

**Mitigation:**
- Vendor retains **ALL off-page SEO work**: GMB optimization, guest blogs, directory submissions, link building, review management
- Engine replaces **only content deliverables**: SEO articles and blog posts
- Negotiate reduced vendor rate ($150–200/month for off-page only)
- Net savings: $200–350/month while maintaining full local SEO coverage

### Parallel Running Period (Months 1–3)

```
Month 1–2: PARALLEL
├── 360search continues ALL deliverables (no changes)
├── Content engine generates articles on NEW keywords only
├── Keyword overlap check before every batch
├── Monitor Google Search Console for both content sources
├── Compare: SEO scores, fact density, traffic, impressions
└── Velocity limit: max 12 articles/month

Month 3: EVALUATE
├── If engine articles perform ≥ vendor articles:
│   └── Tell vendor: "We're handling blog content in-house now"
│   └── Keep vendor for: GMB optimization + link building + guest blogs
│   └── Negotiate reduced rate ($150–200/month for off-page only)
├── If engine articles underperform:
│   └── Investigate: prompts? keyword targeting? knowledge base gaps?
│   └── Iterate and extend parallel period
└── Never delete existing vendor-written content

Month 4+: ENGINE OWNS ON-SITE CONTENT
├── Engine generates all articles, social posts, meta tags
├── Vendor handles GMB + link building + guest blogs (off-page)
├── Parham reviews practitioner notes and publishes from WordPress
└── Velocity ramps to 20–30 articles/month
```

### Critical Rules

1. **Never delete existing content** — even thin 400-word articles. They may have indexed value.
2. **Never target overlapping keywords** — check vendor's target keywords before generating. Avoid keyword cannibalization.
3. **Never change existing URLs** — breaks backlinks the vendor has built.
4. **Add, don't replace** — all engine content goes on NEW pages/URLs.
5. **Monitor rankings weekly** — if any existing page drops, investigate before generating more.
6. **Maintain off-page SEO** — vendor's link building, GMB, and guest blogs are higher-leverage than blog content for local rankings.

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
3. **Investigate root cause** (keyword conflict? content quality? Google algorithm update? velocity too high?)
4. **Adjust and retry** with smaller batches and lower velocity

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

## Appendix B: File Structure

```
socal-calibration-content-engine/
├── docs/
│   └── DESIGN.md                  # This document
├── knowledge-base/                # RAG knowledge base (curated Markdown)
│   ├── standards/                 # Regulatory & standards documents
│   │   ├── iso-17025-2017.md
│   │   ├── nist-traceability.md
│   │   ├── fda-21-cfr-820-72.md
│   │   ├── ansi-z540-3.md
│   │   ├── ilac-g24-intervals.md
│   │   └── osha-calibration-reqs.md
│   ├── equipment/                 # Equipment specs & calibration methods
│   │   ├── pressure-gauges.md
│   │   ├── industrial-scales.md
│   │   ├── multimeters.md
│   │   ├── torque-wrenches.md
│   │   ├── thermometers.md
│   │   └── calipers-micrometers.md
│   ├── industries/                # Industry-specific requirements
│   │   ├── pharmaceutical.md
│   │   ├── aerospace.md
│   │   ├── food-manufacturing.md
│   │   └── medical-devices.md
│   └── regional/                  # SoCal-specific information
│       ├── socal-industries.md
│       └── california-regulations.md
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
│   │       ├── knowledge/         # Knowledge base freshness API
│   │       ├── wordpress/         # WP sync endpoints
│   │       └── inngest/           # Inngest webhook handler
│   ├── lib/
│   │   ├── knowledge/             # Knowledge base retrieval (RAG)
│   │   │   ├── index.ts           # Exports
│   │   │   ├── loader.ts          # File parser, frontmatter extraction
│   │   │   ├── retrieval.ts       # Keyword-based retrieval & scoring
│   │   │   └── freshness.ts       # Knowledge freshness checker
│   │   ├── llm/                   # Gemini client, provider abstraction
│   │   ├── prompts/               # Article + keyword + social prompts
│   │   ├── seo/                   # SEO scoring algorithm (incl. fact density)
│   │   ├── services/              # Article generation, social generation
│   │   ├── wordpress/             # WP REST API client
│   │   └── db/                    # Supabase client + typed queries
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   └── ...                    # Feature-specific components
│   └── jobs/                      # Inngest job definitions
├── supabase/
│   ├── migrations/                # SQL migrations
│   │   ├── 20260313000001_initial_schema.sql
│   │   └── 20260317000001_knowledge_base_and_fact_density.sql
│   └── seeds/                     # Test data
│       └── seed.sql
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
